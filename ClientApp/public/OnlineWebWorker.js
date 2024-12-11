const OnlineWorker = (function(){
    let url = null
    let socket = null
    let intervalId = null
    const sendMessage = (messageType, object) =>{
        socket.send(messageType + "_" + JSON.stringify(object));
    }

    const CreateConnection = function(gameId, code, _url){
        url = _url
        const wsUrl = `${this.location.protocol === 'https:' ? 'wss' : 'ws'}://${url}/ws/${gameId}/${code}`
        socket = new WebSocket(wsUrl)
        
        socket.onopen = (event) =>{
            postMessage({type: "onopen", eventData: event.data})
        }

        socket.onerror = (event) =>{
            postMessage({type: "onerror", eventData: event.data})
        }

        socket.onclose = (event) =>{
            postMessage({type: "onclose", reason: event.reason})
        }

        socket.onmessage = (event) =>{
            if (event.data == "pong"){
                return
            }
            postMessage({type: "onmessage", eventData: event.data})
        }

        intervalId = setInterval(() =>{
            if (socket.readyState > 1){
                clearInterval(intervalId)
                return
            }
            socket.send("ping")
        }, 1000)
    }

    const onmessage = function(message){
        switch(message.data.type){
            case "createconnection":
                CreateConnection(message.data.gameId, message.data.code, message.data.url)
                break
            case "sendmessage":
                sendMessage(message.data.messageType, message.data.object)
                break
        }
    }
    return {onmessage}
})()

onmessage = OnlineWorker.onmessage
