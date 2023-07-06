using GamesHub.Game.Games.Exceptions;
using GamesHub.Game.Server;

namespace GamesHub.Game.Games;

public abstract class Game
{
    public GameBoard GameBoard {get; protected set;}
    protected int TotalMoves {get; set;}
    protected int TotalGames {get; set;} = 0;
    protected Player Player1 {get; set;}
    protected Player Player2 {get; set;}
    protected Player CurrentPlayer {get; set;}
    protected Player StartingPlayer {get; set;}
    protected HashSet<Player> RestartRequests {get; set;} = new HashSet<Player>();
    public GameState GameState {get; set;} = GameState.Dead;
    public string History {get; set;} = "";
    protected Player WaitingPlayer
    {
        get
        {
            return this.CurrentPlayer == this.Player1 ? this.Player2 : this.Player1;
        }
    }
    public Game(Player p1, Player p2)
    {
        this.Player1 = p1;
        this.Player2 = p2;
        this.CurrentPlayer = this.Player1;
        this.StartingPlayer = this.Player1;
    }
    public virtual void Start()
    {
        this.RestartRequests = new HashSet<Player>();
        this.GameState = GameState.Alive;
        this.TotalMoves = 0;
        this.History = "";
        this.GameBoard.InitBoard();
        this.CurrentPlayer = this.StartingPlayer;
        this.StartingPlayer = this.WaitingPlayer;
    }

    protected virtual void EndGame()
    {
        this.TotalGames++;
        this.GameState = GameState.Dead;
    }
    protected void ChangePlayer(){
        //System.Console.WriteLine(this.History);
        this.CurrentPlayer = this.WaitingPlayer;
    }
    public abstract ServerMessage AcceptMoveData(PlayerSession playerSession, string serializedData);
    protected abstract void CheckForEndGame();
    protected bool MoveIsUpToDate(IPlayerMoveData data)
    {
        return this.GameState == GameState.Alive && data.TotalMoves == this.TotalMoves;
    }

    public virtual CurrentGameData GetCurrentGameData()
    {
        CurrentGameData currentGameData = new CurrentGameData
        {
            Board = this.GameBoard,
            TotalMoves = this.TotalMoves,
            TotalGames = this.TotalGames,
            CurrentPlayer = this.CurrentPlayer == this.Player1 ? 1 : 2,
            StartingPlayer = this.StartingPlayer == this.Player1 ? 1 : 2,
            GameState = this.GameState,
            PlayerOneScore = this.Player1.score,
            PlayerTwoScore = this.Player2.score,
            History = this.History
        };
        if (RestartRequests.Contains(this.Player1))
            currentGameData.RestartRequests[0] = true;
        if (RestartRequests.Contains(this.Player2))
            currentGameData.RestartRequests[1] = true;
        return currentGameData;
    }

    protected void AddWin(Slot slot, bool endGame=false)
    {
        if (slot == Slot.Player1)
        {
            //System.Console.WriteLine("GAME IS WON BY PLAYER 1");
            this.Player1.score++;
        }     
        else
        {
            //System.Console.WriteLine("GAME IS WON BY PLAYER 2");
            this.Player2.score++;
        }

        if (endGame)
            this.EndGame();
    }

    public async Task SendRestartMessagesToClients(bool restartConfirmed, PlayerSession requestingPlayer){
        PlayerSession otherSession = requestingPlayer.GameSession.GetOppositeSession(requestingPlayer);
        RestartDemandServerMessage requestingPlayerMessage = new RestartDemandServerMessage{
            RestartRequests = restartConfirmed ? 2 : 1,
            RequestingPlayer = requestingPlayer.Username
        };
        requestingPlayerMessage.ChatMessages.Add(ChatMessage.Info(restartConfirmed ? "The game is being replayed" : "You have voted to replay the game"));
        await requestingPlayer.SendMessage(requestingPlayerMessage);

        RestartDemandServerMessage otherPlayerMessage = new RestartDemandServerMessage{
            RestartRequests = restartConfirmed ? 2 : 1,
            RequestingPlayer = requestingPlayer.Username
        };
        otherPlayerMessage.ChatMessages.Add(ChatMessage.Info(restartConfirmed ? "The game is being replayed" : requestingPlayer.Username + " has voted to replay the game"));
        await requestingPlayer.GameSession.GetOppositeSession(requestingPlayer).SendMessage(otherPlayerMessage);
    }

    public async Task RequestRestart(Player requestingPlayer)
    {
        //System.Console.WriteLine($"Restart Requested by: {requestingPlayer.CurrentSession.Username}");
        if (this.GameState != GameState.Dead)
            throw new RestartRequestException(RestartError.GameAlive);
        if (this.RestartRequests.Contains(requestingPlayer))
            throw new RestartRequestException(RestartError.AlreadyRequested);
        this.RestartRequests.Add(requestingPlayer);
        int a = this.RestartRequests.Count;
        if (this.RestartRequests.Count == 2)
        {
            this.Start();
        }
        await SendRestartMessagesToClients(a == 2, requestingPlayer.CurrentSession);
    }

    public async Task RequestRestart(PlayerSession requestingPlayer)
    {
        if (requestingPlayer == this.Player1.CurrentSession)
            await this.RequestRestart(this.Player1);
        else if (requestingPlayer == this.Player2.CurrentSession)
            await this.RequestRestart(this.Player2);
        else 
            throw new RestartRequestException(RestartError.InvalidPlayer);
    }

    public Player PlayerFromSession(PlayerSession session)
    {
        return session == this.Player1.CurrentSession ? this.Player1 : this.Player2;
    }

    public ServerMessage GetMoveErrorServerMessage(PlayerMoveError error, ServerMessage defaultMessage)
    {
        switch (error)
            {
                case PlayerMoveError.FormatMismatch:
                    //System.Console.WriteLine("Format Mismatch error");
                    defaultMessage.ErrorCollection.AddError("global", "error has occured", "err_unkown");
                    break;
                case PlayerMoveError.ClientOutOfSync:
                    //System.Console.WriteLine("Client out of sync error");
                    return new GameDataUpdateServerMessage{
                        CurrentGameData = this.GetCurrentGameData()
                    };
                case PlayerMoveError.InvalidMove:
                    //System.Console.WriteLine("Invalid move");
                    return new GameDataUpdateServerMessage{
                        CurrentGameData = this.GetCurrentGameData()
                    };
                case PlayerMoveError.NotPlayersTurn:
                    //System.Console.WriteLine("Not Players Turn");
                    return new GameDataUpdateServerMessage{
                        CurrentGameData = this.GetCurrentGameData()
                    };
            }
        return defaultMessage;
    }
}

public enum GameState
{
    Dead,
    Alive,
    Cancelled,
}