namespace MyPills.Controllers.Medicines;

public sealed class UpdateMedicineResponse
{
    public Guid Id { get; init; }
    public Guid ProfileId { get; init; }
    public string ProfileName { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int BoxSize { get; init; }
    public int DailyConsumption { get; init; }
}

