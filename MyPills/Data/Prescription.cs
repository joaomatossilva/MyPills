using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace MyPills.Data;

public class Prescription
{
    public Guid Id { get; set; }
    public Guid ProfileId { get; set; }
    public Profile Profile { get; set; } = null!;
    [DisplayFormat(DataFormatString = "{0:d}")]
    public DateTime Date { get; set; }
    [DisplayFormat(DataFormatString = "{0:d}")]
    public DateTime ExpiryDate { get; set; }
    
    public ICollection<PrescribedMedicine> Medicines { get; set; } = [];
}

[PrimaryKey(nameof(PrescriptionId), nameof(MedicineId))]
public class PrescribedMedicine
{
    public Guid PrescriptionId { get; set; }
    public Prescription Prescription { get; set; } = null!;
    public Guid MedicineId { get; set; }
    public Medicine Medicine { get; set; } = null!;
    public int Quantity { get; set; }
    public int ConsumedQuantity { get; set; }
}
