using LibraryProject.SLAService;
using Serilog;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<Worker>();
Log.Logger = new LoggerConfiguration()
    .Enrich.WithThreadId()
    .WriteTo.Console(outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] [Thread ID: {ThreadId}] {Message}{NewLine}{Exception}")
    .WriteTo.File("Logs/LogFile_.log", rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] [Thread ID: {ThreadId}] {Message}{NewLine}{Exception}")
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();
var host = builder.Build();
host.Run();