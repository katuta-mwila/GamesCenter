namespace GamesHub.Game.Games.Checkers;

public class CheckPiece
{
    public int Column {get; set;} 
    public int Row {get; set;}
    public bool King {get; set;}
    public Slot Slot {get; set;}

    public int ToNumber()
    {
        return (2 * (int) this.Slot) - (this.King ? 0 : 1);
    }

    public override bool Equals(object? obj)
    {
        if (obj is CheckPiece comparePiece)
        {
            return comparePiece.Column == this.Column && comparePiece.Row == this.Row;
        }
        return false;
    }
}