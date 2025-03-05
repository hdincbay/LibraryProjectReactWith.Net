using Newtonsoft.Json.Linq;
using RestSharp;

namespace LibraryProject.SLAService
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IConfiguration _configuration;
        public Worker(ILogger<Worker> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var restApiUrl = _configuration["restApiUrl"];
                var client = new RestClient();
                var getRequest = new RestRequest(restApiUrl + "/api/Book/GetNotAvailableAllBook", Method.Get);
                var response = await client.ExecuteAsync(getRequest);
                var responseContent = response.Content;
                var responseJArray = Newtonsoft.Json.JsonConvert.DeserializeObject<JArray>(responseContent!);
                foreach (var item in responseJArray!)
                {
                    try
                    {
                        _logger.LogInformation("bookId: {bookId}", item["bookId"]?.ToString());
                    }
                    catch (Exception ex)
                    {
                        _logger.LogInformation("Error content: {error}", ex.ToString());
                    }
                }
                if (_logger.IsEnabled(LogLevel.Information))
                {
                    _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                }
                await Task.Delay(1000, stoppingToken);
            }
        }
    }
}
