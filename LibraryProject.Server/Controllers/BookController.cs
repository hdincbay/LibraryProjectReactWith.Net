using LibraryProject.Entities.Model;
using LibraryProject.Repositories;
using LibraryProject.Server.Helpers;
using LibraryProject.Services.Contract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System.Xml.Linq;

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
        [HttpPut("UpdateBook")]
        public async Task<IActionResult> UpdateBook()
        {
            try
            {
                Tool tool = new Tool(_context);
                var bodyContent = "";
                using (var reader = new StreamReader(Request.Body))
                {
                    bodyContent = await reader.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(bodyContent)!;
                    var book = _manager.BookService.GetOne(Convert.ToInt32(requestJObj["bookId"]?.ToString()), true);
                    if(book is not null)
                    {
                        book.Name = requestJObj["name"]?.ToString();
                        book.AuthorId = Convert.ToInt32(requestJObj["authorId"]?.ToString());
                        _manager.BookService.UpdateOne(book!);
                        return Ok("Book Updated successfully.");
                    }
                    else
                    {
                        return BadRequest("Book undefined");
                    }
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpDelete("DeleteBook")]
        public async Task<IActionResult> DeleteBook()
        {
            try
            {
                Tool tool = new Tool(_context);
                var bodyContent = "";
                using (var reader = new StreamReader(Request.Body))
                {
                    bodyContent = await reader.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(bodyContent)!;
                    var bookId = Convert.ToInt32(requestJObj["bookId"]?.ToString());
                    var book = _manager.BookService.GetOne(bookId, true);
                    if (book is not null)
                    {
                        _manager.BookService.DeleteOne(bookId);
                        return Ok("Book Deleted successfully.");
                    }
                    else
                    {
                        return BadRequest("Book undefined");
                    }
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
