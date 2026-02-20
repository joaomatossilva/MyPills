namespace MyPills;

public sealed class HttpContextUser(IHttpContextAccessor httpContextAccessor) : IContextUser
{
    public string? UserId
    {
        get
        {
            var user = httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true)
            {
                return null;
            }

            return user.GetUserId();
        }
    }
}
