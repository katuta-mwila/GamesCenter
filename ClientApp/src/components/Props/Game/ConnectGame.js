import { Game, GameState, Player } from "./Game";
import GameSocket from "./NetCode/GameSocket";

export class ConnectGame extends Game{
    lastPlacedUi;
    lastPlaced;
    lastPlacementDelay = 0
    placementCooldown = 0 // time in milliseconds when chip can be placed again
    chipHangTime = 100 // time in milliseconds before chip starts to fall, needed so that there is enough time between rendering and useffect for animation to perform
    constructor(p1Name, p2Name){
        super(p1Name, p2Name)
        this.player1.symbol = 1
        this.player2.symbol = 2
    }

    initBoard(){
        this.board = [[0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0]]

                      /*this.board = [[1, 1, 1, 0, 0, 0, 0],
                      [2, 2, 2, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0]]*/
    }

    loadBoard(onlineBoard){
        for (let column = 0; column < 7; column++){
            for (let row = 0; row < 6; row++){
                this.board[row][column] = onlineBoard[column][row]
            }
        }
    }

    handleGameData(currentGameData){
        if (currentGameData.GameSpecificData[0] >= 0)
            this.lastPlaced = currentGameData.GameSpecificData[0] 
    }

    start(currentGameData, startMessage){
        this.lastPlaced = null
        this.lastPlacedUi = null
        this.lastPlacementDelay = 0
        this.placementCooldown = 0
        super.start(currentGameData, startMessage)
    }

    updateGameState(board=this.board, updateProxy){
        const lastPlacedIndex = this.lastPlaced

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
        // _matchStart, _matchEnd, _symbol
        if (lastPlacedIndex != null){
            const [row, column] = this.getPos(lastPlacedIndex)
            const symbol = board[row][column]
            let streak = 0

            let start = Math.max(0, column - 3), end = Math.min(6, column + 3)
            for (let i = start; i <= end; i++){
                if (board[row][i] == symbol){
                    streak++
                }
                if (i == end || board[row][i] != symbol){
                    if (streak >= 4){
                        let offset = board[row][i] == symbol ? 0 : -1
                        matches.push(new ConnectMatch([row, i - streak + 1 + offset], [row, i + offset], symbol))
                    }
                    streak = 0
                }
            }

            start = Math.max(0, row - 3)
            end = Math.min(5, row + 3)
            for (let i = start; i <= end; i++){
                if (board[i][column] == symbol)
                    streak++
                if (i == end || board[i][column] != symbol){
                    if (streak >= 4){
                        let offset = board[i][column] == symbol ? 0 : -1
                        matches.push(new ConnectMatch([i - streak + 1 + offset, column], [i + offset, column], symbol))
                    }
                    streak = 0
                }
            }
            
            let startX, endX, startY, endY
            if (column <= row){
                startX = Math.max(0, column - 3)
                startY = row - (column - startX)
                endY = Math.min(5, row + 3)
                endX = column + (endY - row)
            } else{
                startY = Math.max(0, row - 3)
                startX = column - (row - startY)
                endX = Math.min(6, column + 3)
                endY = row + (endX - column)
            }
            
            let x = startX, y = startY
            while (x <= endX && y <= endY){
                if (board[y][x] == symbol){
                    streak++
                }
                if (x == endX || y == endY || board[y][x] != symbol){
                    if (streak >= 4){
                        let offset = board[y][x] == symbol ? 0 : -1
                        matches.push(new ConnectMatch([y - streak + 1 + offset, x - streak + 1 + offset], [y+offset, x+offset], symbol))
                    }
                    streak = 0
                }
                x++
                y++
            }

            if (column <= (5 - row)){
                startX = Math.max(0, column - 3)
                startY = row + (column - startX)
                endY = Math.max(0, row - 3)
                endX = column + (row - endY)
            } else{
                startY = Math.min(5, row + 3)
                startX = column - (startY - row)
                endX = (Math.min(6, column + 3))
                endY = row - (endX - column)
            }
            x = startX
            y = startY
            while (x <= endX && y >= endY){
                if (board[y][x] == symbol)  
                    streak++
                if (x == endX || y == endY || board[y][x] != symbol){
                    if (streak >= 4){
                        let offset = board[y][x] == symbol ? 0 : -1
                        matches.push(new ConnectMatch([y + streak - 1 - offset, x - streak + 1 + offset], [y - offset, x + offset], symbol))
                    }
                    streak = 0
                }
                x++
                y--
            }
            if (this.totalMoves == 42 && matches.length == 0){
                gameState.currentState = "draw"
            } else if (matches.length > 0){
                gameState.currentState = matches[0].symbol == this.player1.symbol ? "p1" : "p2"
            }
        }
        
        if (matches.length == 0 && this.isCancelled)
            gameState.currentState = "cancelled"
        

        return gameState
    }

    getIndex(row, column){
        return 7 * row + column
    }

    getPos(index){
        const row = Math.floor(index / 7)
        const column = index - (7 * row)
        return [row, column]
    }

    getSymbol(index){
        const [row, column] = this.getPos(index)
        return this.board[row][column]
    }

    lowestFreeSlot(column, board=this.board){
        for (let i = 0; i < 6; i++){
            if (board[i][column] == 0)
                return i
        }
        return 6
    }

    clientCanPlace(column){
        return Date.now() > this.placementCooldown && this.gameState.currentState == "active" && this.currentPlayer.isClient && this.lowestFreeSlot(column) < 6
    }

    canPlaceChip(column){
        return this.gameState.currentState == "active" && this.lowestFreeSlot(column) < 6
    }

    placeChipClient(column){
        if (!this.clientCanPlace(column)) return
        if (this.mode == 2){
            const connectMoveData = {
                "TotalMoves": this.totalMoves,
                "Column": column
            }
            GameSocket.sendMessage("GameMoveData", connectMoveData)
            return
        }
        this.placeChip(column)
    }

    placeChip(column){
        if (!this.canPlaceChip(column)){
            return
        } 
        const row = this.lowestFreeSlot(column)
        this.board[row][column] = this.currentPlayer.symbol
        this.history += `${column}`
        this.totalMoves++
        this.lastPlaced = this.getIndex(row, column)
        this.lastPlacedUi = this.lastPlaced
        this.lastPlacementDelay = this.getPlacementTime(row)
        this.updateGameState(this.board, false)

        if (this.gameState.currentState == "active"){
            this.changePlayer()
        }
        this.placementCooldown = Date.now() + (this.getPlacementTime(row))
        this.refresh()
        const lastId = this.currentGameId
        setTimeout(() =>{
            if (this.currentGameId != lastId) return
            if (this.gameState.currentState != "active")
                this.completeGame()
            this.updateUiProxy()
            this.refresh()
        }, this.getPlacementTime(row))
    }

    receiveOnlineMove(moveData){
        this.placeChip(moveData.Column)
    }

    getPlacementTime(row){
        return this.getFallTime(row) * 1000 + this.chipHangTime
    }

    getFallTime(row){ // seconds
        const fallHeight = 670 - (110 * row)
        return Math.sqrt((fallHeight / 400)/4.91)
    }

    boardHasSpace(board=this.board){
        for (let i = 0; i < 7; i++){
            if (board[5][i] == 0)
                return true
        }
        return false
    }
}

class ConnectMatch{
    matchStart;
    matchEnd;
    symbol;
    constructor(_matchStart, _matchEnd, _symbol){
        this.matchStart = _matchStart
        this.matchEnd = _matchEnd
        this.symbol = _symbol
    }
}