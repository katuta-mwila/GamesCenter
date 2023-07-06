namespace GamesHub.Protocol.Response;

public class GeneralResponse
{
    public bool ApiResponse {get; private set;} = true;
    public string message {get; set;} = "";
    public ErrorCollection ErrorCollection {get; set;} = new ErrorCollection();
    public object obj {get; set;}
}