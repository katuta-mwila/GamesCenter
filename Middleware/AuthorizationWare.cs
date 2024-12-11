using System.Text.Json;
using GamesHub.Auth;
using GamesHub.Protocol.Response;

namespace GamesHub.MiddleWare;

public class AuthorizationWare
{
    protected readonly RequestDelegate _next;
    protected readonly ILogger _logger;
    
    public AuthorizationWare(RequestDelegate next, ILoggerFactory loggerFactory)
    {
        this._next = next;
        this._logger = loggerFactory.CreateLogger("AuthorizationWare");
    }

    public async Task Invoke(HttpContext context)
    {
       // _logger.LogCritical(context.Request.Path.ToString());
        //var repository = context.RequestServices.GetRequiredService<AuthRepository>();
        //var dbContext = context.RequestServices.GetRequiredService<GamesHubContext>();
        string? token = context.Request.Cookies["gameshub_token"];
        PathString path = context.Request.Path.ToString().ToLowerInvariant();
        TokenObject? tokenInfo = AuthHelper.ValidateToken(token);
        context.Items["TokenObject"] = null;
        context.Items["InternalError"] = false;
        try
        {
            if (tokenInfo != null)
            {
                context.Items["TokenObject"] = tokenInfo;
                //_logger.LogCritical(JsonSerializer.Serialize(tokenInfo));
            }

        }
        catch (Exception e)
        {
            GeneralResponse response = new GeneralResponse();
            context.Items["InternalError"] = true;
            response.ErrorCollection.AddError("global", "An unexpected error has occured", "global_err_unknown");
            response.message = "An unexpected error has occured";
            
            if (path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = 500;
                await context.Response.WriteAsJsonAsync(response);
                return;
            } 
        }
        
        await _next(context);
    }
}