using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace GamesHub.Game.Server;

public class PlayerSession
{
    public static int PingTimout = 5; // client should send ping/message more frequently than PingTimeOout seconds 
    public static int ConnectionTimeout = 30; // 
    [JsonIgnore]
    public GameSession GameSession;
    [JsonIgnore]
    public DateTime LastPing {get; set;}
    [JsonIgnore]
    public DateTime DisconnectedSince {get; set;}
    public bool TimedOut {get; set;} = false; // if player has been disconnected too long set true, player will no longer be welcome without clicking join again...
    public Guid UserId {get; set;}
    public string Username {get; set;}
    [JsonIgnore]
    public WebSocket? WebSocket {get; private set;} // websocket should be null if player is not connected
    [JsonIgnore]
    public bool HasConnected {get; set;} = false; // true if player has connected at least once
    public PlayerSession(GameSession session)
    {
        this.GameSession = session;
        this.LastPing = DateTime.UtcNow;
        this.DisconnectedSince = DateTime.UtcNow;
    }
    //[JsonIgnore]
    public bool IsConnected //does the player have an active websocket to the game
    {
        get
        {
            return WebSocket != null && WebSocket.State == WebSocketState.Open;
        }
    }
    public void SetSocket(WebSocket socket)
    {
        WebSocket = socket;
        HasConnected = true;
    }

    public async Task SendMessage(object message)
    {
        if (!this.IsConnected)
            return;
        string serialized = (message is string) ? (string) message : JsonSerializer.Serialize(message);
        byte[] serverMessage = Encoding.UTF8.GetBytes(serialized);
        try{
            await WebSocket.SendAsync(new ArraySegment<byte>(serverMessage, 0, serverMessage.Length), WebSocketMessageType.Text, true, GameServer.applicationLifetime.ApplicationStopping);
        } catch (WebSocketException e)
        {
            //System.Console.WriteLine(e.Message);
        }
    }

    public bool TimoutExceeded(DateTime now)
    {
        //System.Console.WriteLine($"\nNow: {now}\nLastPing: {LastPing}\n");
        TimeSpan timespan = now - LastPing;
        /*if (this.IsConnected && (timespan.TotalSeconds > PingTimout))
            System.Console.WriteLine("Timeout has exceeded");*/
        return this.IsConnected && (timespan.TotalSeconds > PingTimout);
    }

    public async Task CloseConnectionAsync(string closeMessage="connection closing")
    {
        try
        {
            await this.WebSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, closeMessage, GameServer.applicationLifetime.ApplicationStopping);
            this.WebSocket.Dispose();
            //await playerSession.GameSession.OnPlayerDisconnect(playerSession);
        } catch (WebSocketException e)
        {
        }
    
    }
    
}