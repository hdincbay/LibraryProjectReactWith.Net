using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RestSharp;
using System.Net.WebSockets;
using System.Text;
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWebSockets();

var clients = new ConcurrentDictionary<WebSocket, string>(); // �stemci ba�lant�lar�n� saklamak i�in


app.Map("/AuthorList/", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        clients.TryAdd(webSocket, null);
        Console.WriteLine("Yeni bir istemci ba�land�.");
        await SendAllAuthors(webSocket);

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
            clients.TryRemove(webSocket, out _);
            if (result?.CloseStatus.HasValue == true)
            {
                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, System.Threading.CancellationToken.None);
                Console.WriteLine("�stemci ba�lant�s� kapand�.");
            }
        }
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

app.MapPost("/api/Author/Control", async context =>
{
    var restclient = new RestClient();
    string endpoint = "https://localhost:7275/api/Author/GetAll";
    var request = new RestRequest(endpoint, Method.Get);
    var response = await restclient.ExecuteAsync(request);
    // T�m istemcilere yeni veriyi g�nder
    var bytes = Encoding.UTF8.GetBytes(response.Content!);
    foreach (var client in clients.Keys)
    {
        await client.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
    }

    context.Response.StatusCode = 200;
});

async Task SendAllAuthors(WebSocket webSocket)
{
    var client = new RestClient();
    string endpoint = "https://localhost:7275/api/Author/GetAll";
    var request = new RestRequest(endpoint, Method.Get);
    var response = await client.ExecuteAsync(request);

    if (response.IsSuccessful)
    {
        var bytes = Encoding.UTF8.GetBytes(response.Content!);
        await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
    }
}
var configuration = builder.Configuration;
var url = configuration["url"];
app.Run(url);
