namespace GamesHub.Protocol.Request;

public abstract class GeneralDto
{
    public bool ReturnClientErrors {get; set;} = true;
    public virtual ErrorCollection GetClientErrors()
    {
        return new ErrorCollection();
    }
}