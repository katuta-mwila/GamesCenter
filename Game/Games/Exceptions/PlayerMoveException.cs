namespace GamesHub.Game.Games.Exceptions;

public class PlayerMoveException : Exception
{
    public PlayerMoveError PlayerMoveError {get; set;}

    public PlayerMoveException(PlayerMoveError err)
    {
        this.PlayerMoveError = err;
    }
}

public enum PlayerMoveError
{
    FormatMismatch,
    ClientOutOfSync,
    InvalidMove,
    NotPlayersTurn,
}