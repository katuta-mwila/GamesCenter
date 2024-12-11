using GamesHub.Game.Games.Exceptions;

namespace GamesHub.Game.Games.Connect4;

public class ConnectBoard : GameBoard
{
    public override void InitBoard()
    {
        this.Board = new object[7, 6];
        for (int row = 0; row < 6; row++)
        {
            for (int column = 0; column < 7; column++)
            {
                this[column, row] = Slot.Empty;
            }
        }
    }

    public Slot this[int column, int row]
    {
        get
        {
            return (Slot) this.Board[column, row];
        }
        set
        {
            this.Board[column, row] = value;
        }
    }

    public override int PlaceOnBoard(IPlayerMoveData moveData, Slot slot)
    {
        if (moveData is ConnectMoveData data && this.ValidPlacement(data.Column))
        {
            int row = this.FirstEmptyRow(data.Column);  
            this[data.Column, row] = slot;
            return 7 * row + data.Column;
        }
        throw new PlayerMoveException(PlayerMoveError.InvalidMove);
    }

    public override void PrintBoard()
    {
        string board = "";
        for (int row = 5; row >= 0; row--)
        {
            board += "[";
            for (int column = 0; column < 7; column++)
            {
                board += this.Board[column, row].ToString() + (column == 6 ? "" : ", ");
            }
            board += "]\n";
        }
        System.Console.WriteLine(board);
    }

    public int FirstEmptyRow(int column)
    {
        for (int row = 0; row < 6; row++)
        {
            if (this[column, row] == Slot.Empty)
                return row;
        }
        return 6;
    }

    public bool SlotExists(int column, int row)
    {
        return (column >= 0 && column <= 6 && row >= 0 && row <= 5);
    }

    public bool ValidPlacement(int column){
        return (column < 7 && column >= 0 && this.SlotExists(column, this.FirstEmptyRow(column)));
    }
}