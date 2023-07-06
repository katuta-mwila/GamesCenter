import { BaseAI } from "./BaseAI";
import { CheckPiece } from "../CheckGame";

export class CheckAi extends BaseAI{
    copyBoard  =       [[0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0]]
    aiPieces = new Map()
    humanPieces = new Map()
    worker = new window.Worker("./CheckWebworker.js")

    constructor(game, difficulty){
        super(game, difficulty)
        this.delay = 0
        this.internalDelay = 1000
        this.worker.onmessage = this.onMessage.bind(this)
    }

    isDark(row, column){
        return ((row % 2 == 0) != (column % 2 == 0)) && row >= 0 && row <= 7 && column >= 0 && column <= 7
    }

    chooseBestOptionAfterDelay(lastKnownId){
        this.aiPieces = new Map()
        this.humanPieces = new Map()
        let doubleMovePiece = null
        for (let row = 0; row < 8; row++){
            for (let column = 0; column < 8; column++){
                const gamePiece = this.game.board[row][column]
                let newPiece = 0
                if (gamePiece != 0)
                {
                    newPiece = new CheckPiece(gamePiece.row, gamePiece.column, gamePiece.player, gamePiece.king)
                    newPiece.id = gamePiece.id
                    newPiece.startingRow = gamePiece.startingRow
                    const map = gamePiece.player == 1 ? this.humanPieces : this.aiPieces
                    map.set(newPiece.id, newPiece)
                }
                if (gamePiece == this.game.doubleMovePiece)
                    doubleMovePiece = newPiece
                this.copyBoard[row][column] = newPiece
            }
        }
        const startTime = Date.now()
        this.worker.postMessage({lastKnownId, board: this.copyBoard, multiMovePieceId: doubleMovePiece != null ? doubleMovePiece.id : null, startTime, difficulty: this.difficulty})
    }

    onMessage(message){
        const now = Date.now()
        const chosen = message.data.chosen
        const piece = this.game.player2Pieces.get(chosen.pieceId)
        const timeTaken = now - message.data.startTime
        const appliedDelay = Math.max(0, this.internalDelay - timeTaken)
        setTimeout(() =>{
            if (this.game.currentGameId == message.data.lastKnownId)
                this.game.makeMove(piece, chosen.row, chosen.column) 
        }, appliedDelay)
        
    }
}

class CheckMove{
    piece;
    row;
    column;
    constructor(piece, row, column){
        this.piece = piece
        this.row = row
        this.column = column
    }
}