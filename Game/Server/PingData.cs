using System.Net.WebSockets;
using System.Text.Json.Serialization;

namespace GamesHub.Game.Server;

public class PingData
{
    public static int PingTimout = 10; // client should send ping/message more frequently than PingTimeOout seconds
    [JsonIgnore]
    public CancellationTokenSource TokenSource {get; set;}
    public DateTime LastPing {get; set;}
    [JsonIgnore]
    public WebSocket WebSocket {get; set;}
    public Guid UserId {get; set;}
    public string GameCode {get; set;}

    public bool TimoutExceeded(DateTime now)
    {
        TimeSpan timespan = now - LastPing;
        return (timespan.TotalSeconds > PingTimout);
    }

    public int TimeSinceLastPing
    {
        get
        {
            TimeSpan timespan = DateTime.UtcNow - LastPing;
            return timespan.Seconds;
        }
    }
}