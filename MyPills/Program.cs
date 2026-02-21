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

// Add controllers for API endpoints with camelCase JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "ClientApp/dist";
});

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddRazorPages(opt =>
{
    opt.Conventions.AuthorizePage("/Overview");
    opt.Conventions.AuthorizeFolder("/Stock");
    opt.Conventions.AuthorizeFolder("/Medicines");
    opt.Conventions.AuthorizeFolder("/Prescriptions");
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

app.UseRouting();

app.UseAuthorization();

// Map API controllers and Razor Pages at root level
app.MapStaticAssets();
app.MapRazorPages()
    .WithStaticAssets();
app.MapControllers();

// SPA Configuration - only for /app path
// This should be AFTER MapRazorPages so Razor Pages get priority
if (app.Environment.IsDevelopment())
{
    // In development, proxy /app to Vite dev server
    app.MapWhen(ctx => ctx.Request.Path.StartsWithSegments("/app"), appBuilder =>
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
    // In production, serve from built files
    app.UseSpaStaticFiles();
    app.MapWhen(ctx => ctx.Request.Path.StartsWithSegments("/app"), appBuilder =>
    {
        appBuilder.UseSpa(spa =>
        {
            spa.Options.SourcePath = "ClientApp";
        });
    });
}

app.Run();
