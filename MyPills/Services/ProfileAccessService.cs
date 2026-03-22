using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Services;

public sealed class ProfileAccessService(ApplicationDbContext dbContext, IContextUser contextUser)
{
    public async Task EnsureCurrentUserInitializedAsync()
    {
        var userId = contextUser.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return;
        }

        var userExists = await dbContext.Users.AnyAsync(x => x.Id == userId);
        if (!userExists)
        {
            return;
        }

        var hasDefaultProfile = await dbContext.Profiles.AnyAsync(x => x.OwnerId == userId && x.IsDefault);
        if (hasDefaultProfile)
        {
            return;
        }

        dbContext.Profiles.Add(new Profile
        {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            Name = "Default Profile",
            IsDefault = true
        });

        await dbContext.SaveChangesAsync();
    }

    public IQueryable<Profile> QueryOwnedProfiles()
    {
        var userId = contextUser.UserId;
        return dbContext.Profiles.Where(x => userId != null && x.OwnerId == userId);
    }

    public IQueryable<Profile> QueryOwnedProfiles(Guid? profileId)
    {
        var profiles = QueryOwnedProfiles();
        if (profileId is Guid requestedProfileId)
        {
            profiles = profiles.Where(x => x.Id == requestedProfileId);
        }

        return profiles;
    }

    public async Task<Profile?> GetOwnedProfileAsync(Guid profileId)
    {
        return await QueryOwnedProfiles()
            .Include(x => x.Owner)
            .FirstOrDefaultAsync(x => x.Id == profileId);
    }
}
