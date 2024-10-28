using LibraryProject.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorController : ControllerBase
    {
        private readonly RepositoryContext _context;
        public AuthorController(RepositoryContext context)
        {
            _context = context;
        }
        [HttpPost("Create")]
        public async Task<IActionResult> Create()
        {
            try
            {
                _context.Author!.Add(new() { Name = "Harun", Surname = "Kaya" });
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpGet("GetBookListByAuthorId/{id:int}")]
        public async Task<IActionResult> GetBookListByAuthorId([FromRoute]int id)
        {
            try
            {
                var bookList = await _context.Book!.Where(b => b.AuthorId.Equals(id)).ToListAsync();
                return Ok("bookList: " + bookList.Count + bookList.First().Name);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
