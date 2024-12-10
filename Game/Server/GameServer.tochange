using System.Collections.Concurrent;
using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using GamesHub.Auth;
using GamesHub.Exceptions;
using GamesHub.Game.Games;
using GamesHub.Game.Games.Exceptions;
using GamesHub.Game.Server.ClientMessages;
using GamesHub.Protocol;

namespace GamesHub.Game.Server;

public class GameServer
{
    private readonly ILogger<GameServer> _logger;
    private TcpListener server = null;
    public ConcurrentDictionary<string, GameSession> GameSessions = new ConcurrentDictionary<string, GameSession>();
    public static IHostApplicationLifetime applicationLifetime;
    public GameServer(ILogger<GameServer> logger, IHostApplicationLifetime lifetime)
    {
        this._logger = logger;
        applicationLifetime = lifetime;
        
        Thread thread = new Thread(this.GameSessionInterval)
        {
            IsBackground = true
        };
        thread.Start();

        /*GameSession session = new GameSession("ABC123", "tictactoe");
        session.CanTimeOut = false;
        session.HostSession = new PlayerSession(session)
        {
            UserId = new Guid("b8ee8664-6762-4944-b393-e33136fc3068"),
            Username = "KTBM"
        };

        session.PeerSession = new PlayerSession(session)
        {
            UserId = new Guid("7567754c-c8d0-4061-a028-97eea725167b"),
            Username = "Chad"
        };
        GameSessions.TryAdd("ABC123", session);
        session.CreateGameInstance();*/
    }

    public async Task Echo(WebSocket webSocket, TokenObject token, string code)
    {
        string id = Guid.NewGuid().ToString();
        GameSession gameSession = null;
        bool successfull = PlayerIsInGame(code, token.UserId) && GameSessions.TryGetValue(code.ToUpper(), out gameSession) && gameSession.SessionAlive;
        if (!successfull || !(webSocket.State == WebSocketState.Open || webSocket.State == WebSocketState.CloseSent))
        {
            await CloseConnectionAsync(webSocket);
            return;
        }
        bool isHost = gameSession.HostSession.UserId.Equals(token.UserId);
        PlayerSession tokenSession = isHost ? gameSession.HostSession : gameSession.PeerSession;
        tokenSession.LastPing = DateTime.UtcNow;
       // PlayerSession oppositionSession = !isHost ? gameSession.HostSession : gameSession.PeerSession;
        bool firstConnection = !tokenSession.HasConnected;
        tokenSession.SetSocket(webSocket);
        await gameSession.OnPlayerConnect(tokenSession, firstConnection);

        try
        {
            var buffer = new byte[1024 * 4];
            var receiveResult = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer), applicationLifetime.ApplicationStopping);
            while (!receiveResult.CloseStatus.HasValue)
            {
                tokenSession.LastPing = DateTime.UtcNow;
                string clientMessage = System.Text.Encoding.ASCII.GetString(buffer, 0, receiveResult.Count);
                string serverMessage = token.UserId + ": " + clientMessage;
                if (clientMessage.EqualsIgnoreCase("ping"))
                {
                    await tokenSession.SendMessage("pong");
                } else
                {
                    await AcceptClientMessage(tokenSession, clientMessage);
                }

                receiveResult = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(buffer), applicationLifetime.ApplicationStopping);
            }
        } catch (WebSocketException e){
            //_logger.LogCritical(e.Message);
            webSocket.Dispose();
            await tokenSession.GameSession.OnPlayerDisconnect(tokenSession);
        } catch (Exception e)
        {
            throw e;
        }
        await CloseConnectionAsync(tokenSession);
    }


    private async Task AcceptClientMessage(PlayerSession session, string clientMessage)
    {
        string[] split = clientMessage.Split("_");
        string messageType = split[0];
        string json = split[1];
        if (split.Length != 2) return;
       /*_logger.LogDebug("CLIENT MESSAGE");
        _logger.LogDebug(messageType + ": " + json);*/
        switch(messageType)
        {
            case "GameMoveData":
                if (session.GameSession.Game != null && session.GameSession.Game.GameState == GameState.Alive)
                {
                    var msg = session.GameSession.Game.AcceptMoveData(session, json);
                    //_logger.LogCritical(JsonSerializer.Serialize((object) msg));
                    if (!msg.ErrorCollection.hasErrors())
                        await session.GameSession.BroadcastMessage(msg); 
                    else
                        await session.SendMessage(msg); 
                } else
                {
                    await session.SendMessage(new RefreshPageServerMessage());
                }
                    
                break;
            case "RestartRequest":
                RefreshRequestResponseServerMessage message = new RefreshRequestResponseServerMessage();
                if (session.GameSession.Game != null)
                {  
                    try
                    {
                        await session.GameSession.Game.RequestRestart(session);
                    } catch (RestartRequestException e)
                    {
                        message.ErrorCollection.AddError("global", "unkown error", "err_unkown");
                        await session.SendMessage(message);
                    }
                } else
                {
                    message.ErrorCollection.AddError("global", "Game hasn't started", "err_null_game");
                    await session.SendMessage(message);
                }
                break;
            case "PlayerChat":
                PlayerChat chat = JsonSerializer.Deserialize<PlayerChat>(json);
                ServerMessage chatMessage = new ServerMessage();
                chat.msg = Utility.FormatText(chat.msg);
                if (chat.msg != ""){
                    chatMessage.ChatMessages.Add(new ChatMessage{
                        title = session.Username,
                        text = chat.msg.Substring(0, Math.Min(200, chat.msg.Length)),         
                    });
                    await session.GameSession.BroadcastMessage(chatMessage);
                }
                break;
            case "PlayerLeave":
                session.GameSession.VoluntaryLeave(session);
                break;

        }
    }

    public async Task SendData(WebSocket socket, object data)
    {
        string serialized = (data is string) ? (string) data : JsonSerializer.Serialize(data);
        byte[] serverMessage = Encoding.UTF8.GetBytes(serialized);
        try{
            await socket.SendAsync(new ArraySegment<byte>(serverMessage, 0, serverMessage.Length), WebSocketMessageType.Text, true, applicationLifetime.ApplicationStopping);
        } catch (WebSocketException e)
        {
            _logger.LogError(e.Message);
        }
        
    }

    private async Task CloseConnectionAsync(PlayerSession playerSession)
    {
        try
        {
            await playerSession.WebSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "connection closing server", applicationLifetime.ApplicationStopping);
            playerSession.WebSocket.Dispose();
            await playerSession.GameSession.OnPlayerDisconnect(playerSession);
        } catch (WebSocketException e)
        {
        }
    
    }

    private async Task CloseConnectionAsync(WebSocket webSocket)
    {
        try
        {
            await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "connection closing", applicationLifetime.ApplicationStopping);
            webSocket.Dispose();
        } catch (WebSocketException e)
        {
        }
    
    }

    private void ManageClientPings2()
    {
        while (true)
        {
            Thread.Sleep(1000);
            DateTime now = DateTime.UtcNow;
            foreach (KeyValuePair<string, GameSession> kvp in GameSessions)
            {
                kvp.Value.OnInterval(now);
            }
            
            var query = GameSessions.Select(kvp => 
            {
                PlayerSession[] sessions = new PlayerSession[2];
                if (kvp.Value.HostSession.TimoutExceeded(now) && kvp.Value.HostSession.IsConnected)
                    sessions[0] =  kvp.Value.HostSession;
                if (kvp.Value.PeerSession != null && kvp.Value.PeerSession.TimoutExceeded(now) && kvp.Value.PeerSession.IsConnected)
                    sessions[1] = kvp.Value.PeerSession;
                return sessions;
            }).Where(sessions => sessions.Length > 0);
            foreach(PlayerSession[] sessions in query)
            {
                for (int i = 0; i < 2; i++)
                {
                    if (sessions[i] == null || sessions[i].TimoutExceeded(now)) continue;
                    //_logger.LogDebug("Connection Timing out...");
                    CloseConnectionAsync(sessions[i]); 
                }
            }
        }
    }

    private void GameSessionInterval()
    {
        while (true)
        {
            Thread.Sleep(1000);
            DateTime now = DateTime.UtcNow;
            List<GameSession> SessionsToRemove = new List<GameSession>();
            foreach(KeyValuePair<string, GameSession> kvp in GameSessions)
            {
                GameSession session = kvp.Value;
                bool markForRemove = false;
                markForRemove = markForRemove || session.OnInterval(now);

                session.CheckPingStates(now);

                if (markForRemove)
                    SessionsToRemove.Add(kvp.Value);
            }

            for (int i = 0; i < SessionsToRemove.Count; i++){

                GameSession session = SessionsToRemove[i];
                if (session.SessionAlive)
                    session.EndSession();
                GameSessions.TryRemove(SessionsToRemove[i].Code, out session);
            }
        }
    }

    private string GenerateCode() // abc123
    {
        string code = "";
        code += Convert.ToChar(Utility.GetRandom(65, 90));
        code += Convert.ToChar(Utility.GetRandom(65, 90));
        code += Convert.ToChar(Utility.GetRandom(65, 90));
        code += Convert.ToChar(Utility.GetRandom(48, 57));
        code += Convert.ToChar(Utility.GetRandom(48, 57));
        code += Convert.ToChar(Utility.GetRandom(48, 57));
        return code;
    }

    public string? CreateGameSession(TokenObject hostToken, string gameId)
    {
        if (!GameSession.GamesTypes.ContainsKey(gameId))
            return null;
        string code = "";
        do
        {
            code = GenerateCode();
        } while(this.GameSessions.ContainsKey(code));
        GameSession session = new GameSession(code, gameId);
        session.HostSession = new PlayerSession(session)
        {
            UserId = hostToken.UserId,
            Username = hostToken.Username
        };
        bool successful = this.GameSessions.TryAdd(code, session);
        if (!successful)
            return null;
        return code;
    }

    public GameSession AddPeerToGame(string gameId, string code, TokenObject peerToken)
    {
        GameSession session;
        if (!GameSessions.TryGetValue(code.ToUpper(), out session) || !session.SessionAlive)
        {
            throw new HttpResponseException(400, "code-input", "Game code does not exist", "game_code_no_exist");
        }
        if (session.GameId != gameId)
            throw new HttpResponseException(400, "code-input", "Game code does not exist", "game_code_no_exist");
        if (session.HostSession.UserId.Equals(peerToken.UserId) || (session.PeerSession != null && !session.PeerSession.TimedOut && session.PeerSession.UserId.Equals(peerToken.UserId)))
            return session;
        else if (session.PeerSession == null || session.PeerSession.TimedOut)
        {
            session.PeerSession = new PlayerSession(session)
            {
                UserId = peerToken.UserId,
                Username = peerToken.Username
            };
            return session;
        }
        
        throw new HttpResponseException(400, "online_joingame", "This game is already full", "game_full");
    }

    public bool PlayerIsInGame(string code, Guid UserId)
    {
        GameSession session;
        bool success = GameSessions.TryGetValue(code.ToUpper(), out session) && session.SessionAlive;
        return (success && session.ContainsActiveUserId(UserId));
    }

    public bool SessionExists(string gameId, string code)
    {
        GameSession session;
        return GameSessions.TryGetValue(code.ToUpper(), out session) && session.GameId == gameId;
    }

    public bool PlayerIsCurrentlyConnected(string code, Guid UserId)
    {
        GameSession gameSession;
        bool success = GameSessions.TryGetValue(code.ToUpper(), out gameSession);
        if (success)
        {
            PlayerSession playerSession = gameSession.SessionFromUserId(UserId);
            return playerSession != null && playerSession.IsConnected;
        }
        return false;
    }
}