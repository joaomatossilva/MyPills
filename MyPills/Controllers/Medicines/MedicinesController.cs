using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;
using MyPills.Services;

namespace MyPills.Controllers.Medicines;

[ApiController]
[Route("api/medicines")]
[Authorize]
public sealed class MedicinesController(ApplicationDbContext dbContext, IContextUser contextUser, ProfileAccessService profileAccessService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetMedicinesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMedicinesAsync([FromQuery] bool editableOnly = false, [FromQuery] Guid? profileId = null)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var ownedProfiles = profileAccessService.QueryOwnedProfiles(profileId);
        if (profileId.HasValue && !await ownedProfiles.AnyAsync())
        {
            return NotFound();
        }

        var ownedProfileIds = ownedProfiles.Select(x => x.Id);
        var medicines = await dbContext.Medicines
            .AsNoTracking()
            .Include(x => x.Profile)
            .Where(x => ownedProfileIds.Contains(x.ProfileId))
            .OrderBy(x => x.Name)
            .Select(x => new GetMedicinesItem
            {
                Id = x.Id,
                ProfileId = x.ProfileId,
                ProfileName = x.Profile.Name,
                Name = x.Name,
                BoxSize = x.BoxSize,
                DailyConsumption = x.DailyConsumption,
                CanEdit = true
            })
            .ToListAsync();

        return Ok(new GetMedicinesResponse
        {
            Medicines = medicines
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GetMedicineDetailsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMedicineDetailsAsync(Guid id)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var ownedProfileIds = profileAccessService.QueryOwnedProfiles().Select(x => x.Id);
        var medicine = await dbContext.Medicines
            .AsNoTracking()
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x => x.Id == id && ownedProfileIds.Contains(x.ProfileId));

        if (medicine is null)
        {
            return NotFound();
        }

        var stockEntries = await dbContext.StockEntries
            .AsNoTracking()
            .Where(x => x.MedicineId == id && x.ProfileId == medicine.ProfileId)
            .OrderByDescending(x => x.Date)
            .Select(x => new GetMedicineDetailsStockEntry
            {
                Id = x.Id,
                Date = x.Date,
                Quantity = x.Quantity,
                Type = x.Type
            })
            .ToListAsync();

        var response = new GetMedicineDetailsResponse
        {
            Id = medicine.Id,
            ProfileId = medicine.ProfileId,
            ProfileName = medicine.Profile.Name,
            Name = medicine.Name,
            BoxSize = medicine.BoxSize,
            DailyConsumption = medicine.DailyConsumption,
            StockQuantity = medicine.StockQuantity,
            StockDate = medicine.StockDate == default ? null : medicine.StockDate,
            CanEdit = true,
            StockEntries = stockEntries
        };

        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateMedicineResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateMedicineAsync([FromBody] CreateMedicineRequest request)
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
            ModelState.AddModelError(nameof(CreateMedicineRequest.Name), "Name is required.");
            return ValidationProblem(ModelState);
        }

        if (request.ProfileId == Guid.Empty)
        {
            ModelState.AddModelError(nameof(CreateMedicineRequest.ProfileId), "Profile is required.");
            return ValidationProblem(ModelState);
        }

        var profile = await profileAccessService.GetOwnedProfileAsync(request.ProfileId);
        if (profile is null)
        {
            return NotFound();
        }

        var medicine = new Medicine
        {
            Id = Guid.NewGuid(),
            ProfileId = profile.Id,
            Name = name,
            BoxSize = request.BoxSize,
            DailyConsumption = request.DailyConsumption
        };

        dbContext.Medicines.Add(medicine);
        await dbContext.SaveChangesAsync();

        var response = new CreateMedicineResponse
        {
            Id = medicine.Id,
            ProfileId = profile.Id,
            ProfileName = profile.Name,
            Name = medicine.Name,
            BoxSize = medicine.BoxSize,
            DailyConsumption = medicine.DailyConsumption
        };

        return Created(Url.Action("GetMedicineDetails", new { id = medicine.Id }), response);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UpdateMedicineResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMedicineAsync(Guid id, [FromBody] UpdateMedicineRequest request)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            ModelState.AddModelError(nameof(UpdateMedicineRequest.Name), "Name is required.");
            return ValidationProblem(ModelState);
        }

        var editableProfileIds = profileAccessService.QueryOwnedProfiles().Select(x => x.Id);
        var medicine = await dbContext.Medicines
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x => x.Id == id && editableProfileIds.Contains(x.ProfileId));

        if (medicine is null)
        {
            return NotFound();
        }

        medicine.Name = name;
        medicine.BoxSize = request.BoxSize;
        medicine.DailyConsumption = request.DailyConsumption;
        await dbContext.SaveChangesAsync();

        var response = new UpdateMedicineResponse
        {
            Id = medicine.Id,
            ProfileId = medicine.ProfileId,
            ProfileName = medicine.Profile.Name,
            Name = medicine.Name,
            BoxSize = medicine.BoxSize,
            DailyConsumption = medicine.DailyConsumption
        };

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(DeleteMedicineResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMedicineAsync(Guid id)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var editableProfileIds = profileAccessService.QueryOwnedProfiles().Select(x => x.Id);
        var medicine = await dbContext.Medicines
            .FirstOrDefaultAsync(x => x.Id == id && editableProfileIds.Contains(x.ProfileId));

        if (medicine is null)
        {
            return NotFound();
        }

        dbContext.Medicines.Remove(medicine);
        await dbContext.SaveChangesAsync();

        return Ok(new DeleteMedicineResponse
        {
            Id = id
        });
    }
}
