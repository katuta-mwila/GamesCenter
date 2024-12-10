using System.Text.Json;
using GamesHub.Auth;
using GamesHub.Entities;
using GamesHub.Protocol.Response;
using GamesHub.Repositories;
using ResultsNet.Data;

namespace GamesHub.MiddleWare;

public class AuthorizationWare
{
    protected readonly RequestDelegate _next;
    protected readonly ILogger _logger;
    private readonly GuestAccounts guestAccounts;
    
    public AuthorizationWare(RequestDelegate next, ILoggerFactory loggerFactory, GuestAccounts guestAccounts)
    {
        this._next = next;
        this._logger = loggerFactory.CreateLogger("AuthorizationWare");
        this.guestAccounts = guestAccounts;
    }

    public async Task Invoke(HttpContext context)
    {
       // _logger.LogCritical(context.Request.Path.ToString());
        var repository = context.RequestServices.GetRequiredService<AuthRepository>();
        var dbContext = context.RequestServices.GetRequiredService<GamesHubContext>();
        string? token = context.Request.Cookies["gameshub_token"];
        PathString path = context.Request.Path.ToString().ToLowerInvariant();
        TokenObject? tokenInfo = AuthHelper.ValidateToken(token);
        context.Items["TokenObject"] = null;
        context.Items["InternalError"] = false;
        try
        {
            if (tokenInfo != null && ((tokenInfo.IsGuest && this.guestAccounts.IsValidGuest(tokenInfo.UserId)) || await repository.GetUser(tokenInfo.Username) != null))
            {
                context.Items["TokenObject"] = tokenInfo;
                //_logger.LogCritical(JsonSerializer.Serialize(tokenInfo));
            }

            if ((tokenInfo == null || tokenInfo.IsGuest) && !(await dbContext.Database.CanConnectAsync()))
            {
                throw new Exception();
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