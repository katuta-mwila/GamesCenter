import React, {useState, useContext, useEffect, useMemo, useRef} from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import GameContextObject from '../../../../../components/Game/GameContextObject'
import HubGame from '../../../../../components/Game/HubGame'
import useReload from '../../../../../customhooks/useReload'
import { GameMap } from '../GameInfo'
import { GlobalContext } from '../../../../../App'
import { PopupProp } from '../../../../../components/Layout/RefinedPopupManager'
import HistoryPopup from './HistoryPopup'
import GameSocket from '../../../../../components/Props/Game/NetCode/GameSocket'
import PlayerNameAndScore from './PlayerNameAndScore'
import GameChat from '../../../../../components/Game/GameChat'

export const GameContext = React.createContext()

function resizeBs(){
    /*try{
        const gameHeaderRect = document.getElementById("game-state-header").getBoundingClientRect()
        const gameBoardRect = document.getElementById("game-board").getBoundingClientRect()
        const gaaRect = document.getElementById("game-inner-content").getBoundingClientRect()
        const sidebarRect = document.getElementById("game-sidebar-fixed").getBoundingClientRect()
        const chatDiv = document.getElementById("game-chat-area")
        chatDiv.style.height = Math.max(sidebarRect.height, gaaRect.height/*gameBoardRect.height + gameHeaderRect.height*//*) + "px"
    }catch(err){

    }*/
}

const Play = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [showSidebar, setShowSidebar] = useState(true)
    const globalContextObject = useContext(GlobalContext)
    const shouldResizeChat = useRef(true)
    const reload = useReload((refreshId, shouldResize) =>{
        if (shouldResize)
            shouldResizeChat.current = false
    })
    const gameId = useParams().game
    let [gameMode, setGameMode] = useState(searchParams.get("p")) // gamemode
    let [difficulty, setDifficulty] = useState(searchParams.get("d")) // difficulty
    let [code, setCode] = useState(searchParams.get("c")) // code
    let errorMessage = useRef("")
    const [contextObj, setContextObj] = useState(new GameContextObject())

    useEffect(() =>{
        document.getElementById("main-header").style.backgroundColor = "#363636" 
        if (!contextObj.gameId) return
        window.addEventListener("resize", resizeBs)
    }, [])

    useEffect(() =>{
        resizeBs()
        shouldResizeChat.current = false
    }, [shouldResizeChat.current])

    useMemo(() =>{
        if (!GameMap.has(gameId)){
            errorMessage.current = "Invalid GameId"
            return
        } else if (gameMode !== "0" && gameMode !== "1" && gameMode !== "2"){
            errorMessage.current = "Invalid Gamemode"
            return
        } else if (gameMode == "0" && difficulty != "0" && difficulty != "1" && difficulty != "2"){
            errorMessage.current = "Invalid difficulty"
            return
        } else if (gameMode == "2" && !code){
            errorMessage.current = "No Code"
            return
        }
        const gameInfo = GameMap.get(gameId)
        const clientName = globalContextObject.token.Username
        let p1Name = ""
        let p2Name = ""
        if (gameMode == 0){
            p1Name = clientName
            p2Name = gameInfo.getAiName(difficulty)
        } else if (gameMode == 1)
        {
            p1Name = clientName
            p2Name = "Player 2"
        }
        

        contextObj.gameId = gameId
        contextObj.game = gameInfo.getNew(p1Name, p2Name)
        contextObj.game.chat = contextObj.chat
        contextObj.game.mode = gameMode
        contextObj.game.refresh = reload
        if (gameMode == 0){
            const ai = gameInfo.getAI(contextObj.game, difficulty)
            contextObj.game.addPlayerTurnEventHandler(ai.chooseBestOption, ai)
            contextObj.game.addGameStartEventHandler(ai.onGameStart, ai)
        }
        contextObj.gameName = gameInfo.name
        contextObj.createComponent = gameInfo.getComponent
        contextObj.mode = gameMode
        contextObj.forceReload = reload

        if (gameMode == 0 || gameMode == 1){
            contextObj.game.player1.isClient = (gameMode == 1 || p1Name == clientName)
            contextObj.game.player2.isClient = (gameMode == 1 || p2Name == clientName)
            contextObj.game.start()  
        }
        if (gameMode == 2){
            GameSocket.SetGame(contextObj.game)
            GameSocket.setGlobalContext(globalContextObject)
            GameSocket.setGameId(gameId)
            GameSocket.CreateConnection(code)
        }
    },[])

    
    

    const restartClick = () =>{
        contextObj.game.requestRestart()
    }

    const historyClick = () =>{
        if (!contextObj.game.canSaveGame()) return
        const historyDto = {
            gameId,
            oppName: contextObj.game.getClient() == contextObj.game.player1 ? contextObj.game.player2.name : contextObj.game.player1.name,
            sequence: contextObj.game.history,
            ownerIsPlayerOne: contextObj.game.getClient() == contextObj.game.player1,
            playerOneStarted: contextObj.game.startingPlayer == contextObj.game.player1
        }
        globalContextObject.addPopup(new PopupProp("history-popup", (<HistoryPopup historyDto={historyDto}/>)))
    }

    const leaveGameClick = () =>{
        if (GameSocket.isOpen()){
            GameSocket.sendMessage("PlayerLeave", {})
        }
    }

    const toggleClick = () =>{
      setShowSidebar(prev => !prev)
    }

    const showRightToggle = !showSidebar

    const showLeftToggle = showSidebar

    useEffect(() =>{
      if (window.innerWidth <= 800)
        setShowSidebar(false)
    }, [])

  return (
    <GameContext.Provider value={contextObj}>
        {contextObj.gameId && <div id="game-division">
            <div id="game-sidebar" style={{display: showSidebar ? undefined : 'none'}}>
                <div id="game-sidebar-fixed" style={{display: showSidebar ? undefined : 'none'}}>
                    <div id="sidebar-top">
                        <div className='toggler-container' style={{display: showLeftToggle ? undefined : 'none'}}>
                          <i class="fa-solid fa-bars" style={{fontSize: '30px', cursor: 'pointer'}} onClick={toggleClick}></i>
                        </div>
                        
                        <div className="sidebar-centered-section">
                            <h1 style={{padding: "20px", fontSize: "35px"}}>{contextObj.gameName}</h1>
                            <div id="score-info">
                                <PlayerNameAndScore player={contextObj.game.player1} score={contextObj.game.uiProxy.player1Score}/>
                                <PlayerNameAndScore player={contextObj.game.player2} score={contextObj.game.uiProxy.player2Score}/>
                                <div className="game-info">
                                    <div className="game-info-item">
                                        <div className="game-info-left">
                                            <p>Draw</p>
                                        </div>
                                        <div className="game-info-right">
                                            <p>{contextObj.game.uiProxy.totalGames - contextObj.game.uiProxy.player1Score - contextObj.game.uiProxy.player2Score}</p>
                                        </div>  
                                    </div>
                                </div>
                                <div className="game-info">
                                    <div className="game-info-item">
                                        <div className="game-info-left">
                                            <p>Total Games</p>
                                        </div>
                                        <div className="game-info-right">
                                            <p>{contextObj.game.uiProxy.totalGames}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="restart-button" title={(contextObj.game.canRequestReplay() && contextObj.game.mode == 2 ? "Vote Replay" : null)} className={`sidebar-button simple-center${contextObj.game.canRequestReplay() ? "" : " button-locked"}`} onClick={restartClick}>Replay</div>
                            {
                                gameMode == 2 &&
                                <>
                                    <h1 style={{fontSize: "23px"}}>Code</h1>
                                    <p style={{color: "gold", cursor: "pointer", fontSize: "24px"}} title="Copy" onClick={() => {navigator.clipboard.writeText("#" + code.toUpperCase())}}>#{code.toUpperCase()}</p>
                                </>
                            }    
                        </div>    
                    </div>
                    <div id="sidebar-bottom">
                        <div className="sidebar-centered-section">
                            <div id="history-button" className={`sidebar-button simple-center${contextObj.game.canSaveGame() ? "" : " button-locked"}`} onClick={historyClick}>Save Game</div>
                            <Link to={`/games/g/${gameId}`} className="sidebar-button simple-center" reloadDocument={true} onClick={leaveGameClick}>Leave Game</Link>
                        </div>
                    </div>  
                </div>
            </div>
            <div id="game-action-area">
                <div className='sidebar-toggler' onClick={toggleClick} style={{display: showRightToggle ? undefined : 'none'}}>
                  <i class="fa-solid fa-bars" style={{fontSize: '30px', cursor: 'pointer'}}></i>
                </div>
                <div id="game-inner-content">
                    <div id="game-state-header" className="simple-center">
                        <h1 style={{fontSize: "27px", textAlign: "center"}}>{contextObj.game.uiProxy.getStateText()}</h1>
                    </div>
                    <HubGame/>
                </div>
            </div>
            <div id="game-chat-area">
                <GameChat /> 
            </div>
        </div>}
        {!contextObj.gameId && <div id="gamehub-error" className="simple-center">
            <h1>404 Not Found{/*errorMessage.current*/}</h1>
            <h2 style={{fontSize: "22px", color: "#666"}}>One or more elements in the url are invalid</h2>
            <Link to="/games" style={{fontSize: "22px"}}>Go back to Games</Link>
        </div>}
    </GameContext.Provider>
  )
}

export default Play