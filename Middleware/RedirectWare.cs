using GamesHub.Auth;

namespace GamesHub.MiddleWare;

public class RedirectWare
{
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;
    public RedirectWare(RequestDelegate next, ILoggerFactory loggerFactory)
    {
        this._next = next;
        this._logger = loggerFactory.CreateLogger("RedirectWare");
    }

    public async Task Invoke(HttpContext context)
    {
        TokenObject? token = (TokenObject?) context.Items["TokenObject"];
        PathString path = context.Request.Path.ToString().ToLowerInvariant();
        bool isError = (bool) context.Items["InternalError"];
        if (isError && path.ToString() == "/down")
        {
            await _next(context);
            return;
        } else if (isError)
        {
            context.Response.Headers.Add("Location", "/down");
            context.Response.StatusCode = 303;
            return;
        }
        
       else if (path.StartsWithSegments("/games"))
        {
            if (token == null){
                context.Response.Headers.Add("Location", "/");
                context.Response.StatusCode = 303;
                return;
            }
            //_logger.LogInformation("/games");
        }
        await _next(context);
    }
}