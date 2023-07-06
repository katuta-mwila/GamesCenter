import { EventHandler } from "./EventHandler";
import GameSocket from "./NetCode/GameSocket";
import {v4 as uuid} from "uuid"
import Helper from "../../../util/Helper";

export class Game{
    board;
    chat;
    currentGameId;
    mode;
    totalMoves = 0;
    history = "";
    startingPlayer;
    currentPlayer;
    player1;
    player2;
    start;
    totalGames = 0;
    alternateStartingPlayer = true;
    refresh = () => {};
    playerTurnEvent = new EventHandler()
    gameStartEvent = new EventHandler()
    gameState;
    uiGameState; // sometimes ui should be delayed if animation is involved ect
    hasStarted = false;
    isCancelled = false;
    hasRequestedRestart = false;
    uiProxy;
    isConnected = false;
    constructor(p1Name, p2Name){
        this.player1 = new Player(p1Name)
        this.player2 = new Player(p2Name)
        this.startingPlayer = this.player1
        this.gameState = new GameState()
        this.initBoard()
        this.updateUiProxy()
    }

    updateUiProxy(){
        const proxy = new UiProxy()
        proxy.player1Score = this.player1.score
        proxy.player2Score = this.player2.score
        proxy.totalGames = this.totalGames
        proxy.gameState = this.gameState
        proxy.p1Name = this.player1 ? this.player1.name : ""
        proxy.p2Name = this.player2 ? this.player2.name : ""
        proxy.currentPlayerName = this.currentPlayer ? this.currentPlayer.name : ""
        this.uiProxy = proxy
    }

    resetAllValues(){
        this.totalGames = 0
        this.totalMoves = 0
        this.startingPlayer = this.player1
        this.player1.score = 0
        this.player2.score = 0
        this.isCancelled = false
    }

    initBoard(){

    }

    loadBoard(onlineBoard){
        
    }

    start(currentGameData, startMessage="The game has started"){
        this.callGameStartEvent()
        this.currentGameId = uuid()
        if (this.isCancelled)
            this.resetAllValues()
        this.isCancelled = false
        if (currentGameData)
            this.loadOnlineGame(currentGameData)
        else{
            this.initBoard()
            this.totalMoves = 0
            this.history = ""
            this.currentPlayer = (!this.alternateStartingPlayer || this.startingPlayer == null || this.startingPlayer == this.player1) ? this.player1 : this.player2
            this.startingPlayer = this.currentPlayer == this.player1 ? this.player2 : this.player1
            this.hasStarted = true
            this.hasRequestedRestart = false
            this.callPlayerTurnEvent()
        }
        if (!currentGameData || (currentGameData && currentGameData.GameState == 1))
            this.chat.addInfo(startMessage)
        this.updateGameState(this.board, true)
        this.refresh()
    }

    loadOnlineGame(currentGameData){
        this.loadBoard(currentGameData.Board)
        this.handleGameData(currentGameData)
        if (currentGameData.GameState == 2)
            this.isCancelled = true
        const clientRestartIndex = this.player1.isClient ? 0 : 1
        const opponentRestartIndex = this.player1.isClient ? 1 : 0
        if (currentGameData.RestartRequests[clientRestartIndex])
            this.hasRequestedRestart = true
        if (currentGameData.RestartRequests[opponentRestartIndex])
            this.chat.addInfo(this.getOpponent().name + " has voted to replay")
        this.history = currentGameData.History
        this.totalMoves = currentGameData.TotalMoves
        this.totalGames = currentGameData.TotalGames
        this.player1.score = currentGameData.PlayerOneScore
        this.player2.score = currentGameData.PlayerTwoScore
        this.currentPlayer = currentGameData.CurrentPlayer == 1 ? this.player1 : this.player2
        this.startingPlayer = currentGameData.StartingPlayer == 1 ? this.player1 : this.player2
        this.hasStarted = true
    }

    requestRestart(){
        if (this.mode == 2 && this.canRequestReplay()){
            GameSocket.sendMessage("RestartRequest", {})
            this.hasRequestedRestart = true
            this.refresh()
        }
        else if (this.mode != 2)
            this.start()
    }

    completeGame(){
        this.totalGames++;
        if (this.gameState.currentState == "draw") return
        if (this.gameState.currentState == "p1")
            this.player1.score++
        else
            this.player2.score++
        this.chat.addInfo("Game has ended")
    }

    changePlayer(callPlayerTurnEvent = true){
        //console.log(this.history)
        this.currentPlayer = this.currentPlayer == this.player1 ? this.player2 : this.player1
        if (callPlayerTurnEvent)
            this.callPlayerTurnEvent()
    }

    addPlayerTurnEventHandler(handler, obj){
        this.playerTurnEvent.addHandler(handler.bind(obj))
    }

    callPlayerTurnEvent(){
        if (!this.currentPlayer.isClient)
            this.playerTurnEvent.call()
    }

    addGameStartEventHandler(handler, obj){
        this.gameStartEvent.addHandler(handler.bind(obj))
    }

    callGameStartEvent(){
        this.gameStartEvent.call()
    }

    receiveOnlineMove(){

    }

    isOnline(){
        return this.mode == 2
    }

    getClient(){
        return this.player1.isClient ? this.player1 : this.player2
    }

    getOpponent(){
        return !this.player1.isClient ? this.player1 : this.player2
    }

    updateGameState(){

    }

    cancelGame(){
        this.isCancelled = true
        this.updateGameState(this.board, true)
        this.refresh()
    }

    canRequestReplay(){
        return !this.hasRequestedRestart && (this.mode != 2 || (this.isConnected && (this.gameState.currentState == "draw" || this.gameState.currentState == "p1" || this.gameState.currentState == "p2")))
    }

    handleGameData(){

    }

    getWaitingPlayer(){
        return this.currentPlayer == this.player1 ? this.player2 : this.player1
    }

    canSaveGame(){
        return this.gameState.currentState != "active" && this.history.length > 0
    }
}

export class GameState{
    currentState; //"active, draw, player one wins, or player two wins"
    stateObj;
    stateText = "No State";
    constructor(){

    }
}

export class Player{
    name;
    score = 0;
    symbol;
    isClient = false;
    connectionStatus = "none" // none, connected, disconnected, timedout
    userId;
    constructor(_name){
        this.name = _name;
    }

    hasConnected(){
        return !(this.name == null || this.name == "")
    }

    transplantPlayerSession(session, token){
        this.name = session.Username
        this.userId = session.UserId
        this.isConnected = session.IsConnected
        this.isClient = session.UserId == token.UserId
        this.connectionStatus = Helper.getConnectionStatus(session)
    }
    
}

export class UiProxy{
    currentPlayerName;
    p1Name;
    p2Name;
    player1Score = 0
    player2Score = 0
    totalGames = 0
    gameState = new GameState()
    constructor(){

    }

    getStateText(){
        switch(this.gameState.currentState){
            case "active":
                return this.currentPlayerName + "'s turn"
            case "draw":
                return "Draw"
            case "pending":
                return "Game Pending"
            case "cancelled":
                return "Game Cancelled"
            case undefined:
                return "Game Pending"
        }
        return `${this.gameState.currentState == "p1" ? this.p1Name : this.p2Name} wins!` 
    }
}

// const handleInitialMessage = (initialMessage) =>{
//     game.player1.isConnected = initialMessage.HostSession.IsConnected
//     game.player1.name = initialMessage.HostSession.Username 
//     game.player1.isClient = initialMessage.HostSession.UserId == token.UserId ? true : false;
//     if (initialMessage.PeerSession){
//         game.player2.name = initialMessage.PeerSession.Username
//         game.player2.isClient = initialMessage.PeerSession.UserId == token.UserId ? true : false;
//         game.player2.isConnected = initialMessage.PeerSession.IsConnected
//         if (game.player2.isConnected)
//             game.start()
//     } 
//     game.refresh()
// }