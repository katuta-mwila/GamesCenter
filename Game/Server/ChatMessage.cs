namespace GamesHub.Game.Server;

public class ChatMessage
{
    public string title {get; set;}
    public string text {get; set;}

    public static ChatMessage Info(string text)
    {
        return new ChatMessage
        {
            title = "[i]",
            text = text
        };
    }
}