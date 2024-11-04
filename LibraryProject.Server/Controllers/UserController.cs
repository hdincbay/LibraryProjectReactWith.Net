using LibraryProject.Entities.Model;
using Microsoft.AspNetCore.Http;
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

        public UserController(UserManager<User> userManager)
        {
            _userManager = userManager;
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
    }
}
