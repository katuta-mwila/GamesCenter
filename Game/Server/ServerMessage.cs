using System.Text.Json.Serialization;
using GamesHub.Game.Games;

namespace GamesHub.Game.Server;

public class ServerMessage{
    public List<ChatMessage> ChatMessages {get; set;} = new List<ChatMessage>();

    public string MessageType
    {
        get
        {
            return this.GetType().Name;
        }
    }

    public string Message {get; set;} = "";

    public Protocol.ErrorCollection ErrorCollection {get; set;} = new Protocol.ErrorCollection();

    // public ServerMessage(){
    //     //System.Console.WriteLine(this.MessageType);
    // }
}

public class ConnectionServerMessage : ServerMessage // first time connection message
{
    public PlayerSession HostSession {get; set;}
    public PlayerSession PeerSession {get; set;}
    public CurrentGameData CurrentGameData {get; set;}
}

public class OpponentConnectedServerMessage : ServerMessage
{
    public PlayerSession OpponentSession {get; set;}
    public bool ShouldStartGame {get; set;}
}

public class OpponentDisconnectedServerMessage : ServerMessage
{
    //public PlayerSession DisconnectingPlayer {get; set;}
}
public class PlayerMoveServerMessage : ServerMessage
{
    [JsonConverter(typeof(PlayerMoveDataJsonConverter))]
    public IPlayerMoveData MoveData {get; set;}
}

public class GameDataUpdateServerMessage : ServerMessage // for when server simply needs to give the client all of the data again.
{
    public CurrentGameData CurrentGameData {get; set;}
}

public class RefreshPageServerMessage : ServerMessage // something weird has happend so just refresh clients page
{

}

public class RefreshRequestResponseServerMessage : ServerMessage
{
}

public class RestartDemandServerMessage : ServerMessage
{
    public string RequestingPlayer {get; set;}
    public int RestartRequests {get; set;}
}

public class OpponentTimedOutServerMessage : ServerMessage
{
}