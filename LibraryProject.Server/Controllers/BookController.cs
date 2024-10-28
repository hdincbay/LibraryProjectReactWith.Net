using LibraryProject.Entities.Model;
using LibraryProject.Repositories;
using LibraryProject.Server.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly RepositoryContext _context;

        public BookController(RepositoryContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Create()
        {
            try
            {
                Tool tool = new Tool(_context);
                var book = new Book()
                {
                    SerialNumber = tool.GetSerialNumber(),
                    Name = "Çalıkuşu"
                };
                
                _context.Book!.Add(book);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
