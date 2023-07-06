namespace GamesHub.Exceptions;

public class HttpResponseException : Exception
{
    public int StatusCode {get;}
    public string errorCollection {get;}
    public string message {get;}
    public string code {get;}

    public HttpResponseException(int statusCode)
    {
        this.StatusCode = statusCode;
    }

    public HttpResponseException(int statusCode, string errorCollection, string message, string code)
    {
        this.StatusCode = statusCode;
        this.errorCollection = errorCollection;
        this.message = message;
        this.code = code;
    }
}