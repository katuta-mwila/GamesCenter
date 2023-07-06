using GamesHub.Auth;
using GamesHub.Protocol.Response;

namespace GamesHub.MiddleWare;

public class AuthorizationShortCircuit
{
    protected readonly RequestDelegate _next;
    protected readonly ILogger _logger;
    protected readonly bool guestAllowed;

    public AuthorizationShortCircuit(RequestDelegate next, ILoggerFactory loggerFactory, bool guestAllowed)
    {
        this._next = next;
        this._logger = loggerFactory.CreateLogger("AuthorizationShortCircuit");
        this.guestAllowed = guestAllowed;
    }

    public async Task Invoke(HttpContext context)
    {
        //_logger.LogDebug(context.Request.Path.ToString());
        TokenObject? tokenInfo =(TokenObject?) context.Items["TokenObject"];
        if (tokenInfo == null || (!this.guestAllowed && tokenInfo.IsGuest))
        {
            //_logger.LogError("Authorization Rejected");
            GeneralResponse response = new GeneralResponse();
            response.ErrorCollection.AddError("global", "Session is not valid", "global_invalid_session");
            response.message = "Session is not valid";
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(response);
            return;
        }
        await _next(context);
    }
}