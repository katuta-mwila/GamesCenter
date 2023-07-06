import React, {useContext, useEffect, useReducer, useRef} from 'react'
import { GameContext } from '../../Pages/Games/GamesSelector/g/play/play'
import checkchipred from "../../assets/checkchipred.png"
import checkchipredking from "../../assets/checkchipredking.png"
import checkchipblack from "../../assets/checkchipblack.png"
import checkchipblackking from "../../assets/checkchipblackking.png"
import useReload from '../../customhooks/useReload'

const pieces = {
  1: checkchipblack,
  2: checkchipblackking,
  3: checkchipred,
  4: checkchipredking,
}

const CheckBoard = () => {
    const reload = useReload()
    const gameContextObject = useContext(GameContext)
    const game = gameContextObject.game
    const activePiece = useRef()
    const mouse = useRef({x: null, y: null})
    const boardElement = useRef()

    const pieceDrag = (piece, element, coord, e) =>{
      if (!activePiece.current) return
      e.preventDefault()
      const offset = {x: mouse.current.x - e.clientX, y: mouse.current.y - e.clientY}

      element.style.transform = `translate(${coord.x - offset.x}px, ${coord.y - offset.y}px)`
    }

    const pieceEndDrag = (piece, element, e) =>{
      const coord = piece.getCoord(game)
      const box = boardElement.current.getBoundingClientRect()
      element.style.transform = `translate(${coord.x + "px"}, ${coord.y + "px"})`
      piece.selected = false
      activePiece.current = null
      document.onmousemove = null
      document.onmouseup = null
      const x = e.clientX - box.left
      const y = e.clientY - box.top
      const row = Math.floor(y / game.boxWidth)
      const column = Math.floor(x / game.boxWidth)
      if (game.validMoveClient(piece, row, column)){
        if (game.mode == 2)
          element.style.display = "none"
        game.makeMoveClient(piece, row, column)
      }
      reload()
    }

    const checkPieceMouseDown = (piece, e) =>{
      if (!game.canGrabPiece(piece)) return
      e.preventDefault()
      activePiece.current = piece
      piece.selected = true
      const element = document.getElementById(piece.id)
      const box = element.getBoundingClientRect()
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      const coord = piece.getCoord(game)
      const startCoord = {x: coord.x + (mouse.current.x - box.left) - (game.chipWidth / 2), y: coord.y + (mouse.current.y - box.y) - (game.chipWidth / 2)}
      element.style.transform = `translate(${startCoord.x}px, ${startCoord.y}px)`
      document.onmouseup = pieceEndDrag.bind(null, piece, element)
      document.onmousemove = pieceDrag.bind(null, piece, element, startCoord)
      reload()
    }

  return (
    <div ref={boardElement} className={`check-board`} id="game-board" style={{pointerEvents: game.uiProxy.gameState.currentState == "active" ? "" : "none", cursor: activePiece.current == null ? "" : "grab"}}>
        {[...Array(64)].map((x, i) =>{
          const [row, column] = game.getPos(i)
          const piece = game.board[row][column]
          const classNames = ["check-box"]
          if (game.isDark(row, column))
            classNames.push("playable")
          if (piece != 0 && piece.selected){
            classNames.push("selected-piece")
          }
          if (activePiece.current != null)
            classNames.push("selecting")
          if (piece === game.doubleMovePiece)
            classNames.push("double-move")


          const className = classNames.reduce((prev, cur, index) =>{
            return prev + " " + cur
          })
          return (
            <div key={i} className={className}></div>
          )
        })}
        {game.getAllPieces().map((piece, i) =>{
          const coord = piece.getCoord(game)
          let posX = coord.x
          let posY = coord.y
          return (
            <img key={piece.id} id={piece.id} className="check-chip-image" src={pieces[(piece.player * 2) - (piece.king ? 0 : 1)]} width={game.chipWidth + "px"} 
            style={{display: piece.visible ? "inline" : "none", transform: `translate(${posX + "px"}, ${posY + "px"})`, zIndex: piece.selected ? "2" : "1", pointerEvents: activePiece.current == null ? "" : "none", cursor: game.canGrabPiece(piece) ? "grab" : ""}} onMouseDown={checkPieceMouseDown.bind(null, piece)}
            draggable={false}></img>
          )
        })}
    </div>
  )
}

export default CheckBoard