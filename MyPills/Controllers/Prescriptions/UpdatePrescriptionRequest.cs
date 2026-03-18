using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Prescriptions;

public sealed class UpdatePrescriptionRequest
{
    [Required]
    public DateOnly? Date { get; init; }

    [Required]
    public DateOnly? ExpiryDate { get; init; }
}

