namespace GamesHub.Game.Games;

public class CurrentGameData
{
    public GameBoard Board {get; set;}
    public int TotalMoves {get; set;}
    public int TotalGames {get; set;}
    public int CurrentPlayer {get; set;}
    public GameState GameState {get; set;}
    public int PlayerOneScore {get; set;}
    public int PlayerTwoScore {get; set;}
    public int StartingPlayer {get; set;}
    public bool[] RestartRequests {get; set;} = new bool[2];
    public string History {get; set;}
    public object[] GameSpecificData {get; set;}

}