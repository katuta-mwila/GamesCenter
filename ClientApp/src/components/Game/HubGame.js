import React, {useContext} from 'react'
import { GameContext } from '../../Pages/Games/GamesSelector/g/play/play'
const HubGame = () => {
  const globalContextObject = useContext(GameContext)
  return (
    <>{globalContextObject.createComponent()}</>
  )
}

export default HubGame