using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Profiles;

public sealed class UpdateProfileRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; init; } = string.Empty;
}
