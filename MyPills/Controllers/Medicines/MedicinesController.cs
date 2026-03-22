using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Controllers.Medicines;

[ApiController]
[Route("api/medicines")]
[Authorize]
public sealed class MedicinesController(ApplicationDbContext dbContext, IContextUser contextUser) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetMedicinesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMedicinesAsync()
    {
        var medicines = await dbContext.Medicines
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new GetMedicinesItem
            {
                Id = x.Id,
                Name = x.Name,
                BoxSize = x.BoxSize,
                DailyConsumption = x.DailyConsumption
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
        var medicine = await dbContext.Medicines
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (medicine is null)
        {
            return NotFound();
        }

        var stockEntries = await dbContext.StockEntries
            .AsNoTracking()
            .Where(x => x.MedicineId == id)
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
            Name = medicine.Name,
            BoxSize = medicine.BoxSize,
            DailyConsumption = medicine.DailyConsumption,
            StockQuantity = medicine.StockQuantity,
            StockDate = medicine.StockDate == default ? null : medicine.StockDate,
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
            ModelState.AddModelError(nameof(CreateMedicineRequest.Name), "Name is required.");
            return ValidationProblem(ModelState);
        }

        var medicine = new Medicine
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            BoxSize = request.BoxSize,
            DailyConsumption = request.DailyConsumption
        };

        dbContext.Medicines.Add(medicine);
        await dbContext.SaveChangesAsync();

        var response = new CreateMedicineResponse
        {
            Id = medicine.Id,
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

        var medicine = await dbContext.Medicines
            .FirstOrDefaultAsync(x => x.Id == id);

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
        var medicine = await dbContext.Medicines
            .FirstOrDefaultAsync(x => x.Id == id);

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
