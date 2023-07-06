namespace GamesHub.Entities;

public class Password
{
    public byte[] PasswordHash {get; set;}
    public byte[] PasswordSalt {get; set;}
}