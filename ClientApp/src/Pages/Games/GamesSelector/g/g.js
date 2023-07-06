import React, {useContext, useState} from 'react'
import { GameMap } from './GameInfo'
import { useParams } from 'react-router-dom'
import GameMenu from './GameMenu'
import useReload from '../../../../customhooks/useReload'
import { MenuBuilder } from './MenuBuilder'
import GameSocket from '../../../../components/Props/Game/NetCode/GameSocket'
import { GlobalContext } from '../../../../App'
import NotFound from '../../../NotFound/NotFound'

function BuildMenu(gameId, reloader, globalContextObject){
    const builder = new MenuBuilder()
    builder.addMenuCollection("main")
    const singlePlayerButton = builder.addMenuButton("main", null, "Singleplayer")
    builder.addMenuButton("main", `/games/g/${gameId}/play?p=1`, "Two Player")
    const onlineButtonClick = builder.addMenuButton("main", null, "Online")
    //builder.addMenuButton("main", `/games/g/${gameId}/history`, "History")
    builder.addMenuButton("main", "/games", "Back")
    /*builder.addMenuButton("main", null, "Socket Testing", () =>{
        GameSocket.CreateConnection()
    })*/
    builder.setSelectedMenuId("main")
    singlePlayerButton.onClick = () =>{
        builder.setSelectedMenuId("difficulty")
        reloader()
    }
    onlineButtonClick.onClick = () =>{
        builder.setSelectedMenuId("onlinemenu")
        reloader()
    }

    builder.addMenuCollection("difficulty", "Select Difficulty")
    builder.addMenuButton("difficulty", `/games/g/${gameId}/play?p=0&d=0`, "Easy")
    builder.addMenuButton("difficulty", `/games/g/${gameId}/play?p=0&d=1`, "Medium")
    builder.addMenuButton("difficulty", `/games/g/${gameId}/play?p=0&d=2`, "Impossible")
    builder.addMenuButton("difficulty", null, "Back", () =>{
        builder.setSelectedMenuId("main")
        reloader()
    })

    builder.addMenuCollection("onlinemenu")
    const createGameButton = builder.addMenuButton("onlinemenu", null, "Create Game")
    const joinGameButton = builder.addMenuButton("onlinemenu", null, "Join Game")
    builder.addMenuButton("onlinemenu", null, "Back", () =>{
        builder.setSelectedMenuId("main")
        reloader()
    })
    createGameButton.onClick = () =>{
        let status = 0
        fetch(`${globalContextObject.url}/api/game/authb/create-game/${gameId}`, {
            method: "GET",
            credentials: "include",
            mode: "cors"
        }).then(response =>{
            status = response.status
            return response.json()
        }).then(data =>{
            if (status >= 400){
                return
            }
            window.location.href = `/games/g/${gameId}/play?p=2&c=${data.gameCode}`
        }).catch(reason =>{
            //console.log(reason)
        }).finally(() =>{

        })
    }
    joinGameButton.onClick = () =>{
        builder.setSelectedMenuId("online_joingame")
        reloader()
    }

    const joinGameMenu = builder.addMenuCollection("online_joingame", "Enter game code")
    const codeInput = builder.addMenuTextInput("online_joingame", "code-input")
    //codeInput.value = "ABC123"
    codeInput.focused = true
    codeInput.onValueUpdated.push(reloader)
    codeInput.placeholder = "e.g #abc123"
    codeInput.maxLength = 7
    codeInput.style.color = "white"
    codeInput.style.border = "2px solid black"
    const joinButton = builder.addMenuButton("online_joingame", null, "Join")
    let canSubmit = true
    const joinGameClick = () =>{
        if (!canSubmit) return
        let status = 0
        let value = codeInput.value
        if (value[0] == "#")
            value = value.substring(1)
        if (!joinGameMenu.populateErrors()){
            canSubmit = false
            fetch(`${globalContextObject.url}/api/game/authb/join-game/${gameId}/${value}`, {
            method: "GET",
            credentials: "include",
            mode: "cors"
            }).then(response =>{
                status = response.status
                return response.json()
            }).then(data =>{
                if (status >= 400){
                    joinGameMenu.addServerErrors(data.errorCollection.collection)
                    reloader()
                } else
                    window.location.href = `/games/g/${gameId}/play?p=2&c=${value}`
            }).catch(reason =>{
                //console.log(reason)
            }).finally(() =>{
                canSubmit = true
                
            })
        }
        
    }
    joinButton.onClick = joinGameClick
    codeInput.onEnter = joinGameClick

    builder.addMenuButton("online_joingame", null, "Back", () =>{
        builder.setSelectedMenuId("onlinemenu")
        reloader()
    })

    return builder
}

const G = () => {
    const {game: gameId} = useParams()
    const globalContextObject = useContext(GlobalContext)
    const reload = useReload()
    const [menuBuilder, setMenuBuilder] = useState(BuildMenu(gameId, reload, globalContextObject))
    const gameInfo = GameMap.get(gameId)
    const is404 = gameInfo == null
  return (
    <>
    {!is404 && <div id="GContainer" className="chalk-background">
        <div id="sec1">
            <h1 style={{fontSize: "80px", color: "white", fontWeight: "600", textAlign: "center"}}>{gameInfo.name}</h1>
        </div>
        <div id="sec2" className="simple-center">
            <GameMenu menuCollection={menuBuilder.getSelectedMenu()}/>
        </div>
        <div id="sec3">

        </div>
    </div>}
    {is404 && <NotFound msg={"Game does not exist"}/>}
    </>
  )
}

export default G