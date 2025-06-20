using Newtonsoft.Json.Linq;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RestSharp;
using System.Text;

namespace LibraryProject.RabbitMQConsumer
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IConfiguration? _configuration;
        private IConnection? _connection;
        private IModel? _channel;

        private static readonly object _consoleLock = new();

        public Worker(ILogger<Worker> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                var rabbitMqServer = _configuration!["rabbitMqTMessageSettings:server"];
                var userName = _configuration["rabbitMqTMessageSettings:userName"];
                var password = _configuration["rabbitMqTMessageSettings:password"];
                var queue = _configuration["rabbitMqTMessageSettings:queue"];

                while (!stoppingToken.IsCancellationRequested)
                {
                    var factory = new ConnectionFactory()
                    {
                        HostName = rabbitMqServer,
                        UserName = userName,
                        Password = password,
                        DispatchConsumersAsync = true
                    };
                    _connection = factory.CreateConnection();
                    _channel = _connection.CreateModel();

                    _channel.QueueDeclare(queue: queue, durable: true, exclusive: false, autoDelete: false, arguments: null);

                    var consumer = new AsyncEventingBasicConsumer(_channel);
                    consumer.Received += async (model, ea) =>
                    {
                        await Task.Run(async () =>
                        {
                            try
                            {
                                var body = ea.Body.ToArray();
                                var message = Encoding.UTF8.GetString(body);
                                if (string.IsNullOrEmpty(message))
                                {
                                    _logger.LogInformation("Message is null or emtpy!");
                                }
                                else
                                {
                                    lock (_consoleLock)
                                    {
                                        Console.WriteLine($"[{DateTime.Now:O}] Mesaj: {message} - Thread ID: {Thread.CurrentThread.ManagedThreadId}");
                                    }
                                    using (var client = new RestClient())
                                    {
                                        var messageJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(message);
                                        var endpoint = messageJObj!["Endpoint"]?.ToString();
                                        var headers = messageJObj!["Headers"]?.ToString();
                                        var headerJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(headers!);
                                        var contentType = headerJObj!["Content-Type"]?.ToString();
                                        var requestBody = messageJObj!["Body"]?.ToString();
                                        var request = new RestRequest(endpoint);
                                        request.AddBody(requestBody!);
                                        request.AddHeader("Content-Type", contentType!);
                                        var response = await client.ExecuteAsync(request, Method.Post);
                                        if (response.IsSuccessStatusCode)
                                        {
                                            _logger.LogInformation("Message send is succesfull.");
                                            _channel.BasicAck(ea.DeliveryTag, multiple: false);
                                        }
                                        else
                                        {
                                            _logger.LogError("Message send is error: " + response.Content);
                                            _channel.BasicNack(ea.DeliveryTag, multiple: false, requeue: true);
                                        }

                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex.ToString());
                                _channel.BasicNack(ea.DeliveryTag, multiple: false, requeue: true);
                            }
                        });
                    };

                    _channel.BasicConsume(queue: queue, autoAck: false, consumer: consumer);
                    await Task.Delay(Timeout.Infinite, stoppingToken);
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }
    }
}
