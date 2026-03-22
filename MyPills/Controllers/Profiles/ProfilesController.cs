using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;
using MyPills.Services;

namespace MyPills.Controllers.Profiles;

[ApiController]
[Route("api/profiles")]
[Authorize]
public sealed class ProfilesController(ApplicationDbContext dbContext, IContextUser contextUser, ProfileAccessService profileAccessService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetOwnedProfilesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetOwnedProfilesAsync()
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var profiles = await profileAccessService.QueryOwnedProfiles()
            .AsNoTracking()
            .Include(x => x.Shares)
            .OrderByDescending(x => x.IsDefault)
            .ThenBy(x => x.Name)
            .Select(x => new GetOwnedProfilesItem
            {
                Id = x.Id,
                Name = x.Name,
                IsDefault = x.IsDefault,
                ShareCount = x.Shares.Count
            })
            .ToListAsync();

        return Ok(new GetOwnedProfilesResponse
        {
            Profiles = profiles
        });
    }

    [HttpGet("shared")]
    [ProducesResponseType(typeof(GetSharedProfilesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSharedProfilesAsync()
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var userId = contextUser.UserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var profiles = await dbContext.ProfileShares
            .AsNoTracking()
            .Include(x => x.Profile)
            .ThenInclude(x => x.Owner)
            .Where(x => x.SharedWithUserId == userId)
            .OrderBy(x => x.Profile.Name)
            .Select(x => new GetSharedProfilesItem
            {
                Id = x.ProfileId,
                Name = x.Profile.Name,
                OwnerUsername = x.Profile.Owner.UserName ?? x.Profile.Owner.Email ?? string.Empty,
                Permission = x.Permission.ToString().ToLowerInvariant()
            })
            .ToListAsync();

        return Ok(new GetSharedProfilesResponse
        {
            Profiles = profiles
        });
    }

    [HttpGet("editable")]
    [ProducesResponseType(typeof(GetEditableProfilesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetEditableProfilesAsync()
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var userId = contextUser.UserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var profiles = await profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit)
            .AsNoTracking()
            .Include(x => x.Owner)
            .OrderByDescending(x => x.OwnerId == userId)
            .ThenByDescending(x => x.IsDefault)
            .ThenBy(x => x.Name)
            .Select(x => new GetEditableProfilesItem
            {
                Id = x.Id,
                Name = x.Name,
                OwnerUsername = x.Owner.UserName ?? x.Owner.Email ?? string.Empty,
                IsOwned = x.OwnerId == userId
            })
            .ToListAsync();

        return Ok(new GetEditableProfilesResponse
        {
            Profiles = profiles
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GetProfileDetailsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfileDetailsAsync(Guid id)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var userId = contextUser.UserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var profile = await profileAccessService.GetAccessibleProfileAsync(id, ProfilePermission.View);
        if (profile is null)
        {
            return NotFound();
        }

        var share = profile.Shares.FirstOrDefault(x => x.SharedWithUserId == userId);
        return Ok(new GetProfileDetailsResponse
        {
            Id = profile.Id,
            Name = profile.Name,
            IsDefault = profile.IsDefault,
            IsOwner = profile.OwnerId == userId,
            OwnerUsername = profile.Owner.UserName ?? profile.Owner.Email ?? string.Empty,
            Permission = (profile.OwnerId == userId ? ProfilePermission.Edit : share?.Permission ?? ProfilePermission.View).ToString().ToLowerInvariant(),
            Shares = profile.OwnerId == userId
                ? profile.Shares
                    .OrderBy(x => x.SharedWithUser.UserName ?? x.SharedWithUser.Email)
                    .Select(x => new GetProfileShareItem
                    {
                        Id = x.Id,
                        SharedWithUsername = x.SharedWithUser.UserName ?? x.SharedWithUser.Email ?? string.Empty,
                        SharedWithUserCode = x.SharedWithUser.ShareCode,
                        Permission = x.Permission.ToString().ToLowerInvariant()
                    })
                    .ToList()
                : []
        });
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateProfileResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateProfileAsync([FromBody] CreateProfileRequest request)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var userId = contextUser.UserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            ModelState.AddModelError(nameof(CreateProfileRequest.Name), "Name is required.");
            return ValidationProblem(ModelState);
        }

        var profile = new Profile
        {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            Name = name,
            IsDefault = false
        };

        dbContext.Profiles.Add(profile);
        await dbContext.SaveChangesAsync();

        return Created(
            Url.Action("GetProfileDetails", new { id = profile.Id }),
            new CreateProfileResponse
            {
                Id = profile.Id,
                Name = profile.Name,
                IsDefault = profile.IsDefault
            });
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UpdateProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfileAsync(Guid id, [FromBody] UpdateProfileRequest request)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        if (contextUser.UserId is null)
        {
            return Unauthorized();
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            ModelState.AddModelError(nameof(UpdateProfileRequest.Name), "Name is required.");
            return ValidationProblem(ModelState);
        }

        var profile = await profileAccessService.GetOwnedProfileAsync(id);
        if (profile is null)
        {
            return NotFound();
        }

        profile.Name = name;
        await dbContext.SaveChangesAsync();

        return Ok(new UpdateProfileResponse
        {
            Id = profile.Id,
            Name = profile.Name,
            IsDefault = profile.IsDefault
        });
    }

    [HttpGet("user-code")]
    [ProducesResponseType(typeof(GetCurrentUserCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUserCodeAsync()
    {
        var shareCode = await profileAccessService.GetCurrentUserCodeAsync();
        if (shareCode is null)
        {
            return Unauthorized();
        }

        return Ok(new GetCurrentUserCodeResponse
        {
            ShareCode = shareCode
        });
    }

    [HttpPost("user-code/regenerate")]
    [ProducesResponseType(typeof(RegenerateUserCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RegenerateCurrentUserCodeAsync()
    {
        var shareCode = await profileAccessService.RegenerateCurrentUserCodeAsync();
        if (shareCode is null)
        {
            return Unauthorized();
        }

        return Ok(new RegenerateUserCodeResponse
        {
            ShareCode = shareCode
        });
    }

    [HttpPost("{id:guid}/shares")]
    [ProducesResponseType(typeof(ShareProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ShareProfileAsync(Guid id, [FromBody] ShareProfileRequest request)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var ownerUserId = contextUser.UserId;
        if (ownerUserId is null)
        {
            return Unauthorized();
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (!TryParsePermission(request.Permission, out var permission))
        {
            ModelState.AddModelError(nameof(ShareProfileRequest.Permission), "Permission must be 'view' or 'edit'.");
            return ValidationProblem(ModelState);
        }

        var profile = await profileAccessService.GetOwnedProfileAsync(id);
        if (profile is null)
        {
            return NotFound();
        }

        var targetUser = await profileAccessService.FindUserByShareCodeAsync(request.UserCode);
        if (targetUser is null)
        {
            ModelState.AddModelError(nameof(ShareProfileRequest.UserCode), "User code was not found.");
            return ValidationProblem(ModelState);
        }

        if (targetUser.Id == ownerUserId)
        {
            ModelState.AddModelError(nameof(ShareProfileRequest.UserCode), "You cannot share a profile with yourself.");
            return ValidationProblem(ModelState);
        }

        var share = profile.Shares.FirstOrDefault(x => x.SharedWithUserId == targetUser.Id);
        if (share is null)
        {
            share = new ProfileShare
            {
                Id = Guid.NewGuid(),
                ProfileId = profile.Id,
                SharedWithUserId = targetUser.Id,
                Permission = permission
            };

            dbContext.ProfileShares.Add(share);
        }
        else
        {
            share.Permission = permission;
        }

        await dbContext.SaveChangesAsync();

        return Ok(new ShareProfileResponse
        {
            Id = share.Id,
            SharedWithUsername = targetUser.UserName ?? targetUser.Email ?? string.Empty,
            SharedWithUserCode = targetUser.ShareCode,
            Permission = share.Permission.ToString().ToLowerInvariant()
        });
    }

    [HttpDelete("{id:guid}/shares/{shareId:guid}")]
    [ProducesResponseType(typeof(RemoveProfileShareResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveProfileShareAsync(Guid id, Guid shareId)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        if (contextUser.UserId is null)
        {
            return Unauthorized();
        }

        var profile = await profileAccessService.GetOwnedProfileAsync(id);
        if (profile is null)
        {
            return NotFound();
        }

        var share = profile.Shares.FirstOrDefault(x => x.Id == shareId);
        if (share is null)
        {
            return NotFound();
        }

        dbContext.ProfileShares.Remove(share);
        await dbContext.SaveChangesAsync();

        return Ok(new RemoveProfileShareResponse
        {
            ProfileId = id,
            ShareId = shareId
        });
    }

    private static bool TryParsePermission(string? value, out ProfilePermission permission)
    {
        permission = default;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        return value.Trim().ToLowerInvariant() switch
        {
            "view" => SetPermission(ProfilePermission.View, out permission),
            "edit" => SetPermission(ProfilePermission.Edit, out permission),
            _ => false
        };
    }

    private static bool SetPermission(ProfilePermission parsedPermission, out ProfilePermission permission)
    {
        permission = parsedPermission;
        return true;
    }
}
