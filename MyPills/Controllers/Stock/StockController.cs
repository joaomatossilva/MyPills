using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyPills;
using MyPills.Data;
using MyPills.Services;

namespace MyPills.Controllers.Stock;

[ApiController]
[Route("api/stock")]
[Authorize]
public sealed class StockController(ApplicationDbContext dbContext, IContextUser contextUser, ProfileAccessService profileAccessService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetStockEntriesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStockEntriesAsync()
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var viewableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.View).Select(x => x.Id);
        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var stockEntries = await dbContext.StockEntries
            .AsNoTracking()
            .Include(x => x.Medicine)
            .Include(x => x.Profile)
            .Where(x => viewableProfileIds.Contains(x.ProfileId))
            .OrderByDescending(x => x.Date)
            .Select(x => new GetStockEntriesItem
            {
                Id = x.Id,
                MedicineId = x.MedicineId,
                ProfileId = x.ProfileId,
                ProfileName = x.Profile.Name,
                MedicineName = x.Medicine.Name,
                Date = x.Date,
                Quantity = x.Quantity,
                Type = x.Type.ToString(),
                CanEdit = editableProfileIds.Contains(x.ProfileId)
            })
            .ToListAsync();

        return Ok(new GetStockEntriesResponse
        {
            StockEntries = stockEntries
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GetStockEntryDetailsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStockEntryDetailsAsync(Guid id)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var viewableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.View).Select(x => x.Id);
        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var stockEntry = await dbContext.StockEntries
            .AsNoTracking()
            .Include(x => x.Medicine)
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x => x.Id == id && viewableProfileIds.Contains(x.ProfileId));

        if (stockEntry is null)
        {
            return NotFound();
        }

        return Ok(new GetStockEntryDetailsResponse
        {
            Id = stockEntry.Id,
            MedicineId = stockEntry.MedicineId,
            ProfileId = stockEntry.ProfileId,
            ProfileName = stockEntry.Profile.Name,
            MedicineName = stockEntry.Medicine.Name,
            Date = stockEntry.Date,
            Quantity = stockEntry.Quantity,
            Type = stockEntry.Type.ToString(),
            CanEdit = await editableProfileIds.AnyAsync(x => x == stockEntry.ProfileId)
        });
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateStockEntryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateStockEntryAsync([FromBody] CreateStockEntryRequest request)
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

        if (request.MedicineId == Guid.Empty)
        {
            ModelState.AddModelError(nameof(CreateStockEntryRequest.MedicineId), "Medicine is required.");
            return ValidationProblem(ModelState);
        }

        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var medicine = await dbContext.Medicines
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x => x.Id == request.MedicineId && editableProfileIds.Contains(x.ProfileId));

        if (medicine is null)
        {
            return NotFound();
        }

        var now = DateTimeOffset.UtcNow;
        var today = DateTime.Today;
        var daysDiff = today.Subtract(medicine.StockDate.Date).Days;

        medicine.StockDate = today;
        medicine.StockQuantity = Math.Max(0, medicine.StockQuantity - daysDiff);
        medicine.StockQuantity = ApplyStockQuantity(
            request.Type,
            medicine.StockQuantity,
            request.Quantity,
            medicine.BoxSize);

        var stockEntry = new StockEntry
        {
            Id = Guid.NewGuid(),
            Date = now,
            MedicineId = request.MedicineId,
            ProfileId = medicine.ProfileId,
            Quantity = request.Quantity,
            Type = request.Type
        };

        dbContext.StockEntries.Add(stockEntry);
        await dbContext.SaveChangesAsync();

        var requiresPrescriptionDeduction = request.Type == StockEntryType.Box
            && await dbContext.Prescriptions
                .AsNoTracking()
                .AnyAsync(x =>
                    x.ProfileId == medicine.ProfileId
                    && x.ExpiryDate > today
                    && x.Medicines.Any(m => m.MedicineId == request.MedicineId && m.Quantity > m.ConsumedQuantity));

        return Created(
            Url.Action("GetStockEntryDetails", new { id = stockEntry.Id }),
            new CreateStockEntryResponse
            {
                Id = stockEntry.Id,
                MedicineId = stockEntry.MedicineId,
                ProfileId = stockEntry.ProfileId,
                ProfileName = medicine.Profile.Name,
                Date = stockEntry.Date,
                Quantity = stockEntry.Quantity,
                Type = stockEntry.Type.ToString(),
                RequiresPrescriptionDeduction = requiresPrescriptionDeduction,
                DeductionBoxes = requiresPrescriptionDeduction ? stockEntry.Quantity : 0
            });
    }

    private static int ApplyStockQuantity(StockEntryType type, int currentQuantity, int quantity, int boxSize)
    {
        return type switch
        {
            StockEntryType.Box => currentQuantity + (quantity * boxSize),
            StockEntryType.Increase => currentQuantity + quantity,
            StockEntryType.Decrease => Math.Max(0, currentQuantity - quantity),
            StockEntryType.Set => quantity,
            _ => throw new InvalidOperationException($"Unsupported stock entry type '{type}'.")
        };
    }

    [HttpGet("prescription-deductions")]
    [ProducesResponseType(typeof(GetStockDeductionPreviewResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStockDeductionPreviewAsync([FromQuery] GetStockDeductionPreviewRequest request)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (request.MedicineId == Guid.Empty)
        {
            ModelState.AddModelError(nameof(GetStockDeductionPreviewRequest.MedicineId), "Medicine is required.");
            return ValidationProblem(ModelState);
        }

        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var medicine = await dbContext.Medicines
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.MedicineId && editableProfileIds.Contains(x.ProfileId));

        if (medicine is null)
        {
            return NotFound();
        }

        var boxes = request.Boxes;
        var today = DateTime.Today;
        var prescriptions = await dbContext.Prescriptions
            .AsNoTracking()
            .Include(x => x.Medicines)
            .Where(x =>
                x.ProfileId == medicine.ProfileId
                && x.ExpiryDate > today
                && x.Medicines.Any(m => m.MedicineId == request.MedicineId && m.Quantity > m.ConsumedQuantity))
            .OrderBy(x => x.Date)
            .ToListAsync();

        var responseItems = prescriptions.Select(x =>
        {
            var available = x.Medicines
                .Where(m => m.MedicineId == request.MedicineId)
                .Sum(m => m.Quantity - m.ConsumedQuantity);

            var quantity = boxes > available ? available : boxes;
            boxes -= quantity;
            if (boxes < 0)
            {
                boxes = 0;
            }

            return new GetStockDeductionPreviewPrescriptionItem
            {
                PrescriptionId = x.Id,
                Date = DateOnly.FromDateTime(x.Date),
                Available = available,
                Quantity = quantity
            };
        }).ToList();

        return Ok(new GetStockDeductionPreviewResponse
        {
            MedicineId = request.MedicineId,
            Boxes = request.Boxes,
            Prescriptions = responseItems
        });
    }

    [HttpPost("prescription-deductions")]
    [ProducesResponseType(typeof(ApplyStockDeductionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApplyStockDeductionAsync([FromBody] ApplyStockDeductionRequest request)
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (request.MedicineId == Guid.Empty)
        {
            ModelState.AddModelError(nameof(ApplyStockDeductionRequest.MedicineId), "Medicine is required.");
        }

        var duplicatePrescriptionIds = request.Prescriptions
            .GroupBy(x => x.PrescriptionId)
            .Where(x => x.Key != Guid.Empty && x.Count() > 1)
            .Select(x => x.Key)
            .ToArray();

        if (duplicatePrescriptionIds.Length > 0)
        {
            ModelState.AddModelError(nameof(ApplyStockDeductionRequest.Prescriptions), "Each prescription can only be provided once.");
        }

        if (request.Prescriptions.Any(x => x.PrescriptionId == Guid.Empty))
        {
            ModelState.AddModelError(nameof(ApplyStockDeductionRequest.Prescriptions), "Prescription is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var editableProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.Edit).Select(x => x.Id);
        var medicine = await dbContext.Medicines
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.MedicineId && editableProfileIds.Contains(x.ProfileId));

        if (medicine is null)
        {
            return NotFound();
        }

        var prescriptionIds = request.Prescriptions
            .Select(x => x.PrescriptionId)
            .Distinct()
            .ToArray();

        var prescriptions = await dbContext.Prescriptions
            .Include(x => x.Medicines)
            .Where(x => prescriptionIds.Contains(x.Id) && x.ProfileId == medicine.ProfileId && editableProfileIds.Contains(x.ProfileId))
            .ToListAsync();

        if (prescriptions.Count != prescriptionIds.Length)
        {
            return NotFound();
        }

        foreach (var requestedPrescription in request.Prescriptions)
        {
            var prescription = prescriptions.First(x => x.Id == requestedPrescription.PrescriptionId);
            var prescribedMedicine = prescription.Medicines
                .FirstOrDefault(x => x.MedicineId == request.MedicineId);

            if (prescribedMedicine is null)
            {
                return NotFound();
            }

            var available = prescribedMedicine.Quantity - prescribedMedicine.ConsumedQuantity;
            if (requestedPrescription.Quantity > available)
            {
                ModelState.AddModelError(
                    nameof(ApplyStockDeductionRequest.Prescriptions),
                    $"Prescription {requestedPrescription.PrescriptionId} only has {available} boxes available for deduction.");
            }
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var updatedPrescriptions = 0;
        foreach (var requestedPrescription in request.Prescriptions.Where(x => x.Quantity > 0))
        {
            var prescription = prescriptions.First(x => x.Id == requestedPrescription.PrescriptionId);
            var prescribedMedicine = prescription.Medicines
                .First(x => x.MedicineId == request.MedicineId);

            prescribedMedicine.ConsumedQuantity += requestedPrescription.Quantity;
            updatedPrescriptions++;
        }

        await dbContext.SaveChangesAsync();

        return Ok(new ApplyStockDeductionResponse
        {
            MedicineId = request.MedicineId,
            UpdatedPrescriptions = updatedPrescriptions
        });
    }
}
