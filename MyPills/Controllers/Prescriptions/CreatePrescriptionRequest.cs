using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Prescriptions;

public sealed class CreatePrescriptionRequest
{
    [Required]
    public DateOnly? Date { get; init; }

    [Required]
    public DateOnly? ExpiryDate { get; init; }

    [Required]
    public Guid ProfileId { get; init; }
}

