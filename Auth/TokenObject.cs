namespace GamesHub.Auth;

/* ---- DEPRECIATED ---- */
public class TokenObject
{
    public string Username {get; set;}
    public Guid UserId {get; set;}

    public bool IsGuest
    {
        get
        {
            return true;
        }
    }
}