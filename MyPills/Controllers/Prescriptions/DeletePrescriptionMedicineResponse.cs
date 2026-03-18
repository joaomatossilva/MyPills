namespace MyPills.Controllers.Prescriptions;

public sealed class DeletePrescriptionMedicineResponse
{
    public Guid PrescriptionId { get; init; }
    public Guid MedicineId { get; init; }
}

