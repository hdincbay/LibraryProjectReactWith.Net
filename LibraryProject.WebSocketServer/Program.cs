using RestSharp;
using System.Net.WebSockets;
using System.Text;
using System.Collections.Concurrent;
using LibraryProject.WebSocketServer.Helpers;
using Newtonsoft.Json.Linq;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
Log.Logger = new LoggerConfiguration()
    .Enrich.WithThreadId()
    .WriteTo.Console(outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] [Thread ID: {ThreadId}] {Message}{NewLine}{Exception}")
    .WriteTo.File("Logs/LogFile_.log", rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] [Thread ID: {ThreadId}] {Message}{NewLine}{Exception}")
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();
var app = builder.Build();


app.UseWebSockets();
var configuration = builder.Configuration;
var userName = configuration["name"]?.ToString()!;
var password = configuration["password"]?.ToString()!;
var restUrl = configuration["restUrl"]?.ToString()!;
var clients = new ConcurrentDictionary<WebSocket, string>(); // Ýstemci baðlantýlarýný saklamak için
var tool = new Tool();
app.Map("/AuthorList/", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        
        Console.WriteLine("Yeni bir istemci baðlandý.");
        

        var buffer = new byte[1024 * 4];
        WebSocketReceiveResult result = null;

        try
        {
            do
            {
                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), System.Threading.CancellationToken.None);
                var receivedMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                Console.WriteLine("Gelen mesaj: " + receivedMessage);
                var jsonMessage = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(receivedMessage);
                var authToken = jsonMessage?["authToken"]?.ToString();
                if (!string.IsNullOrEmpty(authToken))
                {
                    clients.TryAdd(webSocket, authToken!);
                }
                await SendAllAuthors(webSocket);
            } while (!result.CloseStatus.HasValue);
            Console.WriteLine("try içinde.");
        }
        catch (Exception ex) // Diðer hatalarý yakalamak için
        {
            Console.WriteLine($"Bir hata oluþtu: {ex.Message}");
        }
        finally
        {
            Console.WriteLine("Finally içinde.");
            clients.TryRemove(webSocket, out _);
            if (result != null && result.CloseStatus.HasValue)
            {
                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, System.Threading.CancellationToken.None);
                Console.WriteLine("Ýstemci baðlantýsý kapandý.");
            }
        }
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});
app.Map("/BookList/", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("Yeni bir istemci baðlandý.");
        
        var buffer = new byte[1024 * 4];
        WebSocketReceiveResult result = null;

        try
        {
            do
            {
                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), System.Threading.CancellationToken.None);
                var receivedMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                Console.WriteLine("Gelen mesaj: " + receivedMessage);
                var jsonMessage = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(receivedMessage);
                var authToken = jsonMessage?["authToken"]?.ToString();
                if (!string.IsNullOrEmpty(authToken))
                {
                    clients.TryAdd(webSocket, authToken!);
                }
                await SendAllBooks(webSocket);
            } while (!result.CloseStatus.HasValue);
            Console.WriteLine("try içinde.");
        }
        catch (Exception ex) // Diðer hatalarý yakalamak için
        {
            Console.WriteLine($"Bir hata oluþtu: {ex.Message}");
        }
        finally
        {
            Console.WriteLine("Finally içinde.");
            clients.TryRemove(webSocket, out _);
            if (result != null && result.CloseStatus.HasValue)
            {
                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, System.Threading.CancellationToken.None);
                Console.WriteLine("Ýstemci baðlantýsý kapandý.");
            }
        }
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});
app.Map("/UserList/", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("Yeni bir istemci baðlandý.");

        var buffer = new byte[1024 * 4];
        WebSocketReceiveResult result = null;

        try
        {
            do
            {
                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), System.Threading.CancellationToken.None);
                var receivedMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                Console.WriteLine("Gelen mesaj: " + receivedMessage);
                var jsonMessage = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(receivedMessage);
                var authToken = jsonMessage?["authToken"]?.ToString();
                if (!string.IsNullOrEmpty(authToken))
                {
                    clients.TryAdd(webSocket, authToken);
                }
                await SendAllUsers(webSocket);
            } while (!result.CloseStatus.HasValue);
            Console.WriteLine("try içinde.");
        }
        catch (Exception ex) // Diðer hatalarý yakalamak için
        {
            Console.WriteLine($"Bir hata oluþtu: {ex.Message}");
        }
        finally
        {
            Console.WriteLine("Finally içinde.");
            clients.TryRemove(webSocket, out _);
            if (result != null && result.CloseStatus.HasValue)
            {
                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, System.Threading.CancellationToken.None);
                Console.WriteLine("Ýstemci baðlantýsý kapandý.");
            }
        }
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});

app.MapPost("/api/Author/Data", async context =>
{
    var restclient = new RestClient();
    var token = await tool.Login(restUrl, restclient, userName, password);
    if (token is not null)
    {
        var tokenVal = Newtonsoft.Json.JsonConvert.DeserializeObject<string>(token);
        string endpoint = restUrl + "/api/Author/GetAll";
        var request = new RestRequest(endpoint, Method.Get);
        var param2 = string.Format("Bearer {0}", tokenVal!);
        request.AddHeader("Authorization", param2);
        var response = await restclient.ExecuteAsync(request);
        var jwtAndObjectName = "";
        using (var reader = new StreamReader(context.Request.Body))
        {
            var requestContent = await reader.ReadToEndAsync();
            jwtAndObjectName = requestContent;
        }
        if (response.IsSuccessful)
        {
            var bytes = Encoding.UTF8.GetBytes(response.Content!);
            clients.Where(c => c.Value.Split('_').Last() == "author").ToList().ForEach(async client =>
            {
                await client.Key.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
            });
            context.Response.StatusCode = 200;
        }
        else
        {
            context.Response.StatusCode = 500; // Hata durumunda uygun bir hata kodu döndür
        }
    }
});
app.MapPost("/api/User/Data", async context =>
{
    var restclient = new RestClient();
    var token = await tool.Login(restUrl, restclient, userName, password);
    if (token is not null)
    {
        var tokenVal = Newtonsoft.Json.JsonConvert.DeserializeObject<string>(token);
        string endpoint = restUrl + "/api/User/GetAll";
        var request = new RestRequest(endpoint, Method.Get);
        var param2 = string.Format("Bearer {0}", tokenVal!);
        request.AddHeader("Authorization", param2);
        var response = await restclient.ExecuteAsync(request);
        var jwtAndObjectName = "";
        using (var reader = new StreamReader(context.Request.Body))
        {
            var requestContent = await reader.ReadToEndAsync();
            jwtAndObjectName = requestContent;
        }
        if (response.IsSuccessful)
        {
            var bytes = Encoding.UTF8.GetBytes(response.Content!);
            clients.Where(c => c.Value.Split('_').Last() == "user").ToList().ForEach(async client =>
            {
                await client.Key.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
            });
            context.Response.StatusCode = 200;
        }
        else
        {
            context.Response.StatusCode = 500; // Hata durumunda uygun bir hata kodu döndür
        }
    }
    
});
app.MapPost("/api/Book/Data", async context =>
{
    var restclient = new RestClient();
    var token = await tool.Login(restUrl, restclient, userName, password);
    if (token is not null)
    {
        var tokenVal = Newtonsoft.Json.JsonConvert.DeserializeObject<string>(token);
        string endpoint = restUrl + "/api/Book/GetAll";
        var request = new RestRequest(endpoint, Method.Get);
        var param2 = string.Format("Bearer {0}", tokenVal!);
        request.AddHeader("Authorization", param2);
        var response = await restclient.ExecuteAsync(request);
        var jwtAndObjectName = "";
        using (var reader = new StreamReader(context.Request.Body))
        {
            var requestContent = await reader.ReadToEndAsync();
            jwtAndObjectName = requestContent;
        }
        if (response.IsSuccessful)
        {
            var bytes = Encoding.UTF8.GetBytes(response.Content!);
            clients.Where(c => c.Value.Split('_').Last() == "book").ToList().ForEach(async client =>
            {
                await client.Key.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
            });
            context.Response.StatusCode = 200;
        }
        else
        {
            context.Response.StatusCode = 500; // Hata durumunda uygun bir hata kodu döndür
        }
    }

});

async Task SendAllAuthors(WebSocket webSocket)
{
    var client = new RestClient();
    var token = await tool.Login(restUrl, client, userName, password);
    if(token is not null)
    {
        var tokenVal = Newtonsoft.Json.JsonConvert.DeserializeObject<string>(token);
        string endpoint = restUrl + "/api/Author/GetAll";
        var request = new RestRequest(endpoint, Method.Get);
        request.AddHeader("Bearer", tokenVal!);
        var response = await client.ExecuteAsync(request);

        if (response.IsSuccessful)
        {
            
            var bytes = Encoding.UTF8.GetBytes(response.Content!);
            await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
        }
    }
}
async Task SendAllBooks(WebSocket webSocket)
{
    var client = new RestClient();
    var token = await tool.Login(restUrl, client, userName, password);
    if (token is not null)
    {
        var tokenVal = Newtonsoft.Json.JsonConvert.DeserializeObject<string>(token);
        string endpoint = restUrl + "/api/Book/GetAll";
        var request = new RestRequest(endpoint, Method.Get);
        request.AddHeader("Bearer", tokenVal!);
        var response = await client.ExecuteAsync(request);

        if (response.IsSuccessful)
        {

            var bytes = Encoding.UTF8.GetBytes(response.Content!);
            await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
        }
    }
}
async Task SendAllUsers(WebSocket webSocket)
{
    
    var client = new RestClient();
    var token = await tool.Login(restUrl, client, userName, password);
    if(token is not null)
    {
        var tokenVal = Newtonsoft.Json.JsonConvert.DeserializeObject<string>(token);
        string endpoint = restUrl + "/api/User/GetAll";
        var request = new RestRequest(endpoint, Method.Get);
        var param2 = string.Format("Bearer {0}", tokenVal!);
        request.AddHeader("Authorization", param2);
        var response = await client.ExecuteAsync(request);

        if (response.IsSuccessful)
        {
            var bytes = Encoding.UTF8.GetBytes(response.Content!);
            await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None);
        }
    }
}
var url = configuration["url"];
app.Run(url);
