using Quartz;
using LibraryProject.JOBScheduleService;

var builder = Host.CreateApplicationBuilder(args);

// Quartz job tanımı
builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey("DeliveryNotificationCreate");

    q.AddJob<Job>(opts => opts.WithIdentity(jobKey));

    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity("DeliveryNotificationTrigger")
        .WithSimpleSchedule(x => x
            .WithIntervalInSeconds(5)
            .RepeatForever()));
});

builder.Services.AddQuartzHostedService(opt => opt.WaitForJobsToComplete = true);

builder.Services.AddHostedService<Worker>();

builder.Services.AddLogging();

var host = builder.Build();

await host.RunAsync();