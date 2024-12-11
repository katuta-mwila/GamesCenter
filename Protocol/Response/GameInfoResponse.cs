using GamesHub.Game.Server;

namespace GamesHub.Protocol.Response;

public class GameInfoResponse : GeneralResponse
{
    public IDictionary<string, GameSession> CurrentGames {get; set;}
}