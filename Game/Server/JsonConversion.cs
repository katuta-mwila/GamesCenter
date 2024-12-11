using System.Text.Json;
using System.Text.Json.Serialization;

namespace GamesHub.Game.Games;

public class PlayerMoveDataJsonConverter : JsonConverter<IPlayerMoveData>
{
    public override IPlayerMoveData? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, IPlayerMoveData value, JsonSerializerOptions options)
    {
        object obj = (object) value;
        JsonSerializer.Serialize(writer, obj, options);
    }
}

public class GameBoardJsonConverter : JsonConverter<GameBoard>
{
    public override GameBoard? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, GameBoard value, JsonSerializerOptions options)
    {
        object[,] board = value.Board;
        int d1 = board.GetLength(0);
        int d2 = board.GetLength(1);
        string json = "[";
        for (int column = 0; column < d1; column++)
        {
            json += "[";
            for (int row = 0; row < d2; row++)
            {
                json += Convert.ToInt32(board[column, row]);
                json += row + 1 < d2 ? "," : "";
            }
            json += "]";
            json += (column + 1 < d1 ? "," : "");
        }
        json += "]";
        //System.Console.WriteLine(json);
        //writer.WriteStringValue(json);
        writer.WriteRawValue(json);
    }
}