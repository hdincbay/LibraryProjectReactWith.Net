using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.JOBScheduleService
{
    public class Job : IJob
    {
        private readonly ILogger<Job> _logger;

        public Job(ILogger<Job> logger)
        {
            _logger = logger;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                _logger.LogInformation("Running...");
                
            }
            catch (Exception ex)
            {
                _logger.LogError("Error: " + ex.ToString());
            }
            
        }
    }
}
