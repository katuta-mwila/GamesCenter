import React from 'react'
import { Link } from 'react-router-dom'

const GameFrame = ({image, title, id}) => {
  return (
   <Link to={`/games/g/${id}`} className="game-frame-link" reloadDocument={true}>
    <div className='game-frame'>
        <div className="outside-frame">
            <div className="game-frame-border">
                <img className='game-frame-img' src={image} title={title}/>
            </div>
        </div> 
        <div className='title-section simple-center'>
            <h1 style={{fontSize: "28px", margin: "0", color: "#000", }}>{title}</h1>
        </div>
    </div>
    </Link>
  )
}

export default GameFrame