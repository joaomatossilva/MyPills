using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using MyPills;
using MyPills.Data;

namespace MyPills.Api.IntegrationTests.Infrastructure;

internal sealed class MyPillsApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string databaseName = Guid.NewGuid().ToString("N");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration(configurationBuilder =>
        {
            configurationBuilder.AddInMemoryCollection(
            [
                new KeyValuePair<string, string?>("ConnectionStrings:DefaultConnection", "Server=(localdb)\\MSSQLLocalDB;Database=MyPillsTests;Trusted_Connection=True;"),
                new KeyValuePair<string, string?>("Authentication:Google:ClientId", "integration-test-client-id"),
                new KeyValuePair<string, string?>("Authentication:Google:ClientSecret", "integration-test-client-secret")
            ]);
        });

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<ApplicationDbContext>();
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll(typeof(IDbContextOptionsConfiguration<ApplicationDbContext>));
            services.RemoveAll<IContextUser>();

            services.AddScoped<IContextUser, TestContextUser>();
            services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = TestAuthenticationHandler.SchemeName;
                    options.DefaultChallengeScheme = TestAuthenticationHandler.SchemeName;
                    options.DefaultScheme = TestAuthenticationHandler.SchemeName;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>(
                    TestAuthenticationHandler.SchemeName,
                    _ => { });

            services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
            {
                options.UseInMemoryDatabase(databaseName);
            });
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.EnsureCreated();
        SeedAuthenticatedUser(dbContext);

        return host;
    }

    public HttpClient CreateApiClient(string? userId = null, string? userName = null)
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        if (!string.IsNullOrWhiteSpace(userId))
        {
            client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserIdHeader, userId);
        }

        if (!string.IsNullOrWhiteSpace(userName))
        {
            client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserNameHeader, userName);
        }

        return client;
    }

    public async Task SeedAsync(params object[] entities)
    {
        await using var scope = Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        dbContext.AddRange(entities);
        await dbContext.SaveChangesAsync();
    }

    public async Task<T> ExecuteDbContextAsync<T>(Func<ApplicationDbContext, Task<T>> action)
    {
        await using var scope = Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await action(dbContext);
    }

    public async Task ExecuteDbContextAsync(Func<ApplicationDbContext, Task> action)
    {
        await using var scope = Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await action(dbContext);
    }

    public async Task<Profile> GetDefaultProfileAsync(string? ownerUserId = null)
    {
        await using var scope = Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var profile = await dbContext.Profiles
            .AsNoTracking()
            .FirstAsync(x => x.OwnerId == (ownerUserId ?? TestAuthenticationHandler.UserId) && x.IsDefault);

        return profile;
    }

    public async Task SeedUserAsync(string userId, string userName)
    {
        await using var scope = Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (await dbContext.Users.AnyAsync(x => x.Id == userId))
        {
            return;
        }

        dbContext.Users.Add(new ApplicationUser
        {
            Id = userId,
            UserName = userName,
            NormalizedUserName = userName.ToUpperInvariant(),
            Email = userName,
            NormalizedEmail = userName.ToUpperInvariant(),
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString("N")
        });

        EnsureDefaultProfile(dbContext, userId);
        await dbContext.SaveChangesAsync();
    }

    private static void SeedAuthenticatedUser(ApplicationDbContext dbContext)
    {
        var existingUser = dbContext.Users.FirstOrDefault(x => x.Id == TestAuthenticationHandler.UserId);
        if (existingUser is not null)
        {
            EnsureDefaultProfile(dbContext, existingUser.Id);
            return;
        }

        var user = new ApplicationUser
        {
            Id = TestAuthenticationHandler.UserId,
            UserName = TestAuthenticationHandler.UserName,
            NormalizedUserName = TestAuthenticationHandler.UserName.ToUpperInvariant(),
            Email = TestAuthenticationHandler.UserName,
            NormalizedEmail = TestAuthenticationHandler.UserName.ToUpperInvariant(),
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString("N")
        };

        dbContext.Users.Add(user);
        EnsureDefaultProfile(dbContext, user.Id);

        dbContext.SaveChanges();
    }

    private static void EnsureDefaultProfile(ApplicationDbContext dbContext, string ownerId)
    {
        if (dbContext.Profiles.Any(x => x.OwnerId == ownerId && x.IsDefault))
        {
            return;
        }

        dbContext.Profiles.Add(new Profile
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Name = "Default Profile",
            IsDefault = true
        });
    }
}
