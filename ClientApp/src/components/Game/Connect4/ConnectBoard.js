import React, {useContext, useEffect} from 'react'
import { GameContext } from '../../../Pages/Games/GamesSelector/g/play/play'
import connnectgrid from "../../../assets/connectgrid2.png"
import Helper from '../../../util/Helper'

const ConnectBoard = () => {
    const gameContextObject = useContext(GameContext)
    const connectGame = gameContextObject.game

    useEffect(() =>{
        const connectBoard = document.getElementById("game-board")
        if (connectGame.lastPlacedUi != null){
            const lastPlaced = connectGame.lastPlacedUi
            setTimeout(() =>{
                const lastPlacedChip = document.getElementById("connectchip" + lastPlaced)
                lastPlacedChip.style.transform = ""
            }, connectGame.chipHangTime)
            connectGame.lastPlacedUi = null
        }
        
        const gameState = connectGame.uiProxy.gameState
        if (gameState.currentState != "p1" && gameState.currentState != "p2"){
            Array.from(connectBoard.querySelectorAll(".connect-line")).forEach(line =>{
                line.remove()
            })
            return
        }
        
        for (let i = 0; i < gameState.stateObj.length; i++){
            const connectBoardBox = connectBoard.getBoundingClientRect()
            const match = gameState.stateObj[i]
            const [y1, x1] = match.matchStart
            const [y2, x2] = match.matchEnd
            const centerA = {x:60 + (110 * x1), y: 610 - (110 * y1)}
            const centerB = {x:60 + (110 * x2), y: 610 - (110 * y2)}

            const line = document.createElement("div")
            line.className = "connect-line"
            line.style.zIndex = 100
            line.style.left = centerA.x + "px"
            line.style.top = centerA.y + "px"
            line.style.width = Helper.distance(centerA.x, centerA.y, centerB.x, centerB.y) + "px"
            const ang = 180 * Math.atan2(centerB.y - centerA.y, centerB.x - centerA.x) / Math.PI
            line.style.transform = `rotate(${ang}deg)`
            connectBoard.appendChild(line)
        }
    })

    const imageLoaded = () =>{
        gameContextObject.forceReload(true) 
    }

    const columnClick = (column) =>{
        connectGame.placeChipClient(column)
    }

    let prevX = 0
    return (
        <div className="connect-board" id="game-board">
            <img className="connect-board-image" src={connnectgrid} width="780px" onLoad={imageLoaded} draggable={false}/>
            {[...Array(42)].map((x, i) =>{
                const pos = connectGame.getPos(i)
                const symbol = connectGame.getSymbol(i)
                const chipClass = symbol == 1 ? "connect-chip player1" : "connect-chip player2"
                const id = `connectchip${i}`
                
                if (symbol == 1 || symbol == 2){
                    const posX = (10 + (110 * pos[1]))
                    const posY = (560 - (110 * [pos[0]]))
                    let transform
                    transform = connectGame.lastPlacedUi == i ?  `translateY(${-posY - 110}px)` : null
                    const transDuration = connectGame.getFallTime(pos[0])
                    return (
                        <div key={id} id={id} className={chipClass} style={{left: posX + "px", top: posY + "px", transform, transitionDuration: transDuration + "s"}}></div>
                    )
                }
            })}
            {[...Array(7)].map((x, i) =>{
                const posX = prevX
                const width = (i == 0 || i == 6) ? 115 : 110
                prevX = posX + width
                return (
                    <div key={"listiner" + i} id={"connectlistener" + i} className="connect-listener" style={{left: posX + "px", top: 0, width: width + "px"}} onClick={() => columnClick(i)}></div>
                )
            })}
        </div>
    )
}

export default ConnectBoard