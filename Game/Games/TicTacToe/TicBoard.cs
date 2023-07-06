using GamesHub.Game.Games.Exceptions;

namespace GamesHub.Game.Games.TicTacToe;

public class TicBoard : GameBoard
{
    public Dictionary<Slot, string> slotToSymbol = new Dictionary<Slot, string>()
    {
        {Slot.Empty, "_"},
        {Slot.Player1, "X"},
        {Slot.Player2, "O"}
    };
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
    public override void InitBoard()
    {
        this.Board = new object[3, 3];
        for (int row = 0; row < 3; row++)
        {
            for (int column = 0; column < 3; column++)
            {
                this[column, row] = Slot.Empty;
            }
        }
    }
    public bool ValidSlot(int column, int row)
    {
        return (column >= 0 && column <= 2 && row >= 0 && row <= 2 && this[column, row] == Slot.Empty);
    }
    public override int PlaceOnBoard(IPlayerMoveData moveData, Slot slot)
    {
        if (moveData is TicMoveData data && this.ValidSlot(data.Column, data.Row))
        {
            this.Board[data.Column, data.Row] = slot;
            return 0;
        } 
        throw new PlayerMoveException(PlayerMoveError.InvalidMove);
    }

    public override void PrintBoard()
    {
        System.Console.WriteLine("\n-----------------\n");
        string boardText = "";
        for (int i = 0; i <= 2; i++)
        {
            for (int j = 0; j <= 2; j++)
            {
                boardText += slotToSymbol[this[j, i]];
                boardText += " ";
            }
            boardText += "\n";
        }
        System.Console.WriteLine(boardText);
        System.Console.WriteLine("\n-----------------\n");
    }
}