using System.Text.Json;
using GamesHub.Game.Games.Exceptions;
using GamesHub.Game.Server;

namespace GamesHub.Game.Games.Connect4;

public class ConnectGame : Game
{
    public int LastPlaced {get; set;} = -1;
    public ConnectGame(Player p1, Player p2) : base(p1, p2)
    {
        this.GameBoard = new ConnectBoard();
    }

    public override ServerMessage AcceptMoveData(PlayerSession playerSession, string serializedData)
    {
        PlayerMoveServerMessage serverMessage = new PlayerMoveServerMessage();
        try
        {
            ConnectMoveData? data = JsonSerializer.Deserialize<ConnectMoveData>(serializedData);
            if (data == null || data.Column == null || data.TotalMoves == null)
                throw new PlayerMoveException(PlayerMoveError.FormatMismatch);
            if (!this.MoveIsUpToDate(data))
                throw new PlayerMoveException(PlayerMoveError.ClientOutOfSync);
            if (playerSession != CurrentPlayer.CurrentSession)
                throw new PlayerMoveException(PlayerMoveError.NotPlayersTurn);
            this.LastPlaced = this.GameBoard.PlaceOnBoard(data, PlayerFromSession(playerSession).Slot);
            this.TotalMoves++;
            data.TotalMoves = this.TotalMoves;
            this.History += data.Column;
            this.ChangePlayer();
            serverMessage.MoveData = data;
            this.CheckForEndGame();
        }catch (PlayerMoveException e)
        {
            return this.GetMoveErrorServerMessage(e.PlayerMoveError, serverMessage);
        } catch (Exception e)
        {
            System.Console.WriteLine(e.Message);
            serverMessage.ErrorCollection.AddError("global", "error has occured", "err_unkown");
        }
        return serverMessage;
    }

    public override CurrentGameData GetCurrentGameData()
    {
        CurrentGameData currentGameData = base.GetCurrentGameData();
        currentGameData.GameSpecificData = new object[]{this.LastPlaced};
        return currentGameData;
    }

    protected override void CheckForEndGame()
    {
        if (this.LastPlaced < 0) return;
        int row = (int) (this.LastPlaced / 7.0);
        int column = this.LastPlaced - (7 * row);
        
        if (this.GameState == GameState.Dead) return;
        ConnectBoard board = (ConnectBoard) this.GameBoard;

        Dictionary<Slot, int> streak = new Dictionary<Slot, int>()
        {
            {Slot.Player1, 0},
            {Slot.Player2, 0},
            {Slot.Empty, 0}
        };

        Slot current = Slot.Empty;
        int start = Math.Max(0, column - 3);
        int end = Math.Min(6, column + 3);
        for (int c = start; c <= end; c++)
        {
            Slot slot = board[c, row]; 
            if (slot != Slot.Empty)
            {
                streak[slot]++;
            }
            if (c == end || (current != Slot.Empty && current != slot))
            {
                if (streak[current] >= 4)
                {
                    this.AddWin(current, true);
                    return;
                }
                streak[Slot.Player1] = 0;
                streak[Slot.Player2] = 0;
            }
            current = slot;
        }

        current = Slot.Empty;
        start = Math.Max(0, row - 3);
        end = Math.Min(5, row + 3);

        for (int r = start; r <= end; r++)
        {
            Slot slot = board[column, r]; 
            if (slot != Slot.Empty)
            {
                streak[slot]++;
            }
            if (r == end || (current != Slot.Empty && current != slot))
            {
                if (streak[current] >= 4)
                {
                    this.AddWin(current, true);
                    return;
                }
                streak[Slot.Player1] = 0;
                streak[Slot.Player2] = 0;
            }
            current = slot;
        }

        int startX, endX, startY, endY;
        current = Slot.Empty;   
        if (column <= row)
        {
            startX = Math.Max(0, column - 3);
            startY = row - (column - startX);
            endY = Math.Min(5, row + 3);
            endX = column + (endY - row);
        } else
        {
            startY = Math.Max(0, row - 3);
            startX = column - (row - startY);
            endX = Math.Min(6, row + 3);
            endY = row + (endX - column);
        }
        int x = startX;
        int y = startY;
        while (x <= endX && y <= endY)
        {
            Slot slot = board[x, y]; 
            if (slot != Slot.Empty)
            {
                streak[slot]++;
            }
            if (x == endX || y == endY || (current != Slot.Empty && current != slot))
            {
                if (streak[current] >= 4)
                {
                    this.AddWin(current, true);
                    return;
                }
                streak[Slot.Player1] = 0;
                streak[Slot.Player2] = 0;
            }
            current = slot;
            y++;
            x++;
        }

        current = Slot.Empty;   
        if (column <= (5 - row)){
            startX = Math.Max(0, column - 3);
            startY = row + (column - startX);
            endY = Math.Max(0, row - 3);
            endX = column + (row - endY);
        } else{
            startY = Math.Min(5, row + 3);
            startX = column - (startY - row);
            endX = (Math.Min(6, column + 3));
            endY = row - (endX - column);
        }
        x = startX;
        y = startY;
        while (x <= endX && y >= endY)
        {
            Slot slot = board[x, y]; 
            if (slot != Slot.Empty)
            {
                streak[slot]++;
            }
            if (x == endX || y == endY || (current != Slot.Empty && current != slot))
            {
                if (streak[current] >= 4)
                {
                    this.AddWin(current, true);
                    return;
                }
                streak[Slot.Player1] = 0;
                streak[Slot.Player2] = 0;
            }
            current = slot;
            y--;
            x++;
        }
    }

    public override void Start()
    {
        this.LastPlaced = -1;
        base.Start();
    }
}