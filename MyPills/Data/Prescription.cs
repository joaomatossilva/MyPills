using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MyPills.Data;

public class Prescription
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public virtual IdentityUser User { get; set; }
    [DisplayFormat(DataFormatString = "{0:d}")]
    public DateTime Date { get; set; }
    [DisplayFormat(DataFormatString = "{0:d}")]
    public DateTime ExpiryDate { get; set; }
    
    public ICollection<PrescribedMedicine> Medicines { get; set; }
}

[PrimaryKey(nameof(PrescriptionId), nameof(MedicineId))]
public class PrescribedMedicine
{
    public Guid PrescriptionId { get; set; }
    public virtual Prescription Prescription { get; set; }
    public Guid MedicineId { get; set; }
    public virtual Medicine Medicine { get; set; }
    public int Quantity { get; set; }
    public int ConsumedQuantity { get; set; }
}
