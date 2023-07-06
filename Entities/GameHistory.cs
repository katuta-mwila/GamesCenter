using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GamesHub.Entities;

public class GameHistory
{
    public Guid GameHistoryId {get; set;}
    public string GameId {get; set;}
    public Guid UserId {get; set;}
    [Column(TypeName="varchar(32)")]
    public string Name {get; set;}
    [Column(TypeName="varchar(32)")]
    public string OppName {get; set;}
    public string Sequence {get; set;}
    public bool OwnerIsPlayerOne {get; set;}
    public bool PlayerOneStarted {get; set;}
    [JsonIgnore]
    public User User {get; set;}
}