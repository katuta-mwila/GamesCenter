using System.Text.Json;
using GamesHub.Game.Games.Exceptions;
using GamesHub.Game.Server;

namespace GamesHub.Game.Games.Checkers;

public class CheckGame : Game
{
    public CheckPiece? DoubleMovePiece {get; set;} = null;
    public CheckGame(Player p1, Player p2) : base(p1, p2)
    {
        this.GameBoard = new CheckBoard();
    }

    private bool CanPerformCapture(CheckPiece piece){
        CheckBoard board = (CheckBoard) this.GameBoard;
        for (int horizontal = -2; horizontal <= 2; horizontal += 4)
        {
            for (int y = -2; y <= 2; y += (piece.King ? 4 : 5))
            {
                int vertical = piece.Slot == Slot.Player1 ? -y : y;
                int column = piece.Column + horizontal;
                int row = piece.Row + vertical;
                CheckPiece toPiece = board.FromBoard(column, row);
                CheckPiece capturePiece = board.FromBoard((column + piece.Column) / 2, (row + piece.Row) / 2);
                if (toPiece != null && capturePiece != null && toPiece.Slot == Slot.Empty && capturePiece.Slot != Slot.Empty && capturePiece.Slot != piece.Slot)
                    return true;
            }
        }
        return false;
    }

    private bool CanMakeSingleMove(CheckPiece piece)
    {
        CheckBoard board = (CheckBoard) this.GameBoard;
        for (int horizontal = -1; horizontal <= 1 ; horizontal += 2)
        {
            for (int y = -1; y <= 1; y += (piece.King ? 2 : 3))
            {
                int vertical = piece.Slot == Slot.Player1 ? -y : y;
                int column = piece.Column + horizontal;
                int row = piece.Row + vertical;
                CheckPiece toPiece = board.FromBoard(column, row);
                if (toPiece != null && toPiece.Slot == Slot.Empty)
                    return true;
            }
        }
        return false;
    }

    public override ServerMessage AcceptMoveData(PlayerSession playerSession, string serializedData)
    {
        CheckBoard board = (CheckBoard) this.GameBoard;
        PlayerMoveServerMessage serverMessage = new PlayerMoveServerMessage();
        try
        {
            bool shouldChangePlayer = true;
            CheckMoveData? data = JsonSerializer.Deserialize<CheckMoveData>(serializedData);
            if (data == null)
                throw new PlayerMoveException(PlayerMoveError.FormatMismatch);

            if (!this.MoveIsUpToDate(data))
                throw new PlayerMoveException(PlayerMoveError.ClientOutOfSync);

            if (playerSession != CurrentPlayer.CurrentSession)
                throw new PlayerMoveException(PlayerMoveError.NotPlayersTurn);

            CheckPiece? startPiece = board.FromBoard(data.FromColumn, data.FromRow);
            if (startPiece == null || (this.DoubleMovePiece != null && !startPiece.Equals(this.DoubleMovePiece)))
                throw new PlayerMoveException(PlayerMoveError.InvalidMove);

            this.GameBoard.PlaceOnBoard(data, PlayerFromSession(playerSession).Slot);
            CheckPiece movedPiece = board.FromBoard(data.ToColumn, data.ToRow);
            movedPiece.King = movedPiece.King || (movedPiece.Row == 0 || movedPiece.Row == 7);
            board.ApplyPiece(movedPiece);
            this.TotalMoves++;
            this.History += $"{data.FromRow}{data.FromColumn}{data.ToRow}{data.ToColumn}";
            data.TotalMoves = this.TotalMoves;
            bool isCapture = (Math.Abs(data.FromColumn - data.ToColumn) == 2) && (Math.Abs(data.FromRow - data.ToRow) == 2);
            if (isCapture)
            {
                CheckPiece removePiece = board.FromBoard((data.ToColumn + data.FromColumn) / 2, (data.FromRow + data.ToRow) / 2);
                board[removePiece.Column, removePiece.Row] = 0;
                if (this.CanPerformCapture(movedPiece)){
                    shouldChangePlayer = false;
                    this.DoubleMovePiece = movedPiece;
                }
            }
            if (shouldChangePlayer)
            {
                this.DoubleMovePiece = null;
                this.ChangePlayer();
                this.CheckForEndGame();
            }
            serverMessage.MoveData = data;
        } catch (PlayerMoveException e)
        {
            return this.GetMoveErrorServerMessage(e.PlayerMoveError, serverMessage);
        } catch (Exception e)
        {
            System.Console.WriteLine(e.Message);
            System.Console.WriteLine(e.StackTrace);
            serverMessage.ErrorCollection.AddError("global", "error has occured", "err_unkown");
        }
        return serverMessage;
    }

    protected override void CheckForEndGame()
    {
        CheckBoard board = (CheckBoard) this.GameBoard;
        for (int row = 0; row < 8; row++)
        {
            for (int column = 0; column < 8; column++)
            {
                CheckPiece? piece = board.FromBoard(column, row);
                if (piece == null || piece.Slot != CurrentPlayer.Slot)
                    continue;
                bool canCapture = this.CanPerformCapture(piece);
                bool canSingle = this.CanMakeSingleMove(piece);
                if (canCapture || canSingle)
                    return;
            }
        }
        this.AddWin(this.WaitingPlayer.Slot, true);
    }

    public override CurrentGameData GetCurrentGameData()
    {
        CurrentGameData currentGameData = base.GetCurrentGameData();
        if (this.DoubleMovePiece != null)
        {
            currentGameData.GameSpecificData = new object[]{this.DoubleMovePiece.Column, this.DoubleMovePiece.Row};
        }
        return currentGameData;
    }
}