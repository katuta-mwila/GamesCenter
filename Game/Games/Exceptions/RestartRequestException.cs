namespace GamesHub.Game.Games.Exceptions;

public class RestartRequestException : Exception
{
    public RestartError RestartError {get; set;}
    public RestartRequestException(RestartError error)
    {
        this.RestartError = error;
    }
}

public enum RestartError
{
    GameAlive,
    AlreadyRequested,
    InvalidPlayer,
}