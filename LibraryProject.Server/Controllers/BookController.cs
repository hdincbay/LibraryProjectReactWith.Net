﻿using LibraryProject.Entities.Model;
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
        [HttpPost("LoanBook")]
        public async Task<IActionResult> LoanBook()
        {
            try
            {
                Tool tool = new Tool(_context);
                var bodyContent = "";
                using (var reader = new StreamReader(Request.Body))
                {
                    bodyContent = await reader.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(bodyContent)!;
                    var userId = requestJObj["UserId"]?.ToString();
                    var bookId = requestJObj["BookId"]?.ToString();
                    var user = _context.Users.Where(u => u.Id.Equals(userId)).FirstOrDefault();
                    if(user is not null)
                    {
                        var book = _manager.BookService.GetOne(Convert.ToInt32(bookId), true);
                        if (book is not null)
                        { 
                            book.LoanDate = DateTime.Now;
                            book.Available = false;
                            book.UserId = Convert.ToInt32(userId);
                        }
                        await Task.Run(() =>
                        {
                            _manager.BookService.UpdateOne(book!);
                        });
                        return Ok("The book has been successfully loaned.");
                    }
                    else
                    {
                        return Ok("User not found!");
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
