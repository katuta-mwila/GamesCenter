using System.Net.WebSockets;
using System.Text;
using GamesHub.Auth;
using GamesHub.Filters;
using GamesHub.Game.Server;
using GamesHub.Protocol.Response;
using Microsoft.AspNetCore.Mvc;

namespace GamesHub.Controllers;

[ApiController]
[Route("")]
public class MainController : ControllerBase
{
    private ILogger<MainController> _logger;
    private GameServer server;

    public MainController(ILogger<MainController> _logger, GameServer server)
    {
        this._logger = _logger;
        this.server = server;
    }

    /*public IActionResult Index()
    {
        _logger.LogDebug("Connection Received");
        return Ok();
    }*/


    /* NEEDS CHANGES / REVIEW */
    [Route("/ws/{gameId}/{code}")]
    [ServiceFilter(typeof(HttpResponseExceptionFilter))] // allow pipeline short circuiting
    [ServiceFilter(typeof(GenericResourceFilter<GeneralResponse>))] // create response object
    public async Task Get(string gameId, string code)
    {
        //_logger.LogDebug($"Websocket connection requested with game code {code}");
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            TokenObject token = (TokenObject) HttpContext.Items["TokenObject"];
            using WebSocket webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            if (!server.SessionExists(gameId, code) || !server.PlayerIsInGame(code, token.UserId))
            {
                await webSocket.CloseAsync(
                    WebSocketCloseStatus.PolicyViolation,
                    "invalid_connection_code",
                    CancellationToken.None);
                //HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                return;
            } else if (server.PlayerIsCurrentlyConnected(code, token.UserId))
            {
                await webSocket.CloseAsync(
                    WebSocketCloseStatus.PolicyViolation,
                    "duplicate_connection",
                    CancellationToken.None);
                //HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                return;
            }
            await server.Echo(webSocket, token, code);
        } else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
}
