using LibraryProject.Entities.Model;
using LibraryProject.Server.Helpers;
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
        public UserController(UserManager<User> userManager, SignInManager<User> signInManager, JwtTokenService tokenService, IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _configuration = configuration;
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
                        // Oturum açıldıktan sonra, session'a kaydediyoruz
                        if (userName != "systemuser")
                        {
                            HttpContext.Session.SetString("UserName", userName!);
                            var userObj = await _userManager.FindByNameAsync(userName!);
                            var userFullName = userObj!.FirstName + " " + userObj!.LastName;
                            return Ok(userFullName);
                        }
                        else
                        {
                            var token = _tokenService.GenerateJwtToken(new() { UserName = userName });
                            
                            
                            return Ok(token);
                        }


                        return Ok("User logged in successfully.");
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
                    var deleteResponse = await _userManager.DeleteAsync(user!);
                    if (deleteResponse.Succeeded)
                    {
                        using (var reader = new StreamReader(Request.Body))
                        {
                            var requestContent = await reader.ReadToEndAsync();
                            var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(requestContent);
                            var authToken = requestJObj!["authToken"]?.ToString();
                            var client = new RestClient();
                            string websocketurl = _configuration["websocketurl"]?.ToString()!;
                            var endpoint = websocketurl + "/api/User/Data";

                            var requestToWebSocket = new RestRequest(endpoint, Method.Post);
                            requestToWebSocket.AddJsonBody(authToken!);
                            var response = await client.ExecuteAsync(requestToWebSocket);
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
                // Eğer session_id set edilmediyse, bir değer atayalım
                if (string.IsNullOrEmpty(HttpContext.Session.GetString("session_id")))
                {
                    HttpContext.Session.SetString("session_id", Guid.NewGuid().ToString());
                }
            });

            var sessionId = HttpContext.Session.GetString("session_id");
            return Ok(sessionId);
        }
    }
}
