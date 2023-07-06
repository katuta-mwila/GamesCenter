import React, {useState, useContext, useRef, useEffect, useMemo} from 'react'
import { Chat, ChatItem } from '../Props/Game/Chat/Chat'
import useReload from '../../customhooks/useReload'
import infoIcon from "../../assets/info.png"
import { GlobalContext } from '../../App'
import { GameContext } from '../../Pages/Games/GamesSelector/g/play/play'
import GameSocket from '../Props/Game/NetCode/GameSocket'

const GameChat = () => {
    const globalContextObject = useContext(GlobalContext)
    const gameContextObject = useContext(GameContext)
    const refreshId = useRef("abc")
    const reload = useReload((newId) =>{
        refreshId.current = newId
    }) 
    useMemo(() =>{
        gameContextObject.chat.reloader = reload
    }, [])
    useEffect(() =>{
        const chatBox = document.getElementById("chat-box")
        chatBox.scrollTop = chatBox.scrollHeight
    }, [refreshId.current])
    const chat = gameContextObject.chat
    const inputRef = useRef()
    const inputKeyDown = e =>{
        if (e.key != "Enter") return
        const msg = inputRef.current.value.substring(0, 200)
        inputRef.current.value = ""
        if (GameSocket.isOpen()){
            GameSocket.sendMessage("PlayerChat", {msg})
            console.log("yeahhhh")
        } else
            chat.addItem(globalContextObject.token.Username, msg, "black", "black"); 
    }
    return (
    <>
        <div id="chat-box" className='thin-scrollbar'>
            {chat.chatItems.map((chatItem, i) =>{
                const title = chatItem.title == "[i]" ? (<img src={infoIcon} align="middle" style={{height: "18px"}}/>) :
                    (<span style={{color: chatItem.titleColor}} className="chat-item-title">{chatItem.title}</span>)
                return (
                    <div key={i} className="chat-item">
                        <text style={{color: chatItem.textColor}}>{title} {chatItem.text}</text>
                    </div>
                )
            })}
        </div>
        <div id="chat-input-container">
            <input ref={inputRef} onKeyDown={inputKeyDown} maxLength={200} placeholder="Press enter to chat"/>
        </div>
    </>
    )
}

export default GameChat