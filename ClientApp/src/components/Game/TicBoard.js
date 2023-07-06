import React, { useContext, useEffect } from 'react'
import { GameContext } from '../../Pages/Games/GamesSelector/g/play/play'
import Helper from '../../util/Helper'

const TicBoard = ({}) => {
  const gameContextObject = useContext(GameContext)
  const ticGame = gameContextObject.game
  const tileClick = (index) =>{
    if (!ticGame.currentPlayer || !ticGame.currentPlayer.isClient || ticGame.gameState.currentState != "active") return
    const pos = ticGame.getPos(index)
    ticGame.placeSymbolClient(pos[0], pos[1])
  }
  const gameState = ticGame.gameState
  useEffect(() =>{
    let ticBoard = document.getElementById("game-board")
    if (gameState.currentState != "p1" && gameState.currentState != "p2"){
      Array.from(ticBoard.querySelectorAll(".tic-line")).forEach(line =>{
        line.remove()
      })
      return
    }
    for (let i = 0; i < gameState.stateObj.length; i++){
      const match = gameState.stateObj[i]
      let ticBoardBox = ticBoard.getBoundingClientRect()
      let boxA = document.getElementById(`ticbox_${match.matchStart[0]}${match.matchStart[1]}`).getBoundingClientRect()
      let boxB = document.getElementById(`ticbox_${match.matchEnd[0]}${match.matchEnd[1]}`).getBoundingClientRect()
      let centerA = {x: (boxA.left + boxA.right) * 0.5 - ticBoardBox.left, y: (boxA.top + boxA.bottom) * 0.5 - ticBoardBox.top}
      let centerB = {x: (boxB.left + boxB.right) * 0.5 - ticBoardBox.left, y: (boxB.top + boxB.bottom) * 0.5 - ticBoardBox.top}
      const line = document.createElement("div")
      line.className = "tic-line"
      line.style.left = centerA.x + "px"
      line.style.top = centerA.y + "px"
      line.style.width = Helper.distance(centerA.x, centerA.y, centerB.x, centerB.y) + "px"
      ticBoard.appendChild(line)
      let ang = 180 * Math.atan2(centerB.y - centerA.y, centerB.x - centerA.x) / Math.PI
      line.style.transform = `rotate(${ang}deg)`
    }
  })
  return (
    <div id="game-board" className="tic-board">
      {[...Array(9)].map((x, i) => {
        const pos = ticGame.getPos(i)
        const symbol = ticGame.getSymbol(i)
        const visibleClass = symbol == "" ? "" : "visible "
        return (<div key={`ticbox_${i}`} id={`ticbox_${pos[0]}${pos[1]}`} className={`tic-box simple-center${(ticGame.clientCanPlace(pos[0], pos[1])) ? " active-tile" : ""}`} onClick={() => tileClick(i)}>
                  <div className={`${visibleClass} tic-symbol`}>
                    {symbol}
                  </div>
              </div>)})}
    </div>
  )
}

export default TicBoard