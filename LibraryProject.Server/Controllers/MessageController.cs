using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using RabbitMQ.Client;
using System.Text;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public MessageController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        [HttpPost("PublishMessage")]
        public async Task<IActionResult> PublishMessage()
        {
            try
            {
                var requestJObj = new JObject();
                
                using(var bodyStream = new StreamReader(Request.Body))
                {
                    var requestBody = await bodyStream.ReadToEndAsync();
                    var requestBodyJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(requestBody);
                    var body = requestBodyJObj!["requestBody"]?.ToString();
                    var url = requestBodyJObj!["endpoint"]?.ToString();
                    var methodType = Request.Method;
                    requestJObj.Add("Method", methodType);
                    requestJObj.Add("Endpoint", url);
                    var requestHeaderJObj = new JObject();
                    var requestHeader = Request.Headers;
                    var contentType = requestHeader.ContentType.ToString();
                    requestHeaderJObj.Add("Content-Type", contentType);
                    requestJObj.Add("Headers", Newtonsoft.Json.JsonConvert.SerializeObject(requestHeaderJObj));
                    requestJObj.Add("Body", body);
                    var rabbitMqServer = _configuration["rabbitMqTMessageSettings:server"]?.ToString();
                    var rabbitMqUserName = _configuration["rabbitMqTMessageSettings:userName"]?.ToString();
                    var rabbitMqPassword = _configuration["rabbitMqTMessageSettings:password"]?.ToString();
                    var rabbitMqExchange = _configuration["rabbitMqTMessageSettings:exchange"]?.ToString();
                    var rabbitMqQueue = _configuration["rabbitMqTMessageSettings:queue"]?.ToString();
                    var rabbitMqRoutingKey = _configuration["rabbitMqTMessageSettings:routingKey"]?.ToString();

                    var factory = new ConnectionFactory()
                    {
                        HostName = rabbitMqServer!,
                        UserName = rabbitMqUserName!,
                        Password = rabbitMqPassword!
                    };

                    using var connection = factory.CreateConnection();
                    using var channel = connection.CreateModel();

                    channel.ExchangeDeclare(exchange: rabbitMqExchange, type: ExchangeType.Direct, durable: true);
                    channel.QueueDeclare(queue: rabbitMqQueue, durable: true, exclusive: false, autoDelete: false);
                    channel.QueueBind(queue: rabbitMqQueue, exchange: rabbitMqExchange, routingKey: rabbitMqRoutingKey);
                    var requestString = Newtonsoft.Json.JsonConvert.SerializeObject(requestJObj);
                    var requestContentByte = Encoding.UTF8.GetBytes(requestString);
                    channel.BasicPublish(exchange: rabbitMqExchange, routingKey: rabbitMqRoutingKey, basicProperties: null, body: requestContentByte);
                    return Ok();
                }
                
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
