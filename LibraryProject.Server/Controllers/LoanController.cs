using LibraryProject.Services.Contract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoanController : ControllerBase
    {
        private readonly IServiceManager _manager;
        public LoanController(IServiceManager manager)
        {
            _manager = manager;
        }
    }
}
