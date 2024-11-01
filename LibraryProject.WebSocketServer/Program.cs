using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RestSharp;
using System.Net.WebSockets;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// WebSocket middleware'ini ekleyin
app.UseWebSockets();

app.Map("/", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("Yeni bir istemci ba�land�.");

        // REST API'den veri �ekme
        var client = new RestClient();
        string endpoint = "https://localhost:7275/api/Author/GetAll";
        var request = new RestRequest(endpoint, Method.Get);
        var response = await client.ExecuteAsync(request);

        if (response.IsSuccessful)
        {
            // Gelen veriyi WebSocket �zerinden g�nderme
            var bytes = Encoding.UTF8.GetBytes(response.Content!);
            await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
        }
        else
        {
            Console.WriteLine("API iste�i ba�ar�s�z oldu: " + response.ErrorMessage);
            var errorMessage = Encoding.UTF8.GetBytes("API iste�i ba�ar�s�z oldu: " + response.ErrorMessage);
            await webSocket.SendAsync(new ArraySegment<byte>(errorMessage), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
        }

        // Mesaj alma d�ng�s�
        var buffer = new byte[1024 * 4];
        WebSocketReceiveResult result = null;

        try
        {
            do
            {
                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), System.Threading.CancellationToken.None);
                var receivedMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                Console.WriteLine("Gelen mesaj: " + receivedMessage);
            } while (!result.CloseStatus.HasValue);
        }
        catch (WebSocketException ex)
        {
            Console.WriteLine($"WebSocket hatas�: {ex.Message}");
        }
        finally
        {
            if (result != null && result.CloseStatus.HasValue)
            {
                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, System.Threading.CancellationToken.None);
                Console.WriteLine("�stemci ba�lant�s� kapand�.");
            }
        }
    }
    else
    {
        context.Response.StatusCode = 400; // Bad Request
    }
});

// API endpoint'leri
app.MapGet("/api/Author/GetAll", async context =>
{
    var client = new RestClient();
    string endpoint = "https://localhost:7275/api/Author/GetAll";
    var request = new RestRequest(endpoint, Method.Get);
    var response = await client.ExecuteAsync(request);

    context.Response.ContentType = "application/json";
    if (response.IsSuccessful)
    {
        await context.Response.WriteAsync(response.Content!);
    }
    else
    {
        context.Response.StatusCode = (int)response.StatusCode;
        await context.Response.WriteAsync("API iste�i ba�ar�s�z oldu.");
    }
});

// Sunucuyu ba�lat
app.Run("http://localhost:7276");
