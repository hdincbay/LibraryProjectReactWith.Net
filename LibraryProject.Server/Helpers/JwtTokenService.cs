using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LibraryProject.Server.Helpers
{
    public class JwtTokenService
    {
        private readonly IConfiguration _configuration;
        private readonly SymmetricSecurityKey _signingKey;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
            var secretKey = _configuration["JwtSettings:SecretKey"];
            _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        }

        public string GenerateJwtToken(IdentityUser user)
        {
            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserName!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, user.UserName!)
        };

            var signingCredentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpiryMinutes"])),
                signingCredentials: signingCredentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
