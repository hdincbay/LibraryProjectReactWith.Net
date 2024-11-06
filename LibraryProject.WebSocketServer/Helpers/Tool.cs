using Newtonsoft.Json.Linq;
using RestSharp;
using System.Runtime.InteropServices.JavaScript;

namespace LibraryProject.WebSocketServer.Helpers
{
    public class Tool
    {
        public async Task<bool> Login(string url, RestClient client, string userName, string password)
        {
            string endpoint = url + "/api/User/Login";
            var request = new RestRequest(endpoint, Method.Post);
            var requestJObj = new JObject();
            requestJObj.Add("userName", userName);
            requestJObj.Add("password", password);
            var requestSrl = Newtonsoft.Json.JsonConvert.SerializeObject(requestJObj);
            request.AddBody(requestSrl);
            var response = await client.ExecuteAsync(request);
            if(response.IsSuccessStatusCode)
                return true;
            return false;
        }
    }
}
