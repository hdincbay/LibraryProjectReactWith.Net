using LibraryProject.Entities.Model;
using LibraryProject.Services.Contract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace LibraryProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoanController : ControllerBase
    {
        private readonly IServiceManager _manager;
        public LoanController(IServiceManager manager)
        {
            _manager = manager;
        }
        [HttpGet("GetById/{id:int}")]
        public async Task<IActionResult> GetBookByLoanId([FromRoute] int id)
        {
            try
            {
                var loan = await Task.Run(() =>
                {
                    return _manager.LoanService.GetOne(id, false);
                });
                var book = loan!.Book!.Name!.ToString();
                return Ok(book);
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
                var loanList = await Task.Run(() =>
                {
                    return _manager.LoanService.GetAll(false);
                });
                return Ok(loanList);
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
                using (var stream = new StreamReader(Request.Body))
                {
                    var requestContent = await stream.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(requestContent);
                    var loan = new Loan()
                    {
                        UserId = Convert.ToInt32(requestJObj!["userId"]?.ToString()),
                        BookId = Convert.ToInt32(requestJObj["bookId"]?.ToString())
                    };
                    await Task.Run(() =>
                    {
                        _manager.LoanService.CreateOne(loan);
                    });
                    return Ok("Loan Created successfully");

                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
        [HttpPut("Update")]
        public async Task<IActionResult> Update()
        {
            try
            {
                using(var stream = new StreamReader(Request.Body))
                {
                    var requestContent = await stream.ReadToEndAsync();
                    var requestJObj = Newtonsoft.Json.JsonConvert.DeserializeObject<JObject>(requestContent);
                    var loanId = Convert.ToInt32(requestJObj!["loanId"]?.ToString());
                    var loan = await Task.Run(() =>
                    {
                        return _manager.LoanService.GetOne(loanId, true);
                    });
                    if(loan is not null)
                    {
                        await Task.Run(() =>
                        {
                            _manager.LoanService.UpdateOne(loan);
                        });
                        return Ok("Loan Updated successfully.");
                    }
                    else
                    {
                        return BadRequest("Loan Undefined.");
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
                var loan = await Task.Run(() =>
                {
                    return _manager.LoanService.GetOne(id, true);
                });
                if (loan is not null)
                {
                    await Task.Run(() =>
                    {
                        _manager.LoanService.DeleteOne(id);
                    });
                    return Ok("Loan Deleted successfully.");
                }
                else
                {
                    return BadRequest("Loan Undefined.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }
    }
}
