import React from 'react'
import { Link } from 'react-router-dom';

export class GamePopupProp{
    id;
    message = "";
    messageColor = "#000"
    buttons = [];
    constructor(_id){
        this.id = _id
    }
}

export class GamePopupButton{
    id;
    title;
    url;
    onClick  = () => {};
    constructor(_id){
        this.id = _id
    }
}

export const GamePopup = ({gamePopupProp}) => {
  return (
    <div className="game-popup" id={`${gamePopupProp.id}`}>
        <div style={{color: gamePopupProp.messageColor}} className="message-area simple-center">
            {gamePopupProp.message}
        </div>
        <div className='buttons-section'>
            {gamePopupProp.buttons.map((button, i) =>{
                return (
                    <>
                        {button.url && 
                            <Link to={button.url} className="game-popup-nav-link" reloadDocument={true}>
                                <div id={button.id} className="game-popup-button simple-center" onClick={button.onClick}>{button.title}</div>
                            </Link>
                        }
                        {!button.url && 
                            <div id={button.id} className="game-popup-button simple-center" onClick={button.onClick}>{button.title}</div>
                        }
                    </>
                )
            })}
        </div>
    </div>
  )
}