using LibraryProject.Entities.Model;
using LibraryProject.Repositories;
using LibraryProject.Server.Helpers;
using LibraryProject.Services.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using RestSharp;
using System.Xml.Linq;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly RepositoryContext _context;
        private readonly IServiceManager _manager;
        private readonly IConfiguration _configuration;

        public BookController(RepositoryContext context, IServiceManager manager, IConfiguration configuration)
        {
            _context = context;
            _manager = manager;
            _configuration = configuration;
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
        [HttpGet("GetNotAvailableAllBook")]
        public async Task<IActionResult> GetNotAvailableAllBook()
        {
            try
            {
                var notAvailableBookList = await Task.Run(() =>
                {
                    return _manager.BookService.GetNotAvailableAllBook(false);
                });
                return Ok(notAvailableBookList);

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
                    var bookName = requestJObj["name"]?.ToString();
                    var bookList = await Task.Run(() =>
                    {
                        return _manager.BookService.GetAll(false);
                    });
                    var book = new Book()
                    {
                        SerialNumber = tool.GetSerialNumber(bookList!),
                        Name = bookName,
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
                        book.Available = Convert.ToBoolean(requestJObj["available"]?.ToString());
                        var currentBookUserId = book.UserId;
                        if (!Convert.ToBoolean(requestJObj["available"]?.ToString()))
                        {
                            book.LoanDate = DateTime.UtcNow;
                            var loanDuration = Convert.ToInt32(requestJObj["loanDuration"]?.ToString());
                            book.LoanEndDate = DateTime.UtcNow.AddDays(loanDuration);
                            book.LoanDuration = loanDuration;
                            var bookUserId = Convert.ToInt32(requestJObj["userId"]?.ToString());
                            var lenderId = Convert.ToInt32(requestJObj["lenderId"]?.ToString());
                            book.UserId = bookUserId;
                            book.LenderId = lenderId;
                            var user = _context.Users.Where(u => u.Id.Equals(bookUserId)).FirstOrDefault();
                            if(user is not null)
                            {
                                user.BookCount += 1;
                                _context.Users.Update(user);
                                _context.SaveChanges();
                            }
                            if(currentBookUserId != null)
                            {
                                var currentUser = _context.Users.Where(u => u.Id.Equals(currentBookUserId)).FirstOrDefault();
                                if(currentUser is not null)
                                {
                                    currentUser.BookCount -= 1;
                                    _context.Users.Update(currentUser);
                                    _context.SaveChanges();
                                }
                            }
                        }
                        else
                        {
                            var user = _context.Users.Where(u => u.Id.Equals(currentBookUserId)).FirstOrDefault();
                            if (user is not null)
                            {
                                user.BookCount -= 1;
                                _context.Users.Update(user);
                                _context.SaveChanges();
                            }
                            book.LoanDate = null;
                            book.LoanDuration = 0;
                            book.LoanEndDate = null;
                            book.UserId = null;
                            book.LenderId = null;
                            book.SLAExpiryUnixTime = 0;
                            book.IsSlaExceeded = false;
                        }
                        
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
                    using (var reader = new StreamReader(Request.Body))
                    {
                        if(!book.Available)
                        {
                            var currentBookUserId = book.UserId;
                            if (currentBookUserId is not null)
                            {
                                var currentUser = _context.Users.Where(u => u.Id.Equals(currentBookUserId)).FirstOrDefault();
                                if (currentUser is not null)
                                {
                                    currentUser.BookCount -= 1;
                                    _context.Users.Update(currentUser);
                                    _context.SaveChanges();
                                }
                            }
                        }
                        var requestContent = await reader.ReadToEndAsync();
                        var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(requestContent);
                        var authToken = requestJObj!["authToken"]?.ToString();
                        var client = new RestClient();
                        string websocketurl = _configuration["websocketurl"]?.ToString()!;
                        var endpoint = websocketurl + "/api/Book/Data";
                        var request = new RestRequest(endpoint, Method.Post);
                        request.AddJsonBody(authToken!);
                        var response = await client.ExecuteAsync(request);
                        return Ok("Book Deleted succesfully.");
                    }
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
        [HttpPut("SLAUpdate/{id:int}")]
        public async Task<IActionResult> SLAUpdate([FromRoute] int id)
        {
            try
            {
                var book = _manager.BookService.GetOne(id, true);
                if (book is not null)
                {
                    var bodyContent = "";
                    using (var reader = new StreamReader(Request.Body))
                    {
                        bodyContent = await reader.ReadToEndAsync();
                        var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(bodyContent);
                        var isSlaExceeded = Convert.ToBoolean(requestJObj!["isSlaExceeded"]?.ToString());
                        var slaExpiryUnixTime = Convert.ToInt64(requestJObj!["slaExpiryUnixTime"]?.ToString());
                        book.IsSlaExceeded = isSlaExceeded;
                        book.SLAExpiryUnixTime = slaExpiryUnixTime;
                        _manager.BookService.UpdateOne(book);
                        return Ok("Book updated successfully.");
                    }
                }
                else
                {
                    return BadRequest("Book is null!");
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
