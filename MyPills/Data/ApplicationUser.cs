using Microsoft.AspNetCore.Identity;

namespace MyPills.Data;

public sealed class ApplicationUser : IdentityUser
{
    public ICollection<Profile> OwnedProfiles { get; set; } = [];
}
