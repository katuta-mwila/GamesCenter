import { Game, GameState } from "./Game";
import {v4 as uuid} from "uuid"
import GameSocket from "./NetCode/GameSocket";

export class CheckGame extends Game{
    boxWidth = 760 / 8
    player1Pieces = new Map()
    player2Pieces = new Map()
    isDoubleMove = false
    doubleMovePiece = null

    constructor(p1Name, p2Name){
        super(p1Name, p2Name)
        this.player1.symbol = 1
        this.player2.symbol = 2
        this.chipWidth = this.boxWidth * 0.9
    }

    initBoard(){
        this.player1Pieces = new Map()
        this.player2Pieces = new Map()
        /*this.board = [[1, 0, 1, 0, 1, 0, 1, 0],
                      [0, 1, 0, 1, 0, 1, 0, 1],
                      [1, 0, 1, 0, 1, 0, 1, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 3, 0, 3, 0, 3, 0, 3],
                      [3, 0, 3, 0, 3, 0, 3, 0],
                      [0, 3, 0, 3, 0, 3, 0, 3]]*/

        /*this.board  =  [[0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0]]*/

        this.board  =  [[0, 1, 0, 1, 0, 1, 0, 1],
                        [1, 0, 1, 0, 1, 0, 1, 0],
                        [0, 1, 0, 1, 0, 1, 0, 1],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [3, 0, 3, 0, 3, 0, 3, 0],
                        [0, 3, 0, 3, 0, 3, 0, 3],
                        [3, 0, 3, 0, 3, 0, 3, 0]]

        /*this.board  =  [[0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 2, 0, 0, 0, 2, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 4, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0]]*/

        for (let row = 0; row < 8; row++){
            for (let column = 0; column < 8; column++){
                const n = this.board[row][column]
                if (n > 0){
                    const piece = new CheckPiece(row, column, n <= 2 ? 1 : 2, n % 2 == 0)
                    piece.startingRow = row
                    this.board[row][column] = piece
                    const map = n <= 2 ? this.player1Pieces : this.player2Pieces
                    map.set(piece.id, piece)
                }
            }
        }
    }

    getAllPieces(){
        const arr = []
        for (let row = 0; row < 8; row++){
            for (let column = 0; column < 8; column++){
                if (this.board[row][column] !== 0)
                    arr.push(this.board[row][column])
            }
        }
        return arr
    }

    loadBoard(onlineBoard){
        this.player1Pieces = new Map()
        this.player2Pieces = new Map()
        for (let row = 0; row < 8; row++){
            for (let column = 0; column < 8; column++){
                const n = onlineBoard[column][row]
                if (n > 0){
                    const piece = new CheckPiece(row, column, n <= 2 ? 1 : 2, n % 2 == 0)
                    piece.startingRow = row
                    this.board[row][column] = piece
                    const map = n <= 2 ? this.player1Pieces : this.player2Pieces
                    map.set(piece.id, piece)
                } else
                    this.board[row][column] = 0
            }
        }
    }

    handleGameData(currentGameData){
        if (currentGameData.GameSpecificData){
            this.doubleMovePiece = this.board[currentGameData.GameSpecificData[1]][currentGameData.GameSpecificData[0]]
            this.isDoubleMove = true
        }
    }

    start(currentGameData, startMessage){
        this.isDoubleMove = false
        this.doubleMovePiece = null
        super.start(currentGameData, startMessage)
        
    }

    getIndex(row, column){
        return 8 * row + column
    }

    getPos(index){
        const row = Math.floor(index / 8)
        const column = index - (8 * row)
        return [row, column]
    }

    moveChipClient(fromIndex, toIndex){

    }

    moveChip(fromIndex, toIndex){
    }

    receiveOnlineMove(moveData){
        const piece = this.board[moveData.FromRow][moveData.FromColumn]
        piece.visible = true
        this.makeMove(piece, moveData.ToRow, moveData.ToColumn)
    }

    isDark(row, column){
        return ((row % 2 == 0) != (column % 2 == 0)) && row >= 0 && row <= 7 && column >= 0 && column <= 7
    }

    makeMoveClient(piece, row, column){
        if (!this.validMoveClient(piece, row, column)) return
        if (this.mode == 2){
            piece.visible = false;
            const checkMoveData = {
                "TotalMoves": this.totalMoves,
                "FromColumn": piece.column,
                "ToColumn": column,
                "FromRow": piece.row,
                "ToRow": row
            }
            GameSocket.sendMessage("GameMoveData", checkMoveData)
            return 
        }
        this.makeMove(piece, row, column)
    }

    makeMove(piece, row, column){
        if (!this.validMove(piece, row, column)) return
        const oldRow = piece.row
        const oldColumn = piece.column
        let shouldChangePlayer = true
        const isDouble = Math.abs(row - piece.row) == 2

        this.movePiece(piece, row, column)
        this.history += `${oldRow}${oldColumn}${row}${column}`
        this.totalMoves++
        if (row == 0 || row == 7)
            piece.king = true
        if (isDouble){
            const rm = (oldRow + row) / 2
            const cm = (oldColumn + column) / 2
            const removedPiece = this.board[rm][cm]
            this.board[rm][cm] = 0
            this.getMap(removedPiece).delete(removedPiece.id)
            if (this.canContinueMove(piece)){
                shouldChangePlayer = false
                this.isDoubleMove = true
                this.doubleMovePiece = piece
                this.callPlayerTurnEvent()
            } else{
                this.isDoubleMove = false
                this.doubleMovePiece = null
            }
        } else{
            this.isDoubleMove = false
            this.doubleMovePiece = null
        }
        

        if (shouldChangePlayer){
            this.changePlayer(false)
            this.updateGameState()
            if (this.gameState.currentState == "active"){
                this.callPlayerTurnEvent()
            } else
                this.completeGame()
        }
            

        this.updateUiProxy()
        this.refresh()
    }

    getMap(piece){
        return piece.player == 1 ? this.player1Pieces : this.player2Pieces
    }

    movePiece(piece, row, column){
        this.board[row][column] = piece
        this.board[piece.row][piece.column] = 0
        piece.row = row
        piece.column = column
    }

    updateGameState(board=this.board, updateProxy){
        const gameState = new GameState()
        if (board == this.board)
            this.gameState = gameState
        if (board == this.board && updateProxy)
            this.updateUiProxy()  
        const matches = []
        gameState.stateObj = matches

        if (!this.hasStarted){
            gameState.currentState = "pending"
            gameState.stateText = "Game Pending"
            return gameState
        }

        gameState.currentState = "active"
        if (!this.playerCanMakeMove(this.currentPlayer)){
            gameState.currentState = this.getWaitingPlayer() == this.player1 ? "p1" : "p2"
        }
        return gameState
    }

    playerCanMakeMove(player){
        const map = player == this.player1 ? this.player1Pieces : this.player2Pieces
        const vertical = player == this.player1 ? 1 : -1
        const iterater = map.values()
        let piece = iterater.next().value
        while (piece != null){
            if (this.canMovePiece(piece, -1, vertical) || this.canMovePiece(piece, 1, vertical) ||
            piece.king && (this.canMovePiece(piece, -1, -vertical) || this.canMovePiece(piece, 1, -vertical))){
                return true
            }
            piece = iterater.next().value
        }
        return false
    }

    canMoveDirection(piece, row, column, horizontal, vertical){
        const c1 = piece.column + horizontal
        const c2 = c1 + horizontal
        const r1 = piece.row + vertical
        const r2 = r1 + vertical
        return ((this.isDark(r1, c1) && this.board[r1][c1] == 0 && row == r1 && column == c1) || (this.isDark(r2, c2) && this.board[r2][c2] == 0 && this.board[r1][c1] != 0 && this.board[r1][c1].player != piece.player && row == r2 && column == c2))
    }

    canMovePiece(piece, horizontal, vertical){
        const c1 = piece.column + horizontal
        const c2 = c1 + horizontal
        const r1 = piece.row + vertical
        const r2 = r1 + vertical
        return ((this.isDark(r1, c1) && this.board[r1][c1] == 0) || (this.isDark(r2, c2) && this.board[r2][c2] == 0 && this.board[r1][c1] != 0 && this.board[r1][c1].player != piece.player))
    }

    canRemoveOpposition(piece, horizontal, vertical){
        const c1 = piece.column + horizontal
        const r1 = piece.row + vertical
        const c2 = c1 + horizontal
        const r2 = r1 + vertical

        return this.isDark(r2, c2) && this.board[r2][c2] == 0 && this.board[r1][c1] != 0 && this.board[r1][c1].player != piece.player
    }

    canContinueMove(piece){
        const vertical = piece.player == 1 ? 1 : -1
        return this.canRemoveOpposition(piece, -1, vertical) || this.canRemoveOpposition(piece, 1, vertical) ||
            (piece.king && (this.canRemoveOpposition(piece, -1, -vertical) || this.canRemoveOpposition(piece, 1, -vertical)))
    }

    validMoveClient(piece, row, column){
        return this.currentPlayer.isClient && this.validMove(piece, row, column) && ((this.currentPlayer == this.player1 && piece.player == 1) || (this.currentPlayer == this.player2 && piece.player == 2))
    }

    validMove(piece, row, column){
        const vertical = piece.player == 1 ? 1 : -1
        const validDirection = this.canMoveDirection(piece, row, column, -1, vertical) || this.canMoveDirection(piece, row, column, 1, vertical)
            || (piece.king && (this.canMoveDirection(piece, row, column, -1, -vertical) || this.canMoveDirection(piece, row, column, 1, -vertical)))
        return validDirection && this.isDark(row, column) && this.board[row][column] == 0 && !(piece.row == row && piece.column == column) && row >= 0 && row <= 7 && column >= 0 & column <= 7 &&
            (!this.isDoubleMove || (Math.abs(row - piece.row) == 2 && piece == this.doubleMovePiece))
    }

    canGrabPiece(piece){
        return (this.mode != 2 || this.isConnected) && this.currentPlayer && this.currentPlayer.isClient && ((piece.player == 1) == (this.currentPlayer == this.player1)) && (this.doubleMovePiece == null || this.doubleMovePiece === piece)
    }
}

export class CheckPiece{
    row;
    column;
    king;
    player;
    id;
    startingRow;
    selected = false;
    visible = true;
    constructor(row, column, player, king){
        this.row = row
        this.column = column
        this.player = player
        this.king = king
        this.id = "cp_" + uuid()
    }

    getCoord(game){
        let posX = this.column * game.boxWidth
        let posY = this.row * game.boxWidth
        const gap = (game.boxWidth - game.chipWidth) / 2
        return {x: posX + gap, y: posY + gap}
    }
}