import { BaseAI } from "./BaseAI";

const CenterColumnPoints = 70
const Connect2Points = 30
const Connect3Points = 90
const Connect4Points = 1_000_000

export class ConnectAi extends BaseAI{
    copyBoard = [[0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0],
                 [0, 0 , 0, 0, 0, 0, 0]];
    internalDelay = 500
    connectScore;
    worker = new window.Worker("./ConnectWebworker.js")
    newGame = true

    constructor(game, difficulty){
        super(game, difficulty)
        this.delay = 0
        this.connectScore = new ConnectScore()
        this.worker.onmessage = this.onMessage.bind(this)
    }

    onGameStart(){
        this.connectScore = new ConnectScore()
        this.newGame = true
    }

    chooseBestOptionAfterDelay(lastKnownId){
        const startTime = Date.now()
        const lastPlacementDelay = this.game.lastPlacementDelay
        const totalExpectedDelay = lastPlacementDelay + this.internalDelay
        for (let row = 0; row < 6; row++){
            for (let column = 0; column < 7; column++){
                this.copyBoard[row][column] = this.game.board[row][column]
            }
        }
        
        const [row, column] = this.game.getPos(this.game.lastPlaced)
        this.worker.postMessage({difficulty: this.difficulty, newGame: this.newGame, copyBoard: this.copyBoard, connectScore: this.connectScore, row, column, startTime, totalExpectedDelay, placementDelay: lastPlacementDelay, lastKnownId})
        this.newGame = false
    }

    onMessage(message){
        const ellapsed = Date.now() - message.data.startTime
        const delay = Math.max(0, message.data.totalExpectedDelay - ellapsed)
        setTimeout(() =>{
            
            if (message.data.lastKnownId != this.game.currentGameId) return
            this.game.placeChip(message.data.chosen)
        }, delay)
        //console.log(`Placement Delay: ${message.data.placementDelay.toFixed(2)}ms\nInternal Delay: ${this.internalDelay.toFixed(2)}ms\nTotal Delay: ${(message.data.totalExpectedDelay).toFixed(2)}\nAi Processing Time: ${ellapsed.toFixed(2)}ms\nApplied Delay: ${delay.toFixed(2)}ms`)
    }
}

class ConnectScore{
    aiScore = new ScoreTally()
    humanScore = new ScoreTally()
    constructor(){

    }

    getScore(){
        return this.aiScore.getTotalScore() - this.humanScore.getTotalScore()
    }

    fromSymbol(sym){
        return sym == 1 ? this.humanScore : this.aiScore
    }
}

class ScoreTally{
    centerColumn = 0;
    connect2 = 0;
    connect3 = 0;
    connect4 = 0;
    bonusPoints = 0;

    constructor(){

    }

    getTotalScore(){
        return (this.centerColumn * CenterColumnPoints) + (this.connect2 * Connect2Points) + 
        (this.connect3 * Connect3Points) + (this.connect4 * Connect4Points) + this.bonusPoints
    }

    subtract(tally){
        this.centerColumn -= tally.centerColumn
        this.connect2 -= tally.connect2
        this.connect3 -= tally.connect3
        this.connect4 -= tally.connect4
        this.bonusPoints -= tally.bonusPoints
    }

    add(tally){
        this.centerColumn += tally.centerColumn
        this.connect2 += tally.connect2
        this.connect3 += tally.connect3
        this.connect4 += tally.connect4
        this.bonusPoints += tally.bonusPoints
    }
}

class SlotInfo{
    row;
    column;
    symbol;
    index;
    constructor(_row, _column, _symbol, _index){
        this.row = _row
        this.column = _column
        this.symbol = _symbol
        this.index = _index
    }

    getKey(){
        return 7 * this.row + this.column
    }
}

class WorkerMessage{
    copyBoard;
    connectScore;
    row;
    column;
    startTime;
    totalExpectedDelay;
    placementDelay;
    lastKnownId
    constructor(_copyBoard, _connectScore, _row, _column, _startTime, _totalExpectedDelay, _placementDelay, _lastKnownId){
        this.copyBoard = _copyBoard
        this.connectScore = _connectScore
        this.row = _row
        this.column = _column
        this.startTime = _startTime
        this.totalExpectedDelay = _totalExpectedDelay
        this.placementDelay = _placementDelay
        this.lastKnownId = _lastKnownId
    }
}