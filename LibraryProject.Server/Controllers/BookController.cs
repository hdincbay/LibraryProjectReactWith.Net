using LibraryProject.Entities.Model;
using LibraryProject.Repositories;
using LibraryProject.Server.Helpers;
using LibraryProject.Services.Contract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly RepositoryContext _context;
        private readonly IServiceManager _manager;

        public BookController(RepositoryContext context, IServiceManager manager)
        {
            _context = context;
            _manager = manager;
        }

        [HttpPost("CreateBook")]
        public async Task<IActionResult> CreateBook()
        {
            try
            {
                Tool tool = new Tool(_context);
                var bodyContent = "";
                using(var reader = new StreamReader(Request.Body))
                {
                    bodyContent = await reader.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(bodyContent)!;
                    var book = new Book()
                    {
                        SerialNumber = tool.GetSerialNumber(),
                        Name = requestJObj["name"]?.ToString(),
                        AuthorId = Convert.ToInt32(requestJObj["authorId"]?.ToString())
                    };

                    _manager.BookService.CreateOne(book);
                    return Ok("Book Created successfully.");
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpPut("UpdatedBook")]
        public async Task<IActionResult> UpdateBook()
        {
            try
            {
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
