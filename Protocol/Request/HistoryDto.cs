using System.ComponentModel.DataAnnotations;

namespace GamesHub.Protocol.Request;

public class HistoryDto : GeneralDto
{
    public static HashSet<string> GameIds = new HashSet<string>(){
        "tictactoe",
        "connect4",
        "checkers"
    };
    [StringLength(32, MinimumLength = 1)]
    public string Name {get; set;}
    public string GameId {get; set;}
    public string OppName {get; set;}
    public string Sequence {get; set;}
    public bool OwnerIsPlayerOne {get; set;}
    public bool PlayerOneStarted {get; set;}

    public override ErrorCollection GetClientErrors()
    {
        ErrorCollection collection = new ErrorCollection();
        if (!this.ReturnClientErrors) return collection;
        if (Name == "")
            collection.AddError("savegame_name", "Name is required", "name_no_exist");
        if (OppName == "")
            collection.AddError("global", "OppName is required", "global_invalid");
        if (Sequence == "")
            collection.AddError("global", "sequence is required", "global_invalid");
        if (!GameIds.Contains(GameId))
            collection.AddError("global", "GameId is invalid", "global_invalid");
        return collection;
    }
}