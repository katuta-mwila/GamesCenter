using System.Text.Json;
using GamesHub.Game.Server;
using GamesHub.Game.Games.Exceptions;

namespace GamesHub.Game.Games.TicTacToe;

public class TicGame : Game
{
    public TicGame(Player p1, Player p2) : base(p1, p2)
    {
        this.GameBoard = new TicBoard();
    }
    public override void Start()
    {
        base.Start();
    }

    private void AcceptPlayerMove(PlayerSession playerSession, TicMoveData moveData)
    {
        if (!this.MoveIsUpToDate(moveData))
            throw new PlayerMoveException(PlayerMoveError.ClientOutOfSync);
        if (playerSession != CurrentPlayer.CurrentSession)
            throw new PlayerMoveException(PlayerMoveError.NotPlayersTurn);
        this.GameBoard.PlaceOnBoard(moveData, PlayerFromSession(playerSession).Slot);
        this.TotalMoves++;
        moveData.TotalMoves = this.TotalMoves;
        this.History += (moveData.Row * 3) + moveData.Column;
        this.ChangePlayer();
    }

    public override ServerMessage AcceptMoveData(PlayerSession playerSession, string serializedData)
    {
        TicMoveData? data = JsonSerializer.Deserialize<TicMoveData>(serializedData);
        PlayerMoveServerMessage serverMessage = new PlayerMoveServerMessage();
        try
        {
            if (data == null || data.Column == null || data.Row == null || data.TotalMoves == null)
                throw new PlayerMoveException(PlayerMoveError.FormatMismatch);
            this.AcceptPlayerMove(playerSession, data);
            this.CheckForEndGame();
            serverMessage.MoveData = data;
            return serverMessage;
        } catch (PlayerMoveException e)
        {
           return this.GetMoveErrorServerMessage(e.PlayerMoveError, serverMessage);
        } catch (Exception e)
        {
            System.Console.WriteLine(e.StackTrace);
            serverMessage.ErrorCollection.AddError("global", "error has occured", "err_unkown");
        }
        return serverMessage;
    }

    protected override void CheckForEndGame()
    {
        if (this.GameState == GameState.Dead) return;
        TicBoard board = (TicBoard) this.GameBoard;
        if (board[0, 0] != Slot.Empty && board[0, 0] == board[1, 0] && board[0, 0] == board[2, 0])
        {
            this.AddWin(board[0, 0]);
        } else if (board[0, 1] != Slot.Empty && board[0, 1] == board[1, 1] && board[0, 1] == board[2, 1])
        {
            this.AddWin(board[0, 1]);
        } else if (board[0, 2] != Slot.Empty && board[0, 2] == board[1, 2] && board[0, 2] == board[2, 2])
        {
            this.AddWin(board[0, 2]);
        } else if (board[0, 0] != Slot.Empty && board[0, 0] == board[0, 1] && board[0, 0] == board[0, 2])
        {
            this.AddWin(board[0, 0]);
        } else if (board[1, 0] != Slot.Empty && board[1, 0] == board[1, 1] && board[1, 0] == board[1, 2])
        {
            this.AddWin(board[1, 0]);
        } else if (board[2, 0] != Slot.Empty && board[2, 0] == board[2, 1] && board[2, 0] == board[2, 2])
        {
            this.AddWin(board[2, 0]);
        } else if (board[0, 0] != Slot.Empty && board[0, 0] == board[1, 1] && board[0, 0] == board[2, 2])
            this.AddWin(board[0, 0]);
        else if (board[0, 2] != Slot.Empty && board[0, 2] == board[1, 1] && board[0, 2] == board[2, 0])
            this.AddWin(board[0, 2]);
        else if (this.TotalMoves == 9)
        {
            //System.Console.WriteLine("GAME IS A DRAW");
        }
        else
        {
            return;
        }
        this.EndGame();
    }
}