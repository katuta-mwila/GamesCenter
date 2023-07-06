import React from 'react'

const PlayerNameAndScore = ({player, score}) => {
  const connectedStyle = {
    "textDecoration": "none",
  }

  const disconnectedStyle = {
    "textDecoration": "line-through",
  }

  const timedOutStyle = {
    "textDecoration": "line-through",
    "color": "red"
  }

  const styles = {
    "connected": connectedStyle,
    "none": connectedStyle,
    "disconnected": disconnectedStyle,
    "timedout": timedOutStyle
  }

  const style = styles[player.connectionStatus]

  return (
    <div className="game-info">
        <div className="game-info-item">
          <div className="game-info-left">
            <p style={style}>
                {player.name && player.name}
                {!player.name && "Waiting..."}
            </p>
          </div>
          <div className="game-info-right">
            <p style={style}>
                {score}
            </p>
          </div>
        </div>
    </div>
  )
}

export default PlayerNameAndScore