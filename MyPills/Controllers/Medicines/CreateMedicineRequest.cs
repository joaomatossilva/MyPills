using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Medicines;

public sealed class CreateMedicineRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; init; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int BoxSize { get; init; }
}

