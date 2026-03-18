using System.Net.Http.Json;
using System.Text.Json;

namespace MyPills.Api.IntegrationTests.Infrastructure;

internal static class HttpResponseMessageExtensions
{
    public static async Task<JsonElement> ReadJsonAsync(this HttpResponseMessage response)
    {
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }
}
