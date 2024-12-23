using System.Text;
using GamesHub.Auth;
using GamesHub.Filters;
using GamesHub.Game.Server;
using GamesHub.Protocol.Request;
using GamesHub.Protocol.Response;
using Microsoft.AspNetCore.Mvc;

namespace GamesHub.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private ILogger<GameController> _logger;
    private GameServer gameServer;
    
    public GameController(ILogger<GameController> logger, GameServer server)
    {
        this._logger = logger;
        this.gameServer = server;
        //_logger.LogInformation("GameController loaded");
    }

    [HttpGet("alive")]
    public IActionResult Alive()
    {
        return Ok($"GameController is alive");
    }

    /* ---- DEPRECIATED ---- */
    /*[HttpPost("autha/add-history")]
    [ServiceFilter(typeof(ValidationFilterAttribute))] // validate object in parameter using GetErrorCollections
    [ServiceFilter(typeof(GenericResourceFilter<GeneralResponse>))] // create response object
    [ServiceFilter(typeof(HttpResponseExceptionFilter))] // allow pipeline short circuiting
    public async Task<IActionResult> AddHistory(HistoryDto historyDto)
    {
        GeneralResponse response = (GeneralResponse) HttpContext.Items["CustomResponse"];
        TokenObject tokenObject = (TokenObject) HttpContext.Items["TokenObject"];
        GameHistory history = new GameHistory
        {
            GameHistoryId = Guid.NewGuid(),
            GameId = historyDto.GameId,
            UserId = tokenObject.UserId,
            Name = historyDto.Name,
            OppName = historyDto.OppName,
            Sequence = historyDto.Sequence,
            OwnerIsPlayerOne = historyDto.OwnerIsPlayerOne,
            PlayerOneStarted = historyDto.PlayerOneStarted,
        };
        repository.CreateHistory(history);
        response.message = "Successfully made history :)";
        return Ok(response); 
    }*/

    /* NEEDS CHANGES / REVIEW */
    [HttpGet("authb/create-game/{gameId}")]
    [ServiceFilter(typeof(GenericResourceFilter<CreateGameResponse>))] // create response object
    [ServiceFilter(typeof(HttpResponseExceptionFilter))] // allow pipeline short circuiting
    public async Task<IActionResult> CreateGame(string gameId)
    {
        CreateGameResponse response = (CreateGameResponse) HttpContext.Items["CustomResponse"];
        TokenObject tokenObject = (TokenObject) HttpContext.Items["TokenObject"];
        string? code = this.gameServer.CreateGameSession(tokenObject, gameId);
        if (code == null)
        {
            return StatusCode(400, response);
        }
        response.GameCode = code;
        response.message = "Successfully created game with code " + code;
        return Ok(response);
    }

    /* NEEDS CHANGES / REVIEW */
    [HttpGet("authb/join-game/{gameId}/{code}")]
    [ServiceFilter(typeof(GenericResourceFilter<GeneralResponse>))] // create response object
    [ServiceFilter(typeof(HttpResponseExceptionFilter))] // allow pipeline short circuiting
    public async Task<IActionResult> JoinGame(string gameId, string code)
    {
        code = code.ToUpper();
        GeneralResponse response = (GeneralResponse) HttpContext.Items["CustomResponse"];
        TokenObject tokenObject = (TokenObject) HttpContext.Items["TokenObject"];
        GameSession session = gameServer.AddPeerToGame(gameId, code, tokenObject);
        response.message = "Successfully joined game";
        response.obj = session;
        return Ok(response);
    }

    // for postman purposes
    [HttpGet("gameserver-info")]
    [ServiceFilter(typeof(GenericResourceFilter<GameInfoResponse>))] // create response object
    public async Task<IActionResult> GameserverInfo()
    {
        GameInfoResponse response = (GameInfoResponse) HttpContext.Items["CustomResponse"];
        //response.CurrentConnections = gameServer.ClientPingMap;
        response.CurrentGames = gameServer.GameSessions;
        return Ok(response);
    }
}