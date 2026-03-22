using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Services;

public sealed class ProfileAccessService(ApplicationDbContext dbContext, IContextUser contextUser)
{
    private const string ShareCodeCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    public async Task EnsureCurrentUserInitializedAsync()
    {
        var userId = contextUser.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return;
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null)
        {
            return;
        }

        var saveChanges = false;
        if (string.IsNullOrWhiteSpace(user.ShareCode))
        {
            user.ShareCode = await GenerateUniqueShareCodeAsync(user.Id);
            saveChanges = true;
        }

        var hasDefaultProfile = await dbContext.Profiles.AnyAsync(x => x.OwnerId == user.Id && x.IsDefault);
        if (!hasDefaultProfile)
        {
            dbContext.Profiles.Add(new Profile
            {
                Id = Guid.NewGuid(),
                OwnerId = user.Id,
                Name = "Default Profile",
                IsDefault = true
            });

            saveChanges = true;
        }

        if (saveChanges)
        {
            await dbContext.SaveChangesAsync();
        }
    }

    public IQueryable<Profile> QueryOwnedProfiles()
    {
        var userId = contextUser.UserId;
        return dbContext.Profiles.Where(x => userId != null && x.OwnerId == userId);
    }

    public IQueryable<Profile> QuerySharedProfiles()
    {
        var userId = contextUser.UserId;
        return dbContext.Profiles.Where(x =>
            userId != null
            && x.OwnerId != userId
            && x.Shares.Any(s => s.SharedWithUserId == userId));
    }

    public IQueryable<Profile> QueryAccessibleProfiles(ProfilePermission requiredPermission)
    {
        var userId = contextUser.UserId;
        return dbContext.Profiles.Where(x =>
            userId != null
            && (x.OwnerId == userId
                || x.Shares.Any(s => s.SharedWithUserId == userId && s.Permission >= requiredPermission)));
    }

    public async Task<Profile?> GetOwnedProfileAsync(Guid profileId)
    {
        return await QueryOwnedProfiles()
            .Include(x => x.Shares)
            .ThenInclude(x => x.SharedWithUser)
            .FirstOrDefaultAsync(x => x.Id == profileId);
    }

    public async Task<Profile?> GetAccessibleProfileAsync(Guid profileId, ProfilePermission requiredPermission)
    {
        return await QueryAccessibleProfiles(requiredPermission)
            .Include(x => x.Owner)
            .Include(x => x.Shares)
            .ThenInclude(x => x.SharedWithUser)
            .FirstOrDefaultAsync(x => x.Id == profileId);
    }

    public async Task<string?> GetCurrentUserCodeAsync()
    {
        await EnsureCurrentUserInitializedAsync();

        var userId = contextUser.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return null;
        }

        return await dbContext.Users
            .AsNoTracking()
            .Where(x => x.Id == userId)
            .Select(x => x.ShareCode)
            .FirstOrDefaultAsync();
    }

    public async Task<string?> RegenerateCurrentUserCodeAsync()
    {
        var userId = contextUser.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return null;
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null)
        {
            return null;
        }

        user.ShareCode = await GenerateUniqueShareCodeAsync(user.Id);
        await dbContext.SaveChangesAsync();
        return user.ShareCode;
    }

    public async Task<ApplicationUser?> FindUserByShareCodeAsync(string shareCode)
    {
        return await dbContext.Users
            .FirstOrDefaultAsync(x => x.ShareCode == shareCode);
    }

    private async Task<string> GenerateUniqueShareCodeAsync(string currentUserId)
    {
        while (true)
        {
            var candidate = GenerateShareCode();
            var exists = await dbContext.Users.AnyAsync(x => x.Id != currentUserId && x.ShareCode == candidate);
            if (!exists)
            {
                return candidate;
            }
        }
    }

    private static string GenerateShareCode()
    {
        Span<char> buffer = stackalloc char[6];
        for (var index = 0; index < buffer.Length; index++)
        {
            buffer[index] = ShareCodeCharacters[RandomNumberGenerator.GetInt32(ShareCodeCharacters.Length)];
        }

        return new string(buffer);
    }
}
