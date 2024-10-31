using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RestSharp;
using System.Net.WebSockets;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// WebSocket middleware'ini ekleyin
app.UseWebSockets();

app.Map("/", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("Yeni bir istemci baðlandý.");

        
        var client = new RestClient();
        string endpoint = "https://localhost:7275/api/Author/GetAll";
        var request = new RestRequest(endpoint, Method.Get);
        var response = await client.ExecuteAsync(request);

        var bytes = System.Text.Encoding.UTF8.GetBytes(response.Content);
        await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);

        // Mesaj alma döngüsü
        var buffer = new byte[1024 * 4];
        WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), System.Threading.CancellationToken.None);
        while (!result.CloseStatus.HasValue)
        {
            Console.WriteLine("Gelen mesaj: " + System.Text.Encoding.UTF8.GetString(buffer, 0, result.Count));
            result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), System.Threading.CancellationToken.None);
        }

        await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, System.Threading.CancellationToken.None);
        Console.WriteLine("Ýstemci baðlantýsý kapandý.");
    }
    else
    {
        context.Response.StatusCode = 400; // Bad Request
    }
});

// API endpoint'leri veya diðer middleware'ler ekleyin
app.MapGet("/api/Author/GetAll", async context =>
{
    var client = new RestClient();
    string endpoint = "https://localhost:7275/api/Author/GetAll";
    var request = new RestRequest(endpoint, Method.Get);
    var response = await client.ExecuteAsync(request);
    
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(response.Content!);
});

// Sunucuyu baþlat
app.Run("http://localhost:7276");
