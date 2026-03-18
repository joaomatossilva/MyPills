using System.Globalization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyPills;
using MyPills.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IContextUser, HttpContextUser>();
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddLocalization();

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]
    {
        new CultureInfo("en"),
        new CultureInfo("pt")
    };

    options.DefaultRequestCulture = new RequestCulture("en");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
});

// Add controllers for API endpoints with camelCase JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddRazorPages(opt =>
{
});

builder.Services.AddAuthentication()
    .AddGoogle(opt =>
    {
        opt.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        opt.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Serve static files from wwwroot
app.UseRequestLocalization();

app.UseRouting();

app.UseAuthorization();

// Map API controllers and Razor Pages at root level
app.MapStaticAssets();
app.MapControllers();
if (!app.Environment.IsDevelopment())
{
    app.MapGet("/", () => Results.File(
        Path.Combine(app.Environment.WebRootPath, "index.html"),
        "text/html"));
}
app.MapRazorPages()
    .WithStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.MapWhen(
        context => IsSpaRequest(context.Request.Path),
        appBuilder =>
        {
            appBuilder.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";
                spa.UseProxyToSpaDevelopmentServer("http://localhost:5173");
            });
        });
}
else
{
    app.MapFallbackToFile("{*path:nonfile}", "index.html");
}

app.Run();

static bool IsSpaRequest(PathString path)
{
    var pathValue = path.Value ?? string.Empty;

    return !path.StartsWithSegments("/api")
        && !path.StartsWithSegments("/Identity")
        && !path.StartsWithSegments("/lib")
        && !path.StartsWithSegments("/css")
        && !path.StartsWithSegments("/js")
        && !string.Equals(pathValue, "/favicon.ico", StringComparison.OrdinalIgnoreCase)
        && !string.Equals(pathValue, "/MyPills.styles.css", StringComparison.OrdinalIgnoreCase);
}
