using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.RegularExpressions;
using GamesHub.Protocol.Request;

namespace GamesHub.Protocol.Request;

public class LoginDto : GeneralDto
{
   // [StringLength(32, MinimumLength = 2)]
    public string Username {get; set;}
    public string Password {get; set;}
    public override ErrorCollection GetClientErrors()
    {
        ErrorCollection collection = new ErrorCollection();
        if (!this.ReturnClientErrors) return collection;
        Regex usernameRegex = new Regex("^[a-zA-Z0-9_]+$");
        Regex passwordRegex = new Regex("^[\\x00-\\x7F]+$");
        List<Error> usernameErrors = Error.GenericStringErrors(Username, 2, 32, usernameRegex, "Username");
        List<Error> passwordErrors = Error.GenericStringErrors(Password, 8, 32, passwordRegex, "Password");
        collection.AddErrors("login_username", usernameErrors);
        collection.AddErrors("login_password", passwordErrors);
        if (Username.StartsWith("guest"))
            collection.AddError("login_username", "Username can not start with 'guest'", "username_invalid_name");
        return collection;
    }
}