using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Pages;

public class IndexModel(ApplicationDbContext dbContext) : PageModel
{
    public IActionResult OnGetAsync()
    {
        if (User?.Identity?.IsAuthenticated == true)
        {
            return RedirectToPage("/Overview");
        }
        
        return Page();
    }
}