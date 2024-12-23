using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace GamesHub.Auth;
/* ---- DEPRECIATED ---- */
public static class AuthHelper
{
    public static IConfiguration configuration;
    /*public static Password CreateHashedPassword(string password)
    {
        var hmac = new HMACSHA512();
        byte[] salt = hmac.Key;
        byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return new Password
        {
            PasswordSalt=salt,
            PasswordHash=hash
        };
    }*/

    /*public static bool VerifyPasswordHash(string checkPassword, Password password)
    {
        var hmac = new HMACSHA512(password.PasswordSalt);
        byte[] computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(checkPassword));
        return computedHash.SequenceEqual(password.PasswordHash);
    }*/

    public static string CreateToken(string username, Guid userId, int token_expires=30)
    {
        JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
        SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetSection("Auth:key").Value));
        SecurityTokenDescriptor descripter = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]{
                new Claim("UserId", userId.ToString()),
                new Claim("Username", username)
            }),
            Expires = DateTime.Now.AddDays(token_expires),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature)
        };
        SecurityToken token = handler.CreateToken(descripter);
        return handler.WriteToken(token);
    }

    public static TokenObject? ValidateToken(string token)
        {
            if (token == null)
                return null;
            JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetSection("Auth:key").Value));
            TokenValidationParameters tokenValidation = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };
            try{
                handler.ValidateToken(token, tokenValidation, out SecurityToken validatedToken);
                JwtSecurityToken jwtToken = (JwtSecurityToken) validatedToken;
                Guid user_id = new Guid(jwtToken.Claims.First(x => x.Type == "UserId").Value);
                string username = jwtToken.Claims.First(x => x.Type == "Username").Value.ToString();
                return new TokenObject{
                    UserId = user_id,
                    Username = username,
                };
            } catch (Exception e){
                //Console.WriteLine(e.Message);
                return null;
            }
        }

}