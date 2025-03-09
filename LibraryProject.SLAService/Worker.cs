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
                try
                {
                    Parallel.ForEach(responseJArray!, async item =>
                    {
                        try
                        {
                            if (!Convert.ToBoolean(item["available"]?.ToString()))
                            {
                                var putRequestBodyJObj = new JObject();
                                _logger.LogInformation("bookId: {bookId}", item["bookId"]?.ToString());
                                var getOneRequest = new RestRequest(restApiUrl + "/api/Book/GetById/" + item["bookId"]?.ToString(), Method.Get);
                                var responseOne = await client.ExecuteAsync(getOneRequest);
                                var loanDate = Convert.ToDateTime(item["loanDate"]?.ToString());
                                var loanEndDate = Convert.ToDateTime(item["loanEndDate"]?.ToString());
                                var currentDate = DateTime.Now;
                                var currentDateUnix = ((DateTimeOffset)DateTime.Now).ToUnixTimeSeconds();
                                var putOneRequest = new RestRequest(restApiUrl + "/api/Book/SLAUpdate/" + item["bookId"]?.ToString(), Method.Put);
                                _logger.LogInformation("loanEndDate > currentDate içinde.");
                                var loanDateUnix = ((DateTimeOffset)loanDate.ToUniversalTime()).ToUnixTimeSeconds();
                                _logger.LogInformation("loanDateUnix: {loanDateUnix}", loanDateUnix);
                                var resultDurationUnix = currentDateUnix - loanDateUnix;
                                _logger.LogInformation("resultDurationUnix: {resultDurationUnix}", resultDurationUnix);
                                putRequestBodyJObj.Add("slaExpiryUnixTime", resultDurationUnix);
                                if (loanEndDate < currentDate)
                                {
                                    _logger.LogInformation("loanEndDate < currentDate içinde.");
                                    putRequestBodyJObj.Add("isSlaExceeded", true);
                                }
                                putOneRequest.AddBody(Newtonsoft.Json.JsonConvert.SerializeObject(putRequestBodyJObj));
                                var putResponse = await client.ExecuteAsync(putOneRequest);
                                _logger.LogInformation("putResponse.Content: {putResponse.Content}, {DateTimeOffset.Now}", putResponse.Content, DateTimeOffset.Now);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError("ex: {ex.ToString()}", ex.ToString());
                        }
                    });
                }
                catch(Exception exception)
                {
                    _logger.LogError("exception: {exception.ToString()}", exception.ToString());
                }
                await Task.Delay(1000, stoppingToken);
            }
        }
    }
}
