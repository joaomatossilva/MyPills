using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Profiles;

public sealed class ShareProfileRequest
{
    [Required]
    [RegularExpression("^[A-Za-z0-9]{6}$")]
    public string UserCode { get; init; } = string.Empty;

    [Required]
    public string Permission { get; init; } = string.Empty;
}
