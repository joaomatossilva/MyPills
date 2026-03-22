using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Profiles;

public sealed class CreateProfileRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; init; } = string.Empty;
}
