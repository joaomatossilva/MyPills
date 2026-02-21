using Microsoft.AspNetCore.Mvc;
using MyPills.Controllers.Auth;

namespace MyPills.Controllers;

/// <summary>
/// Authentication API endpoints for checking user authentication status.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    /// <summary>
    /// Gets the current authentication status and username.
    /// </summary>
    /// <returns>Authentication status with username if authenticated</returns>
    [HttpGet("status")]
   //[ProduceResponseType(typeof(GetAuthStatusResponse), StatusCodes.Status200OK)]
    public IActionResult GetAuthStatus()
    {
        var response = new GetAuthStatusResponse
        {
            IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
            Username = User.Identity?.Name
        };

        return Ok(response);
    }
}



