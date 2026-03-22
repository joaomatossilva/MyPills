using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyPills;
using MyPills.Data;
using MyPills.Services;

namespace MyPills.Controllers.Prescriptions;

[ApiController]
[Route("api/prescriptions")]
[Authorize]
public sealed class PrescriptionsController(ApplicationDbContext dbContext, IContextUser contextUser, ProfileAccessService profileAccessService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetPrescriptionsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPrescriptionsAsync()
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var viewableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.View).Select(x => x.Id);
        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var prescriptions = await dbContext.Prescriptions
            .AsNoTracking()
            .Include(x => x.Profile)
            .Where(x => viewableProfileIds.Contains(x.ProfileId))
            .OrderByDescending(x => x.Date)
            .ToListAsync();

        return Ok(new GetPrescriptionsResponse
        {
            Prescriptions = prescriptions.Select(x => new GetPrescriptionsItem
            {
                Id = x.Id,
                ProfileId = x.ProfileId,
                ProfileName = x.Profile.Name,
                Date = DateOnly.FromDateTime(x.Date),
                ExpiryDate = DateOnly.FromDateTime(x.ExpiryDate),
                CanEdit = editableProfileIds.Contains(x.ProfileId)
            }).ToList()
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GetPrescriptionDetailsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPrescriptionDetailsAsync(Guid id)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var viewableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.View).Select(x => x.Id);
        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var prescription = await dbContext.Prescriptions
            .AsNoTracking()
            .Include(x => x.Profile)
            .Include(x => x.Medicines)
            .ThenInclude(x => x.Medicine)
            .AsSplitQuery()
            .FirstOrDefaultAsync(x => x.Id == id && viewableProfileIds.Contains(x.ProfileId));

        if (prescription is null)
        {
            return NotFound();
        }

        return Ok(new GetPrescriptionDetailsResponse
        {
            Id = prescription.Id,
            ProfileId = prescription.ProfileId,
            ProfileName = prescription.Profile.Name,
            Date = DateOnly.FromDateTime(prescription.Date),
            ExpiryDate = DateOnly.FromDateTime(prescription.ExpiryDate),
            CanEdit = await editableProfileIds.AnyAsync(x => x == prescription.ProfileId),
            Medicines = prescription.Medicines
                .OrderBy(x => x.Medicine.Name)
                .Select(x => new GetPrescriptionDetailsMedicineItem
                {
                    MedicineId = x.MedicineId,
                    MedicineName = x.Medicine.Name,
                    BoxSize = x.Medicine.BoxSize,
                    Quantity = x.Quantity,
                    ConsumedQuantity = x.ConsumedQuantity
                })
                .ToList()
        });
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreatePrescriptionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreatePrescriptionAsync([FromBody] CreatePrescriptionRequest request)
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

        if (!TryValidatePrescriptionDates(
                request.Date,
                request.ExpiryDate,
                nameof(CreatePrescriptionRequest.Date),
                nameof(CreatePrescriptionRequest.ExpiryDate),
                out var date,
                out var expiryDate))
        {
            return ValidationProblem(ModelState);
        }

        if (request.ProfileId == Guid.Empty)
        {
            ModelState.AddModelError(nameof(CreatePrescriptionRequest.ProfileId), "Profile is required.");
            return ValidationProblem(ModelState);
        }

        var profile = await profileAccessService.GetAccessibleProfileAsync(request.ProfileId, ProfilePermission.Edit);
        if (profile is null)
        {
            return NotFound();
        }

        var prescription = new Prescription
        {
            Id = Guid.NewGuid(),
            ProfileId = profile.Id,
            Date = date.ToDateTime(TimeOnly.MinValue),
            ExpiryDate = expiryDate.ToDateTime(TimeOnly.MinValue)
        };

        dbContext.Prescriptions.Add(prescription);
        await dbContext.SaveChangesAsync();

        return Created(
            Url.Action("GetPrescriptionDetails", new { id = prescription.Id }),
            new CreatePrescriptionResponse
            {
                Id = prescription.Id,
                ProfileId = profile.Id,
                ProfileName = profile.Name,
                Date = date,
                ExpiryDate = expiryDate
            });
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UpdatePrescriptionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePrescriptionAsync(Guid id, [FromBody] UpdatePrescriptionRequest request)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (!TryValidatePrescriptionDates(
                request.Date,
                request.ExpiryDate,
                nameof(UpdatePrescriptionRequest.Date),
                nameof(UpdatePrescriptionRequest.ExpiryDate),
                out var date,
                out var expiryDate))
        {
            return ValidationProblem(ModelState);
        }

        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var prescription = await dbContext.Prescriptions
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x => x.Id == id && editableProfileIds.Contains(x.ProfileId));

        if (prescription is null)
        {
            return NotFound();
        }

        prescription.Date = date.ToDateTime(TimeOnly.MinValue);
        prescription.ExpiryDate = expiryDate.ToDateTime(TimeOnly.MinValue);
        await dbContext.SaveChangesAsync();

        return Ok(new UpdatePrescriptionResponse
        {
            Id = prescription.Id,
            ProfileId = prescription.ProfileId,
            ProfileName = prescription.Profile.Name,
            Date = date,
            ExpiryDate = expiryDate
        });
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(DeletePrescriptionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePrescriptionAsync(Guid id)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var prescription = await dbContext.Prescriptions
            .FirstOrDefaultAsync(x => x.Id == id && editableProfileIds.Contains(x.ProfileId));

        if (prescription is null)
        {
            return NotFound();
        }

        dbContext.Prescriptions.Remove(prescription);
        await dbContext.SaveChangesAsync();

        return Ok(new DeletePrescriptionResponse
        {
            Id = id
        });
    }

    [HttpPost("{id:guid}/medicines")]
    [ProducesResponseType(typeof(AddPrescriptionMedicineResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddPrescriptionMedicineAsync(Guid id, [FromBody] AddPrescriptionMedicineRequest request)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (request.MedicineId == Guid.Empty)
        {
            ModelState.AddModelError(nameof(AddPrescriptionMedicineRequest.MedicineId), "Medicine is required.");
            return ValidationProblem(ModelState);
        }

        if (request.ConsumedQuantity > request.Quantity)
        {
            ModelState.AddModelError(nameof(AddPrescriptionMedicineRequest.ConsumedQuantity), "Consumed quantity cannot exceed quantity.");
            return ValidationProblem(ModelState);
        }

        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var prescription = await dbContext.Prescriptions
            .Include(x => x.Medicines)
            .FirstOrDefaultAsync(x => x.Id == id && editableProfileIds.Contains(x.ProfileId));

        if (prescription is null)
        {
            return NotFound();
        }

        if (prescription.Medicines.Any(x => x.MedicineId == request.MedicineId))
        {
            ModelState.AddModelError(nameof(AddPrescriptionMedicineRequest.MedicineId), "This medicine is already on the prescription.");
            return ValidationProblem(ModelState);
        }

        var medicine = await dbContext.Medicines
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.MedicineId && editableProfileIds.Contains(x.ProfileId));

        if (medicine is null)
        {
            return NotFound();
        }

        if (medicine.ProfileId != prescription.ProfileId)
        {
            ModelState.AddModelError(nameof(AddPrescriptionMedicineRequest.MedicineId), "Medicine must belong to the same profile as the prescription.");
            return ValidationProblem(ModelState);
        }

        var prescribedMedicine = new PrescribedMedicine
        {
            PrescriptionId = id,
            MedicineId = request.MedicineId,
            Quantity = request.Quantity,
            ConsumedQuantity = request.ConsumedQuantity
        };

        prescription.Medicines.Add(prescribedMedicine);
        await dbContext.SaveChangesAsync();

        return Created(
            Url.Action("GetPrescriptionDetails", new { id }),
            new AddPrescriptionMedicineResponse
            {
                PrescriptionId = id,
                MedicineId = medicine.Id,
                MedicineName = medicine.Name,
                Quantity = prescribedMedicine.Quantity,
                ConsumedQuantity = prescribedMedicine.ConsumedQuantity
            });
    }

    [HttpPut("{id:guid}/medicines/{medicineId:guid}")]
    [ProducesResponseType(typeof(UpdatePrescriptionMedicineResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePrescriptionMedicineAsync(Guid id, Guid medicineId, [FromBody] UpdatePrescriptionMedicineRequest request)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (request.ConsumedQuantity > request.Quantity)
        {
            ModelState.AddModelError(nameof(UpdatePrescriptionMedicineRequest.ConsumedQuantity), "Consumed quantity cannot exceed quantity.");
            return ValidationProblem(ModelState);
        }

        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var prescription = await dbContext.Prescriptions
            .Include(x => x.Medicines)
            .ThenInclude(x => x.Medicine)
            .FirstOrDefaultAsync(x => x.Id == id && editableProfileIds.Contains(x.ProfileId));

        if (prescription is null)
        {
            return NotFound();
        }

        var prescribedMedicine = prescription.Medicines
            .FirstOrDefault(x => x.MedicineId == medicineId);

        if (prescribedMedicine is null)
        {
            return NotFound();
        }

        prescribedMedicine.Quantity = request.Quantity;
        prescribedMedicine.ConsumedQuantity = request.ConsumedQuantity;
        await dbContext.SaveChangesAsync();

        return Ok(new UpdatePrescriptionMedicineResponse
        {
            PrescriptionId = id,
            MedicineId = medicineId,
            MedicineName = prescribedMedicine.Medicine.Name,
            Quantity = prescribedMedicine.Quantity,
            ConsumedQuantity = prescribedMedicine.ConsumedQuantity
        });
    }

    [HttpDelete("{id:guid}/medicines/{medicineId:guid}")]
    [ProducesResponseType(typeof(DeletePrescriptionMedicineResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePrescriptionMedicineAsync(Guid id, Guid medicineId)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var prescription = await dbContext.Prescriptions
            .Include(x => x.Medicines)
            .FirstOrDefaultAsync(x => x.Id == id && editableProfileIds.Contains(x.ProfileId));

        if (prescription is null)
        {
            return NotFound();
        }

        var prescribedMedicine = prescription.Medicines
            .FirstOrDefault(x => x.MedicineId == medicineId);

        if (prescribedMedicine is null)
        {
            return NotFound();
        }

        dbContext.PrescribedMedicine.Remove(prescribedMedicine);
        await dbContext.SaveChangesAsync();

        return Ok(new DeletePrescriptionMedicineResponse
        {
            PrescriptionId = id,
            MedicineId = medicineId
        });
    }

    private bool TryValidatePrescriptionDates(
        DateOnly? date,
        DateOnly? expiryDate,
        string datePropertyName,
        string expiryDatePropertyName,
        out DateOnly validatedDate,
        out DateOnly validatedExpiryDate)
    {
        validatedDate = default;
        validatedExpiryDate = default;

        if (date is null)
        {
            ModelState.AddModelError(datePropertyName, "Date is required.");
        }

        if (expiryDate is null)
        {
            ModelState.AddModelError(expiryDatePropertyName, "Expiry date is required.");
        }

        if (date is null || expiryDate is null)
        {
            return false;
        }

        if (expiryDate < date)
        {
            ModelState.AddModelError(expiryDatePropertyName, "Expiry date cannot be before the prescription date.");
            return false;
        }

        validatedDate = date.Value;
        validatedExpiryDate = expiryDate.Value;
        return true;
    }
}

