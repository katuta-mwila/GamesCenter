
namespace GamesHub.Game.Server;

using System.Text.Json.Serialization;
using GamesHub.Game.Games;
using GamesHub.Game.Games.Connect4;
using GamesHub.Game.Games.TicTacToe;
using GamesHub.Game.Games.Checkers;

public class GameSession
{
    public static Dictionary<string, Type> GamesTypes = new Dictionary<string, Type>()
    {
        {"tictactoe", typeof(TicGame)},
        {"connect4", typeof(ConnectGame)},
        {"checkers", typeof(CheckGame)}
    };
    public readonly string Code;
    public readonly string GameId;
    public PlayerSession HostSession {get; set;}
    public PlayerSession PeerSession {get; set;}
    public bool SessionAlive {get; set;} = true;
    public bool CanTimeOut {get; set;} = true;
    public bool CanStartGame
    {
        get
        {
            return HostSession.IsConnected && (PeerSession != null && PeerSession.IsConnected) && (Game == null || Game.GameState != GameState.Alive);
        } 
    }
    [JsonIgnore]
    public Game Game {get; set;}
    public GameSession(string code, string gameId)
    {
        this.Code = code;
        this.GameId = gameId;
    }
    public PlayerSession? SessionFromUserId(Guid userId)
    {
        if (HostSession != null && HostSession.UserId.Equals(userId))
            return HostSession;
        if (PeerSession != null && PeerSession.UserId.Equals(userId))
            return PeerSession;
        return null;
    }

    public PlayerSession? GetOppositeSession(PlayerSession session){
        if (HostSession == session)
            return PeerSession;
        if (PeerSession == session)
            return HostSession;
        return null;
    }
    public async Task SendHostMessage(object message)
    {
        HostSession.SendMessage(message);
    }

    public async Task SendPeerMessage(object message)
    {
        if (PeerSession != null)
            PeerSession.SendMessage(message);
    }

    public async Task BroadcastMessage(object message)
    {
        List<Task> tasks = new List<Task>()
        {
            SendHostMessage(message),
            SendPeerMessage(message)
        };
        await Task.WhenAll(tasks);
    }

    public void CreateGameInstance()
    {
        //System.Console.WriteLine("Game instance created");
        if (this.Game != null && this.Game.GameState != GameState.Cancelled)
            return;
        Player player1 = new Player(HostSession);
        Player player2 = new Player(PeerSession);
        this.Game = (Game) Activator.CreateInstance(GamesTypes[GameId], new object[]{player1, player2});
        this.Game.Start();
    }
    public async Task OnPlayerConnect(PlayerSession connectingSession, bool firstConnection)
    {
       // System.Console.WriteLine("ONPLAYERCONNECT");
        PlayerSession? OpponentSession = GetOppositeSession(connectingSession);
        ConnectionServerMessage message = new ConnectionServerMessage();
        message.HostSession = this.HostSession;
        message.PeerSession = this.PeerSession;
        message.ChatMessages.Add(ChatMessage.Info("You have connected to the game"));
        connectingSession.LastPing = DateTime.UtcNow;
        if (this.CanStartGame && (this.Game == null || this.Game.GameState == GameState.Cancelled))
        {
            this.CreateGameInstance();
        }

        if (this.Game != null)
        {
            message.CurrentGameData = this.Game.GetCurrentGameData();
            if (this.Game.GameState == GameState.Cancelled && connectingSession == this.HostSession)
                message.ChatMessages.Add(ChatMessage.Info("The game will restart once a player joins the game"));
        } else{
            message.ChatMessages.Add(ChatMessage.Info("The game will start when your opponent connects to the game"));
        }
        await connectingSession.SendMessage(message);

        if (OpponentSession != null)
        {
            OpponentConnectedServerMessage msg = new OpponentConnectedServerMessage
            {
                OpponentSession = connectingSession,
                ShouldStartGame = this.Game != null && this.Game.GameState == GameState.Alive
            };
            msg.ChatMessages.Add(ChatMessage.Info($"{connectingSession.Username} has connected the game"));
            await OpponentSession.SendMessage(msg);
        }
    }

    public async Task OnPlayerDisconnect(PlayerSession disconnectingSession)
    {
        //System.Console.WriteLine("ONPLAYERDISCONNECT");
        disconnectingSession.DisconnectedSince = DateTime.UtcNow;
        PlayerSession? OpponentSession = GetOppositeSession(disconnectingSession);
        if (OpponentSession != null && !disconnectingSession.TimedOut)
        {
            OpponentDisconnectedServerMessage msg = new OpponentDisconnectedServerMessage();
            msg.ChatMessages.Add(ChatMessage.Info($"{disconnectingSession.Username} has disconnected from the game"));
            await OpponentSession.SendMessage(msg);
        }
    }

    private bool CheckForTimeOut(PlayerSession session, DateTime now) // returns true if the player is to be timed considered timedout
    {
        if (session != null && session.TimedOut) return true;
        if (session == null || session.IsConnected || !this.CanTimeOut) return false;
        bool isHost = session == this.HostSession;
        TimeSpan span = now - session.DisconnectedSince;
        if (span.TotalSeconds >= PlayerSession.ConnectionTimeout)
        {
            TimeoutPlayerSession(session);
            return true;
        }
        return false;
    }

    public void TimeoutPlayerSession(PlayerSession session)
    {
        bool isHost = session == this.HostSession;
        session.TimedOut = true;
        if (this.Game != null)
            this.Game.GameState = GameState.Cancelled;
        OpponentTimedOutServerMessage msg = new OpponentTimedOutServerMessage();
        if (session == this.PeerSession)
        {
            msg.ChatMessages.Add(ChatMessage.Info(session.Username + " has left the game"));
            msg.ChatMessages.Add(ChatMessage.Info("The game will restart once a player joins the game"));
        }
        else
        {
            msg.ChatMessages.Add(ChatMessage.Info("The host has left the game, the game has now been terminated"));
        }
        this.BroadcastMessage(msg);
    }

    public bool OnInterval(DateTime now)
    {
        bool shouldEndSession = false;
        shouldEndSession = false || this.CheckForTimeOut(this.HostSession, now);
        this.CheckForTimeOut(this.PeerSession, now);
        return shouldEndSession;
    }

    public bool ContainsActiveUserId(Guid UserId)
    {
        return ((this.HostSession.UserId.Equals(UserId) && !this.HostSession.TimedOut) || (this.PeerSession != null && !this.PeerSession.TimedOut && this.PeerSession.UserId.Equals(UserId)));
    }

    public async Task EndSession()
    {
        //System.Console.WriteLine("Ending Session: " + this.Code);
        this.SessionAlive = false;
        if (this.HostSession.IsConnected)
        {
            await this.HostSession.CloseConnectionAsync();
        }
        if (this.PeerSession != null && this.PeerSession.IsConnected)
        {
            await this.PeerSession.CloseConnectionAsync();
        }
    }

    public void CheckPingStates(DateTime now)
    {
        if (this.HostSession.IsConnected && this.HostSession.TimoutExceeded(now))
            this.HostSession.CloseConnectionAsync("Closing due to timeout");
        if (this.PeerSession != null && this.PeerSession.IsConnected && this.PeerSession.TimoutExceeded(now))
            this.PeerSession.CloseConnectionAsync("Closing due to timeout");
    }

    public async Task VoluntaryLeave(PlayerSession session)
    {
        await session.CloseConnectionAsync();
        this.TimeoutPlayerSession(session);
    }
}