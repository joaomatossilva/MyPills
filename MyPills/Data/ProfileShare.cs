using Microsoft.EntityFrameworkCore;

namespace MyPills.Data;

[Index(nameof(ProfileId), nameof(SharedWithUserId), IsUnique = true)]
public sealed class ProfileShare
{
    public Guid Id { get; set; }

    public Guid ProfileId { get; set; }
    public Profile Profile { get; set; } = null!;

    public string SharedWithUserId { get; set; } = string.Empty;
    public ApplicationUser SharedWithUser { get; set; } = null!;

    public ProfilePermission Permission { get; set; }
}
