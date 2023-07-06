using System.Text.Json.Serialization;

namespace GamesHub.Game.Games;

[JsonConverter(typeof(GameBoardJsonConverter))]
public abstract class GameBoard
{
     public object[,] Board {get; protected set;}
     /*public object this[int column, int row]
     {
        get
        {
            return Board[column, row];
        }
        private set
        {
            Board[column, row] = value;
        }
     }*/

    public abstract void InitBoard();
    public abstract int PlaceOnBoard(IPlayerMoveData moveData, Slot slot);
    public abstract void PrintBoard();
}

public enum Slot : Byte
{
    Empty,
    Player1,
    Player2,
}