using LibraryProject.Entities.Model;
using LibraryProject.Server.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JwtTokenService _tokenService;

        public UserController(UserManager<User> userManager, SignInManager<User> signInManager, JwtTokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }
        [HttpGet("GetCurrentUser")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userName = await Task.Run(() =>
            {
                return User!.Identity!.Name;
            }); // Giriş yapmış kullanıcının adını alır.
            return Ok(new { UserName = userName });
        }
        [Authorize]
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

                    var response = await _userManager.CreateAsync(new()
                    {
                        UserName = requestJObj!["userName"]?.ToString(),
                        Email = requestJObj["email"]?.ToString(),
                    }, requestJObj["password"]?.ToString()!);
                    if (response.Succeeded)
                        return Ok("User Created successfully.");
                    else
                        return BadRequest("User Created failed.");
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
                using(var reader = new StreamReader(Request.Body))
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
                        return Ok(token);
                    }
                    else
                    {
                        return Unauthorized("Invalid username or password.");
                    }
                }
            }
            catch(Exception ex)
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
    }
}
