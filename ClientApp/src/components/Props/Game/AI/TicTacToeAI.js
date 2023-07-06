import { BaseAI } from "./BaseAI"

export class TicTacToeAi extends BaseAI{
    copyBoard = [["", "", ""],
    ["", "", ""],
    ["", "", ""]]
    errorTable = {
        0: 0.6,
        1: 0.9,
        2: 1
    }
    constructor(game, difficulty){
        super(game, difficulty)
    }

    print(){
        //console.log(this)
    }

    chooseBestOptionAfterDelay(lastKnownId){
        if (lastKnownId != this.game.currentGameId) return
        if (this.difficulty == 2 && this.game.totalMoves <= 1 && this.game.board[1][1] == "")
            return this.game.placeSymbol(1, 1)

        for (let i = 0; i < 3; i++){
            for (let j = 0; j < 3; j++){
                this.copyBoard[i][j] = this.game.board[i][j]
            }
        }
        const bestOption = this.minimax(this.aiPlayer, true)
        const [row, column] = this.game.getPos(bestOption[0])
        this.game.placeSymbol(row, column)
    }

    minimax(servingPlayer, maximizingPlayer, d=0)
    {
        const sym1 = servingPlayer.symbol
        const sym2 = sym1 == "X" ? "O" : "X"
        const gs = this.game.updateGameState(this.copyBoard)
        if (gs.currentState != "active")
        {
            if (gs.currentState == "draw")
                return [null, d]
            if (gs.stateObj[0].symbol == sym1){
                return [null, 100-d]
            }
            return [null, -100+d]
        }
        if (maximizingPlayer)
        {
            let value = -100
            let maxIndex = null
            for (let i = 0; i < 9; i++)
            {
                const [row, column] = this.game.getPos(i)
                if (this.copyBoard[row][column] == "X" || this.copyBoard[row][column] == "O") continue
                maxIndex = maxIndex == null ? i : maxIndex
                this.copyBoard[row][column] = sym1
                this.game.totalMoves++
                let next = this.minimax(servingPlayer, !maximizingPlayer, d+1)
                this.copyBoard[row][column] = ""
                this.game.totalMoves--
                if (next[1] > value)
                { 
                    if (d == 0 && next[1] < 99){
                        const rand = Math.random()
                        const error = this.errorTable[this.difficulty]
                        value = (rand < error) ? next[1] : value
                        maxIndex = (rand < error) ? i : maxIndex
                    } else
                    {
                        value = next[1]
                        maxIndex = i
                    }
                }
            }
            return [maxIndex, value]
        } else
        {
            let value = 100
            let minIndex = null
            for (let i = 0; i < 9; i++)
            {
                const [row, column] = this.game.getPos(i)
                if (this.copyBoard[row][column] == "X" || this.copyBoard[row][column] == "O") continue;
                this.copyBoard[row][column] = sym2
                this.game.totalMoves++
                let next = this.minimax(servingPlayer, !maximizingPlayer, d+1)
                this.copyBoard[row][column] = ""
                this.game.totalMoves--
                if (next[1] < value)
                {
                    value = next[1]
                    minIndex = i
                }
            }
            return [minIndex, value]
        }
    }
}