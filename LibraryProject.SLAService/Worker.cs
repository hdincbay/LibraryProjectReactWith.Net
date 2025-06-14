using Microsoft.Extensions.Logging;
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
            var restApiUrl = _configuration["restApiUrl"];
            var applicationWaitingTime = 0;
            var applicationWaiting = _configuration!["applicationWaitingTime"];
            if (!string.IsNullOrEmpty(applicationWaiting))
            {
                applicationWaitingTime = Convert.ToInt32(applicationWaiting);
                _logger.LogInformation("applicationWaitingTime: " + applicationWaitingTime.ToString());
            }
            else
            {
                _logger.LogError("applicationWaitingTime is null!");
            }
            while (!stoppingToken.IsCancellationRequested)
            {
                var client = new RestClient();
                var getRequest = new RestRequest(restApiUrl + "/api/Book/GetNotAvailableAllBook", Method.Get);
                var response = await client.ExecuteAsync(getRequest);
                var responseContent = response.Content;
                var responseJArray = Newtonsoft.Json.JsonConvert.DeserializeObject<JArray>(responseContent!);
                try
                {
                    if (responseJArray?.Count == 0)
                    {
                        _logger.LogInformation("There Are No Books That Do Not Exist!");
                    }
                    Parallel.ForEach(responseJArray!, async item =>
                    {
                        try
                        {
                            if (!Convert.ToBoolean(item["available"]?.ToString()))
                            {
                                var putRequestBodyJObj = new JObject();
                                var bookId = item["bookId"]?.ToString();
                                _logger.LogInformation("Book Id: {bookId}", bookId);
                                var getOneRequest = new RestRequest(restApiUrl + "/api/Book/GetById/" + item["bookId"]?.ToString(), Method.Get);
                                var responseOne = await client.ExecuteAsync(getOneRequest);
                                var loanEndDate = Convert.ToDateTime(item["loanEndDate"]?.ToString());
                                var isSlaExceeded = Convert.ToBoolean(item["isSlaExceeded"]?.ToString());
                                loanEndDate = loanEndDate.AddHours(3);
                                var currentDate = DateTime.Now;
                                var currentDateUnix = ((DateTimeOffset)DateTime.Now).ToUnixTimeSeconds();
                                var putOneRequest = new RestRequest(restApiUrl + "/api/Book/SLAUpdate/" + item["bookId"]?.ToString(), Method.Put);
                                var loanEndDateUnix = ((DateTimeOffset)loanEndDate.ToUniversalTime()).ToUnixTimeSeconds();
                                _logger.LogInformation("Book ID: {bookId} loanEndDateUnix: {loanEndDateUnix}", bookId, loanEndDateUnix);
                                var resultDurationUnix = loanEndDateUnix - currentDateUnix;
                                _logger.LogInformation("Book ID: {bookId} resultDurationUnix: {resultDurationUnix}", bookId, resultDurationUnix);
                                
                                if (loanEndDate < currentDate && !isSlaExceeded)
                                {
                                    _logger.LogInformation("SLA Expired! Book ID: {bookId}", bookId);
                                    putRequestBodyJObj.Add("isSlaExceeded", true);
                                    resultDurationUnix = 0;
                                }
                                else if(isSlaExceeded)
                                {
                                    _logger.LogInformation("SLA Already Expired! Book ID: {bookId}", bookId);
                                    return;
                                }
                                putRequestBodyJObj.Add("slaExpiryUnixTime", resultDurationUnix);
                                putOneRequest.AddBody(Newtonsoft.Json.JsonConvert.SerializeObject(putRequestBodyJObj));
                                var putResponse = await client.ExecuteAsync(putOneRequest);
                                _logger.LogInformation("Book ID: {bookId} Result: {putResponse.Content}, {DateTimeOffset.Now}", bookId, putResponse.Content, DateTimeOffset.Now);
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
                await Task.Delay(applicationWaitingTime, stoppingToken);
            }
        }
    }
}
