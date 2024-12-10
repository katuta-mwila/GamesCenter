import React from 'react'
import GameFrame from './GameFrame'
import tictactoe from "../../../assets/tictactoe.png"
import fourchip from "../../../assets/fourchip2.png"
import checkicon from "../../../assets/checkicon.jpg"
import MenuPage from '../../../components/Layout/MenuPage'
import ContentContainer from '../../../components/ContentContainer'

const GamesSelector = () => {
  return (
    <MenuPage id="games-selection-page">
      <ContentContainer gap='30px' className='menu-content'>
        <div id="gsp-top" className="simple-center">
          <h1 className='super-header' style={{color: "white", fontWeight: "600"}}>Games</h1>
        </div>
        <div id="gsp-center" className="simple-center">
          <div id="games-selection-grid">
            <GameFrame image={tictactoe} title="Tic Tac Toe" id="tictactoe"/>
            <GameFrame image={fourchip} title="Connect 4" id="connect4"/>
            <GameFrame image={checkicon} title="Checkers" id="checkers"/>
          </div>
        </div>
        <div id="gsp-bottom"></div>
      </ContentContainer>
        
    </MenuPage>
  )
}

export default GamesSelector