using LibraryProject.Entities.Model;
using LibraryProject.Repositories;
using LibraryProject.Server.Helpers;
using LibraryProject.Services.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using RestSharp;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JwtTokenService _tokenService;
        private readonly IConfiguration _configuration;
        private readonly IServiceManager _manager;
        private readonly RepositoryContext _context;
        private readonly Tool _tool;
        public UserController(UserManager<User> userManager, SignInManager<User> signInManager, JwtTokenService tokenService, IConfiguration configuration, IServiceManager manager, RepositoryContext context, Tool tool)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _configuration = configuration;
            _manager = manager;
            _context = context;
            _tool = tool;
        }
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var userList = await _userManager.Users.ToListAsync();
                if (userList is not null)
                {
                    var userListSrrl = Newtonsoft.Json.JsonConvert.SerializeObject(userList);
                    var userListModel = Newtonsoft.Json.JsonConvert.DeserializeObject<List<User>>(userListSrrl);
                    return Ok(userListModel);
                }
                else
                {
                    return BadRequest("User Undefined");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpGet("GetOne/{id:int}")]
        public async Task<IActionResult> GetOne([FromRoute]int id)
        {
            try
            {
                var user = await _userManager.Users.Where(u => u.Id.Equals(id)).SingleOrDefaultAsync();
                if (user is not null)
                {
                    var userSrl = Newtonsoft.Json.JsonConvert.SerializeObject(user);
                    return Ok(userSrl);
                }
                else
                {
                    return BadRequest("User Undefined");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpPut("Update/{id:int}")]
        public async Task<IActionResult> Update([FromRoute]int id)
        {
            try
            {
                var user = await _userManager.Users.Where(u => u.Id.Equals(id)).SingleOrDefaultAsync();
                if (user is not null)
                {
                    using (var reader = new StreamReader(Request.Body))
                    {
                        var requestContent = await reader.ReadToEndAsync();
                        var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(requestContent);
                        user.FirstName = requestJObj!["firstName"]?.ToString();
                        user.LastName = requestJObj!["lastName"]?.ToString();
                        user.UserName = requestJObj!["userName"]?.ToString();
                        user.Email = requestJObj["email"]?.ToString();
                        user.t_chatId = requestJObj["t_chatId"]?.ToString();
                        var response = await _userManager.UpdateAsync(user);
                        reader.Dispose();
                        if (response.Succeeded)
                            return Ok("User Created successfully.");
                        else
                            return BadRequest(response.ToString());
                    }
                }
                else
                {
                    return BadRequest("User undefined!");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }

        }
        [HttpPost("SignUp")]
        public async Task<IActionResult> SingUp()
        {
            try
            {
                using (var reader = new StreamReader(Request.Body))
                {
                    var requestContent = await reader.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(requestContent);
                    var password = requestJObj!["password"]?.ToString()!;
                    var passwordConfirm = requestJObj["passwordConfirm"]?.ToString()!;
                    if (!password.Equals(passwordConfirm))
                        return BadRequest("Password with Password Confirm not equals!");
                    var response = await _userManager.CreateAsync(new()
                    {
                        FirstName = requestJObj["firstName"]?.ToString(),
                        LastName = requestJObj["lastName"]?.ToString(),
                        UserName = requestJObj!["userName"]?.ToString(),
                        Email = requestJObj["email"]?.ToString(),
                        t_chatId = requestJObj["t_chatId"]?.ToString()
                    }, password);
                    reader.Dispose();
                    if (response.Succeeded)
                        return Ok("User Created successfully.");
                    else
                        return BadRequest(response.ToString());
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }

        }
        [HttpPost("Login")]
        public async Task<IActionResult> Login()
        {
            try
            {
                using (var reader = new StreamReader(Request.Body))
                {
                    var requestContent = await reader.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(requestContent);
                    var userName = requestJObj!["userName"]?.ToString();
                    var password = requestJObj!["password"]?.ToString();
                    var user = await _userManager.FindByNameAsync(userName!);
                    if (user is null)
                        return Unauthorized("Invalid username or password.");
                    var isLoggedin = await _signInManager.PasswordSignInAsync(user!, password!, true, true);
                    if (isLoggedin.Succeeded)
                    {
                        var token = _tokenService.GenerateJwtToken(new() { UserName = userName });
                        if (userName != "systemuser")
                        {
                            var userObj = await _userManager.FindByNameAsync(userName!);
                            var userFullName = userObj!.FirstName + " " + userObj!.LastName;
                            var resultJObj = new JObject();
                            resultJObj.Add("userFullName", userFullName);
                            resultJObj.Add("userName", userName);
                            resultJObj.Add("token", token);
                            resultJObj.Add("userId", userObj.Id);

                            return Ok(resultJObj.ToString());
                        }
                        else
                        {
                            return Ok(token);
                        }
                    }
                    else
                    {
                        return Unauthorized("Invalid username or password.");
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }


        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync(); // Çıkış işlemi yapılır
            return Ok("User has been logged out successfully.");
        }
        [HttpDelete("Delete/{id:int}")]
        public async Task<IActionResult> Delete([FromRoute]int id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id.ToString());
                if(user is not null)
                {
                    var bookList = _context.Book!.Where(b => b.UserId.Equals(id)).ToList();
                    Parallel.ForEach(bookList, item => {
                        item.LoanDate = null;
                        item.LoanEndDate = null;
                        item.LoanDuration = 0;
                        item.UserId = null;
                        item.Available = true;
                        _context.Book!.Update(item);
                        _context.SaveChanges();
                    });
                    
                    var deleteResponse = await _userManager.DeleteAsync(user!);
                    if (deleteResponse.Succeeded)
                    {
                        using (var reader = new StreamReader(Request.Body))
                        {
                            var requestContent = await reader.ReadToEndAsync();
                            var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(requestContent);
                            var authToken = requestJObj!["authToken"]?.ToString();
                            await _tool.WebSocketRequest(authToken!, _configuration, ControllerContext.ActionDescriptor.ControllerName);
                            return Ok("User deleted successfully.");
                        }
                    }
                    else
                        return BadRequest(deleteResponse.Errors.ToString());
                }
                else
                {
                    return BadRequest("User not found!");
                }
                    
            }
            catch(Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpGet("GetSessionId")]
        public async Task<IActionResult> GetSessionId()
        {
            await Task.Run(() =>
            {
                if (string.IsNullOrEmpty(HttpContext.Session.GetString("session_id")))
                {
                    HttpContext.Session.SetString("session_id", Guid.NewGuid().ToString());
                }
            });

            var sessionId = HttpContext.Session.GetString("session_id");
            return Ok(sessionId);
        }
        [HttpGet("GetBookListByUserId/{id:int}")]
        public async Task<IActionResult> GetBookListByUserId([FromRoute] int id)
        {
            try
            {
                var user = _context.Users.Where(u => u.Id.Equals(id)).FirstOrDefault();
                if(user is not null)
                {
                    var bookList = await _context.Book!.Where(b => b.UserId.Equals(id)).ToListAsync();
                    var responseJArray = new JArray();
                    foreach(var book in bookList)
                    {
                        var modelJObject = new JObject();
                        modelJObject.Add("bookId", book.BookId);
                        modelJObject.Add("name", book.Name);
                        modelJObject.Add("loanDate", book.LoanDate);
                        modelJObject.Add("loanEndDate", book.LoanEndDate);
                        modelJObject.Add("sla", book.IsSlaExceeded);
                        modelJObject.Add("slaDuration", book.SLAExpiryUnixTime);
                        responseJArray.Add(modelJObject);
                    }
                    return Ok(responseJArray.ToString());
                }
                else
                {
                    return BadRequest("User not found!");
                }
                
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
