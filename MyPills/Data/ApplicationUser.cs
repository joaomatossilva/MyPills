using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace MyPills.Data;

public sealed class ApplicationUser : IdentityUser
{
    [MaxLength(6)]
    public string ShareCode { get; set; } = string.Empty;

    public ICollection<Profile> OwnedProfiles { get; set; } = [];
    public ICollection<ProfileShare> SharedProfiles { get; set; } = [];
}
