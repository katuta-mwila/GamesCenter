import React, {useContext, useEffect, useState, useRef} from 'react'
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
    const [boardScale, setBoardScale] = useState(1)

    const reload = useReload()
    const gameContextObject = useContext(GameContext)
    const game = gameContextObject.game
    const activePiece = useRef()
    const mouse = useRef({x: null, y: null})
    const boardElement = useRef()

    const getX = (e) =>{
      if (e.type === 'touchstart' || e.type === 'touchend' || e.type === 'touchmove'){
        const touch = e.touches[0] || e.changedTouches[0]
        return touch.clientX
      } else 
        return e.clientX
    }

    const getY = (e) =>{
      if (e.type === 'touchstart' || e.type === 'touchend' || e.type === 'touchmove'){
        const touch = e.touches[0] || e.changedTouches[0]
        return touch.clientY
      } else 
        return e.clientY
    }

    const pieceDrag = (piece, element, coord, e) =>{
      if (!activePiece.current) return
      const offset = {x: mouse.current.x - getX(e), y: mouse.current.y - getY(e)}

      element.style.transform = `translate(${coord.x - offset.x}px, ${coord.y - offset.y}px)`
    }

    const pieceEndDrag = (piece, element, e) =>{
      const coord = piece.getCoord(game)
      const box = boardElement.current.getBoundingClientRect()
      coord.x = boardScale * coord.x
      coord.y = boardScale * coord.y
      element.style.transform = `translate(${coord.x + "px"}, ${coord.y + "px"})`
      piece.selected = false
      activePiece.current = null

      document.onmousemove = null
      document.onmouseup = null
      document.ontouchend = null
      document.ontouchmove = null

      const x = getX(e) - box.left
      const y = getY(e) - box.top
      const row = Math.floor(y / (game.boxWidth * boardScale))
      const column = Math.floor(x / (game.boxWidth * boardScale))
      if (game.validMoveClient(piece, row, column)){
        if (game.mode == 2)
          element.style.display = "none"
        game.makeMoveClient(piece, row, column)
      }
      reload()
    }

    const checkPieceMouseDown = (piece, e) =>{
      e.preventDefault()
      if (!game.canGrabPiece(piece)) return
      console.log(e)
      activePiece.current = piece
      piece.selected = true
      const element = document.getElementById(piece.id)
      const box = element.getBoundingClientRect()
      mouse.current.x = getX(e)
      mouse.current.y = getY(e)
      const coord = piece.getCoord(game)
      coord.x = boardScale * coord.x
      coord.y = boardScale * coord.y
      const startCoord = {x: coord.x + (mouse.current.x - box.left) - (boardScale * (game.chipWidth / 2)), y: coord.y + (mouse.current.y - box.y) - (boardScale * (game.chipWidth / 2))}
      element.style.transform = `translate(${startCoord.x}px, ${startCoord.y}px)`

      document.onmouseup = pieceEndDrag.bind(null, piece, element)
      document.onmousemove = pieceDrag.bind(null, piece, element, startCoord)

      document.ontouchend = pieceEndDrag.bind(null, piece, element)
      document.ontouchmove = e => {
        e.preventDefault()
        pieceDrag(piece, element, startCoord, e)
      }

      reload()
    }

    const adjustScale = () =>{
      const boardWidth = boardElement.current.offsetWidth
     setBoardScale(prev =>{
      console.log(prev, boardWidth / 760)
      return boardWidth / 760
     })
    }

    useEffect(() =>{
      window.addEventListener('resize', adjustScale)
      adjustScale()
    }, [])

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
          let posX = (coord.x * boardScale)
          let posY = (coord.y * boardScale)
          return (
            <img  onContextMenu={e => e.preventDefault()} key={piece.id} id={piece.id} className="check-chip-image" src={pieces[(piece.player * 2) - (piece.king ? 0 : 1)]} width={(game.chipWidth * boardScale) + "px"} 
            style={{display: piece.visible ? "inline" : "none", transform: `translate(${posX + "px"}, ${posY + "px"})`, zIndex: piece.selected ? "2" : "1", pointerEvents: activePiece.current == null ? "" : "none", cursor: game.canGrabPiece(piece) ? "grab" : ""}} 
            onMouseDown={checkPieceMouseDown.bind(null, piece)} onTouchStart={checkPieceMouseDown.bind(null, piece)}
            draggable={false}></img>
          )
        })}
    </div>
  )
}

export default CheckBoard