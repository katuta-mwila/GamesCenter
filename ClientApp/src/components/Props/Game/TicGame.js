import { Game, GameState, Player } from "./Game";
import GameSocket from "./NetCode/GameSocket";

export class TicGame extends Game{
    board = [["", "", ""],
             ["", "", ""],
             ["", "", ""]]
    symbolConverter = ["", "X", "O"]
    constructor(p1Name, p2Name){
        super(p1Name, p2Name)
        this.player1.symbol = "X"
        this.player2.symbol = "O"
        this.updateGameState(this.board, true)
    }

    initBoard(){
        this.board = [["", "", ""],
                      ["", "", ""],
                      ["", "", ""]]
    }

    loadBoard(onlineBoard){
        for (let row = 0; row < 3; row++){
            for (let column = 0; column < 3; column++){

                this.board[row][column] = this.symbolConverter[onlineBoard[column][row]]
            }
        }
    }

    start(currentGameData, startMessage){
        super.start(currentGameData, startMessage)
    }

    loadOnlineGame(currentGameData){
        super.loadOnlineGame(currentGameData)
    }

    getSymbol(index){
        const row = Math.floor(index / 3)
        const column = index - (3 * row)
        return this.board[row][column]
    }

    clientCanPlace(row, column)
    {
        return this.board[row][column] == "" && this.gameState.currentState == "active" && this.currentPlayer.isClient
    }

    canPlaceOnTile(row, column){
        return this.board[row][column] == "" && this.gameState.currentState == "active"
    }

    placeSymbolClient(row, column){
        if (!this.clientCanPlace(row, column)) return
        if (this.mode == 2 && this.currentPlayer.isClient){
            const ticMoveData = {
                "TotalMoves": this.totalMoves,
                "Column": column,
                "Row": row
            }
            GameSocket.sendMessage("GameMoveData", ticMoveData)
            return
        }
        this.placeSymbol(row, column)
    }

    placeSymbol(row, column, uiRefresh=true){
        if (this.canPlaceOnTile(row, column)){
            this.board[row][column] = this.currentPlayer.symbol
            const index = (3 * row) + column
            this.history += index
            this.totalMoves++
            this.updateGameState(this.board, false)
            if (this.gameState.currentState != "active")
                this.completeGame()
            else
                this.changePlayer()
            this.updateUiProxy()
            if (uiRefresh) this.refresh()
            return true
        }
        return false
    }

    receiveOnlineMove(moveData){
        this.placeSymbol(moveData.Row, moveData.Column)
    }

    getPos(index){
        const row = Math.floor(index / 3)
        const column = index - (3 * row)
        return [row, column]
    }

    updateGameState(board=this.board, updateProxy){
        const gameState = new GameState()
        if (board == this.board)
            this.gameState = gameState
        if (board == this.board && updateProxy)
            this.updateUiProxy()
        const matches = [];
        gameState.stateObj = matches

        if (!this.hasStarted){
            gameState.currentState = "pending"
            return gameState
        }
            
        gameState.currentState = "active"
        if (board[0][0] != "" && board[0][0] == board[0][1] && board[0][0] == board[0][2]){
            matches.push(new TicMatch([0, 0], [0, 2], board[0][0]))
        }
        if (board[1][0] != "" && board[1][0] == board[1][1] && board[1][0] == board[1][2]){
            matches.push(new TicMatch([1, 0], [1, 2], board[1][0]))
        }
        if (board[2][0] != "" && board[2][0] == board[2][1] && board[2][0] == board[2][2]){
            matches.push(new TicMatch([2, 0], [2, 2], board[2][0]))
        }
        if (board[0][0] != "" && board[0][0] == board[1][0] && board[0][0] == board[2][0]){
            matches.push(new TicMatch([0, 0], [2, 0], board[0][0]))
        }
        if (board[0][1] != "" && board[0][1] == board[1][1] && board[0][1] == board[2][1]){
            matches.push(new TicMatch([0, 1], [2, 1], board[0][1]))
        }
        if (board[0][2] != "" && board[0][2] == board[1][2] && board[0][2] == board[2][2]){
            matches.push(new TicMatch([0, 2], [2, 2], board[0][2]))
        }
        if (board[0][0] != "" && board[0][0] == board[1][1] && board[0][0] == board[2][2]){
            matches.push(new TicMatch([0, 0], [2, 2], board[0][0]))
        }
        if (board[2][0] != "" && board[2][0] == board[1][1] && board[2][0] == board[0][2]){
            matches.push(new TicMatch([2,0], [0,2], board[2][0]))
        }
        if (this.totalMoves == 9 && matches.length == 0){
            gameState.currentState = "draw"
        }
        else if (matches.length > 0){
            gameState.currentState = matches[0].symbol == this.player1.symbol ? "p1" : "p2"
        } else if (this.isCancelled)
            gameState.currentState = "cancelled"
        return gameState
    }
}

class TicMatch{
    matchStart;
    matchEnd;
    symbol;
    constructor(_matchStart, _matchEnd, _symbol){
        this.matchStart = _matchStart
        this.matchEnd = _matchEnd
        this.symbol = _symbol
    }
}