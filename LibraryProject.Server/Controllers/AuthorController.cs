using LibraryProject.Entities.Model;
using LibraryProject.Repositories;
using LibraryProject.Server.Helpers;
using LibraryProject.Services.Contract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using RestSharp;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorController : ControllerBase
    {
        private readonly IServiceManager _manager;
        private readonly IConfiguration _configuration;
        public AuthorController(IServiceManager manager, IConfiguration configuration)
        {
            _manager = manager;
            _configuration = configuration;
        }
        [HttpGet("GetById/{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var author = await Task.Run(() =>
                {
                    return _manager.AuthorService.GetOne(id, true);
                });
                if (author is not null)
                    return Ok(author);
                else
                    return BadRequest("Author Undefined.");
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var authorList = await Task.Run(() =>
                {
                    return _manager.AuthorService.GetAll(false);
                });
                return Ok(authorList);

            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpPost("Create")]
        public async Task<IActionResult> Create()
        {
            try
            {
                var bodyContent = "";
                using (var reader = new StreamReader(Request.Body))
                {
                    bodyContent = await reader.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(bodyContent)!;
                    var author = new Author()
                    {
                        Name = requestJObj["name"]?.ToString(),
                        Surname = requestJObj["surName"]?.ToString()
                    };

                    await Task.Run(() =>
                    {
                        _manager.AuthorService.CreateOne(author);
                    });
                    var client = new RestClient();
                    string websocketurl = _configuration["websocketurl"]?.ToString()!;
                    var endpoint = websocketurl + "/api/Author/Data";
                    var request = new RestRequest(endpoint, Method.Post);
                    var rsp = await client.ExecuteAsync(request);
                    return Ok("Author Created successfully.");
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
                var bodyContent = "";
                using (var stream = new StreamReader(Request.Body))
                {
                    bodyContent = await stream.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(bodyContent)!;
                    var author = await Task.Run(() =>
                    {
                        return _manager.AuthorService.GetOne(Convert.ToInt32(requestJObj["authorId"]?.ToString()), true);

                    });
                    if (author is not null)
                    {
                        author.Name = requestJObj["name"]?.ToString();
                        author.Surname = requestJObj["surName"]?.ToString();
                        await Task.Run(() =>
                        {
                            _manager.AuthorService.UpdateOne(author);
                        });
                        var client = new RestClient();
                        string websocketurl = _configuration["websocketurl"]?.ToString()!;
                        var endpoint = websocketurl + "/api/Author/Data";
                        var request = new RestRequest(endpoint, Method.Post);
                        await client.ExecuteAsync(request);
                        return Ok("Author Updated successfully.");
                    }
                    else
                    {
                        return BadRequest("Author Undefined");
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
                var author = await Task.Run(() =>
                {
                    return _manager.AuthorService.GetOne(id, true);
                });
                if (author is not null)
                {
                    await Task.Run(() =>
                    {
                        _manager.AuthorService.DeleteOne(id);
                    });
                    var client = new RestClient();
                    string websocketurl = _configuration["websocketurl"]?.ToString()!;
                    var endpoint = websocketurl + "/api/Author/Data";
                    var request = new RestRequest(endpoint, Method.Post);
                    var response = await client.ExecuteAsync(request);
                    return Ok("Author Deleted succesfully.");
                }
                else
                {
                    return BadRequest("Author Undefined");
                }
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
                var author = await Task.Run(() =>
                {
                    return _manager.AuthorService.GetOne(id, true);
                });
                var bookList = author!.Books!.ToList();
                return Ok("bookList: " + bookList.Count + bookList.First().Name);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
