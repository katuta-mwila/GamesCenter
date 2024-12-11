using GamesHub.Game.Games.Exceptions;

namespace GamesHub.Game.Games.Checkers;

public class CheckBoard : GameBoard
{
    public int this[int column, int row]
    {
        get
        {
            return (int) this.Board[column, row];
        }
        set
        {
            this.Board[column, row] = value;
        }
    }
    public override void InitBoard()
    {
        /*this.Board = new object[8, 8]
        {
            {0, 0, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0, 0},
        };*/
        this.Board = new object[8, 8]
        {
            {0, 1, 0, 0, 0, 3, 0, 3},
            {1, 0, 1, 0, 0, 0, 3, 0},
            {0, 1, 0, 0, 0, 3, 0, 3},
            {1, 0, 1, 0, 0, 0, 3, 0},
            {0, 1, 0, 0, 0, 3, 0, 3},
            {1, 0, 1, 0, 0, 0, 3, 0},
            {0, 1, 0, 0, 0, 3, 0, 3},
            {1, 0, 1, 0, 0, 0, 3, 0},
        };

        /*object[,] testBoard = new object[8, 8]
        {
            {0, 0, 0, 0, 0, 0, 0, 1},
            {0, 0, 0, 0, 1, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0, 1},
            {0, 0, 1, 0, 0, 0, 0, 0},
            {0, 3, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 0, 0, 0, 0, 0},
            {0, 3, 0, 0, 0, 0, 0, 0},
            {0, 0, 0, 0, 3, 0, 3, 0},
        };
        
        for (int row = 0; row < 8; row++)
        {
            for (int column = 0; column < 8; column++)
            {
                this.Board[row, column] = testBoard[column, row];
            }
        }
        //this.PrintBoard();*/
    }

    public bool IsPlayable(int column, int row)
    {
        return ((row % 2 == 0) != (column % 2 == 0)) && row >= 0 && row <= 7 && column >= 0 && column <= 7; 
    }

    private bool CanMoveDirection(CheckPiece fromPiece, CheckPiece toPiece)
    {
        int dir = toPiece.Row - fromPiece.Row;
        return fromPiece.King || (fromPiece.Slot == Slot.Player1 && dir > 0) || (fromPiece.Slot == Slot.Player2 && dir < 0);
    }

    private bool IsValidMove(Slot playerSlot, CheckPiece? fromPiece, CheckPiece? toPiece)
    {
        if (fromPiece == null || toPiece == null || fromPiece.Slot != playerSlot || fromPiece.Equals(toPiece) 
        || toPiece.Slot != Slot.Empty || !this.CanMoveDirection(fromPiece, toPiece))
         return false;
        if (Math.Abs(fromPiece.Row - toPiece.Row) == 1 && Math.Abs(fromPiece.Column - toPiece.Column) == 1)
        {
            return true;
        } else if (Math.Abs(fromPiece.Row - toPiece.Row) == 2 && Math.Abs(fromPiece.Column - toPiece.Column) == 2)
        {
            CheckPiece removePiece = this.FromBoard((fromPiece.Column + toPiece.Column) / 2, (fromPiece.Row + toPiece.Row) / 2);
            if (removePiece != null && removePiece.Slot != Slot.Empty && removePiece.Slot != playerSlot)    
                return true;
        }
        return false;
    }

    public override int PlaceOnBoard(IPlayerMoveData moveData, Slot slot)
    {
        if (moveData is CheckMoveData data)
        {
            CheckPiece? movePiece = this.FromBoard(data.FromColumn, data.FromRow);
            CheckPiece? toPiece = this.FromBoard(data.ToColumn, data.ToRow);
            if (!this.IsValidMove(slot, movePiece, toPiece))
                throw new PlayerMoveException(PlayerMoveError.InvalidMove);
            this[movePiece.Column, movePiece.Row] = 0;
            this[toPiece.Column, toPiece.Row] = movePiece.ToNumber();
            return 1;
        }
        
        throw new PlayerMoveException(PlayerMoveError.FormatMismatch);
    }

    public CheckPiece? FromBoard(int column, int row)
    {
        if (!this.IsPlayable(column, row))
            return null;
        int n = this[column, row];    
        CheckPiece piece = new CheckPiece
        {
            Column = column,
            Row = row,
            King = n > 0 && n % 2 == 0,
        };
        if (n == 0)
            piece.Slot = Slot.Empty;
        else if (n <= 2)
            piece.Slot = Slot.Player1;
        else
            piece.Slot = Slot.Player2;
        return piece;
    }

    public void ApplyPiece(CheckPiece piece)
    {
        this[piece.Column, piece.Row] = piece.ToNumber();
    }

    public override void PrintBoard()
    {
        string text = "";
        for (int row = 0; row < 8; row++)
        {
            text += "[";
            for (int column = 0; column < 8; column++)
            {
                text += this[column, row] + ((column == 7) ? "" : ", ");
            }
            text += "]\n";
        }
        System.Console.WriteLine(text);
    }
}