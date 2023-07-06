const Helper = (function(){
    const formatText = (text) =>{
        const reg1 = /(^\s+)|(\s+$)/g
        const reg2 = /(?<=[^\s])\s+(?=[^\s])/g
        return text.replace(reg1, "").replace(reg2, " ")
    }

    const getConnectionStatus = playerSession =>{
        if (playerSession.IsConnected) 
            return "connected"
        if (playerSession.TimedOut)
            return "timedout"
        return "disconnected"
    }

    const distance = (x1, y1, x2, y2) =>{
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow((y1-y2), 2))
      }

    return {formatText, getConnectionStatus, distance}
})()

export default Helper