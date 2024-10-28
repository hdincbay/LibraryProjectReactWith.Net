using LibraryProject.Repositories;
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

                _context.Book!.Add(new() { Name = "Beyaz Diş", SerialNumber = "B00001", AuthorId = 1});
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
