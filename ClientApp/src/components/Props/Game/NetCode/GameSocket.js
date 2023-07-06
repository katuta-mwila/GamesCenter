import { ErrorCollection } from "../../Form/ErrorCollection";
import Helper from "../../../../util/Helper";
import { GamePopupProp, GamePopup, GamePopupButton } from "../../../../Pages/Games/GamesSelector/g/play/GamePopup";
import { PopupProp } from "../../../Layout/RefinedPopupManager";

const GameSocket = (function(){
    const worker = new Worker("./OnlineWebWorker.js")

    let socket = null
    let game = null
    let isConnected = false
    let token = null
    let globalContext = null
    let gameId = null
    let code = null
    let canSendPing = true
    let lastPongDate = new Date()
    let lastPingDate= new Date()
    let lastCycle = new Date()

    const SetGame = _game => {
        game = _game
    }

    const isOpen = () =>{
        return isConnected
    }

    const setGlobalContext = gc =>{
        globalContext = gc
        token = gc.token
    }

    const setGameId = (_gameid) => {
        gameId = _gameid
    }

    const CreateConnection = (c) =>{
        if (isConnected) return
        code = c
        const createConnectionObject = {
            type: "createconnection",
            url: globalContext.hostname + ":" + globalContext.sslPort,
            code,
            gameId
        }
        worker.postMessage(createConnectionObject)
    }

    worker.onmessage = function(message){
        const data = message.data
        switch(data.type){
            case "onopen":
                socketOpen(data.eventData)
                break
            case "onerror":
                socketError(data.eventData)
                break
            case "onclose":
                socketClose(data.reason)
                break
            case "onmessage":
                socketMessage(data.eventData)
                break
        }
    }

    const socketOpen = function(eventData){
        //console.log("Socket is open")
        isConnected = true
        game.isConnected = true
    }

    const socketError = function(eventData){
        //console.log("Error has occurred")
    }

    const socketClose = function(reason){
        //console.log("Connection has closed")
        isConnected = false
        game.isConnected = false
        switch(reason){
            case "invalid_connection_code":
                handleInvalidConnectionCode(code)
                break;
            case "duplicate_connection":
                handleDuplicateConnection(code)
                break;
            default:
                game.refresh()
                game.chat.addItem("[i]", "Connection to server has been lost")
                break;
        }
    }

    const socketMessage = function(eventData){
        try{
            const serverMessage = JSON.parse(eventData)
            const errorCollection = new ErrorCollection()
            errorCollection.parse(serverMessage.ErrorCollection)
            //console.log("Message Received: " + serverMessage.MessageType)
            //console.log(serverMessage)

            if (serverMessage.ChatMessages){
                for (let i = 0; i < serverMessage.ChatMessages.length; i++)
                {
                    const item = serverMessage.ChatMessages[i]
                    game.chat.addItem(item.title, item.text)
                }
            }

            switch (serverMessage.MessageType){
                case "ConnectionServerMessage":
                    onConnect(serverMessage)
                    break
                case "OpponentConnectedServerMessage":
                    onOpponentConnect(serverMessage)
                    break
                case "OpponentDisconnectedServerMessage":
                    onOpponentDisconnect()
                    break
                case "PlayerMoveServerMessage":
                    handlePlayerMove(serverMessage)
                    break
                case "GameDataUpdateServerMessage":
                    handleGameDataUpdate(serverMessage)
                    break
                case "RefreshPageServerMessage":
                    window.location.reload()
                    break
                case "RefreshRequestResponseServerMessage":
                    if (errorCollection.hasAnyErrors())
                        window.location.reload()
                    break
                case "RestartDemandServerMessage":
                    if (serverMessage.RestartRequests == 2){
                        game.start(null, "")
                    }
                    break
                case "OpponentTimedOutServerMessage":
                    game.getOpponent().connectionStatus = "timedout"
                    game.cancelGame()
                    break
            }
        } catch(err){
            throw err
        }
    }

    const onConnect = (message) =>{
        if (message.HostSession)
            game.player1.transplantPlayerSession(message.HostSession, token)
        if (message.PeerSession)
            game.player2.transplantPlayerSession(message.PeerSession, token)
        
        if (message.CurrentGameData)
        {
            game.start(message.CurrentGameData)
            return
        }
        game.refresh()
    }

    const onOpponentConnect = (message) =>{
        const opponent = game.player1.isClient ? game.player2 : game.player1
        if (opponent.connectionStatus == "none" || opponent.connectionStatus == "timedout"){
            opponent.transplantPlayerSession(message.OpponentSession, token)
        }
        opponent.connectionStatus = "connected"
        if ((!game.hasStarted || game.isCancelled) && message.ShouldStartGame){
            game.start()
            return
        }
        game.refresh()
    }

    const onOpponentDisconnect = (message) =>{
        const opponent = !game.player1.isClient ? game.player1 : game.player2;
        opponent.isConnected = false
        opponent.connectionStatus = "disconnected"
        game.refresh()
    }

    const handlePlayerMove = (message) =>{
        if (Object.keys(message.ErrorCollection.collection).length != 0)
            return
        game.receiveOnlineMove(message.MoveData)
    }

    const handleGameDataUpdate = (message) =>{
        game.start(message.CurrentGameData)
    }

    const sendMessage = (messageType, object) =>{
        //socket.send(messageType + "_" + JSON.stringify(object));
        worker.postMessage({
            type: "sendmessage",
            messageType,
            object
        })
    }

    const pushGamePopup = (gamePopupProp) =>{
        const popupProp = new PopupProp("invalid_connection_popup", (<GamePopup gamePopupProp={gamePopupProp}/>))
        popupProp.closeOnBackgroundClick = false
        popupProp.blurred = true
        globalContext.addPopup(popupProp)
    }

    const handleInvalidConnectionCode = (code) =>{
        const gamePopupProp = new GamePopupProp("invalid-connection-code")
        gamePopupProp.message = `Cannot connect to game session #${code} because either the session is full or the session is invalid`
        gamePopupProp.messageColor = "rgb(255, 67, 67)"

        const okButton = new GamePopupButton("invalid-connection-code-ok")
        okButton.title = "Ok"
        okButton.url = `/games/g/${gameId}`

        gamePopupProp.buttons.push(okButton)
        pushGamePopup(gamePopupProp)
    }

    const handleDuplicateConnection = () =>{
        const gamePopupProp = new GamePopupProp("duplicate-connection")
        gamePopupProp.message = "You are already connected to this game in another tab or window"
        gamePopupProp.messageColor = "rgb(255,67,67)"

        const okButton = new GamePopupButton("invalid-connection-code-ok")
        okButton.title = "Ok"
        okButton.url = `/games/g/${gameId}`

        gamePopupProp.buttons.push(okButton)
        pushGamePopup(gamePopupProp)
    }

    return {CreateConnection, SetGame, sendMessage, isOpen, setGlobalContext, setGameId}
})();

export default GameSocket