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
            .OrderByDescending(x => x.IsDefault)
            .ThenBy(x => x.Name)
            .Select(x => new GetOwnedProfilesItem
            {
                Id = x.Id,
                Name = x.Name,
                IsDefault = x.IsDefault
            })
            .ToListAsync();

        return Ok(new GetOwnedProfilesResponse
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

        if (contextUser.UserId is null)
        {
            return Unauthorized();
        }

        var profile = await profileAccessService.GetOwnedProfileAsync(id);
        if (profile is null)
        {
            return NotFound();
        }

        return Ok(new GetProfileDetailsResponse
        {
            Id = profile.Id,
            Name = profile.Name,
            IsDefault = profile.IsDefault,
            OwnerUsername = profile.Owner.UserName ?? profile.Owner.Email ?? string.Empty
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
}
