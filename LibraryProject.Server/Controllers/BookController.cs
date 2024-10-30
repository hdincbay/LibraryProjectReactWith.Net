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
        [HttpGet("GetById/{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var book = await Task.Run(() =>
                {
                    return _manager.BookService.GetOne(id, true);
                });
                if (book is not null)
                    return Ok(book);
                else
                    return BadRequest("Book Undefined.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var bookList = await Task.Run(() =>
                {
                    return _manager.BookService.GetAll(false);
                });
                return Ok(bookList);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpPost("Create")]
        public async Task<IActionResult> Create()
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

                    await Task.Run(() =>
                    {
                        _manager.BookService.CreateOne(book);
                    });
                    return Ok("Book Created successfully.");
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpPut("Update")]
        public async Task<IActionResult> Update()
        {
            try
            {
                Tool tool = new Tool(_context);
                var bodyContent = "";
                using (var reader = new StreamReader(Request.Body))
                {
                    bodyContent = await reader.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(bodyContent)!;
                    var book = await Task.Run(() =>
                    {
                        return _manager.BookService.GetOne(Convert.ToInt32(requestJObj["bookId"]?.ToString()), true);
                    });

                    if(book is not null)
                    {
                        book.Name = requestJObj["name"]?.ToString();
                        book.AuthorId = Convert.ToInt32(requestJObj["authorId"]?.ToString());
                        await Task.Run(() =>
                        {
                            _manager.BookService.UpdateOne(book!);
                        });
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
        [HttpDelete("Delete/{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                var book = await Task.Run(() =>
                {
                    return _manager.BookService.GetOne(id, true);
                });
                if (book is not null)
                {
                    _manager.BookService.DeleteOne(id);
                    return Ok("Book Deleted successfully.");
                }
                else
                {
                    return BadRequest("Book undefined");
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
