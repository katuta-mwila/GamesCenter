using System.Text.RegularExpressions;

namespace GamesHub.Protocol;
public class Error
{
    public string msg {get; set;}
    public string code {get; set;}

    public static List<Error> GenericStringErrors(string text, int minLength, int maxLength, Regex? regex, string fieldName)
    {
        List<Error> errors = new List<Error>();
        if (text.Length < minLength || text.Length > maxLength)
        {
            errors.Add(new Error($"{fieldName} must be between {minLength} and {maxLength} characters", $"{fieldName.ToLower()}_incorrect_length"));
        }
        if (regex != null && !regex.Match(text).Success)
        {
            errors.Add(new Error($"{fieldName} does not match required format", $"{fieldName.ToLower()}_format_mismatch"));
        }
        return errors;
    }

    public Error(string msg, string code)
    {
        this.msg = msg;
        this.code = code;
    }

    public override string ToString()
    {
        return $"{code},{msg}";
    }
}