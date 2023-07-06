using GamesHub.Game.Server;

namespace GamesHub.Game.Games;

public class Player
{
    public PlayerSession CurrentSession {get; set;}
    public int score {get; set;} = 0;
    public Slot Slot {get; set;}

    public Player(PlayerSession session)
    {
        this.CurrentSession = session;
        this.Slot = session.GameSession.HostSession == session ? Slot.Player1 : Slot.Player2;
    }
}