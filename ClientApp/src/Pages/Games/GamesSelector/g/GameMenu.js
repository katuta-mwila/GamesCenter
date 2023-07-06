import React, {useEffect, useState} from 'react'
import MenuButton from './MenuButton'
import ValidationList from '../../../../components/Form/ValidationList'

const GameMenu = ({menuCollection}) => {
  useEffect(() =>{
    for (let i = 0; i < menuCollection.items.length; i++){
        if (!menuCollection.items[i].focused) continue
        {
          document.getElementById(menuCollection.items[i].id).select()
        }
        
    }
    }, [menuCollection.id])

    function keyPressed(key, menuItem){
      if (key == "Enter")
        menuItem.onEnter()
    }
  return (
    <div id="g-menu-section" className="simple-center">
        {menuCollection.title != null && <h1 style={{fontSize: "37px"}}>{menuCollection.title}</h1>}
        <ValidationList validationMessages={menuCollection.errorCollection.getErrors("global")} allignment="center"/>
        {menuCollection.items.map((menuItem, i) =>{
            return (
              <>
              {menuItem.errorTop && <ValidationList validationMessages={menuCollection.errorCollection.getErrors(menuItem.id)} allignment={menuCollection.errorAlignment}/>}
              {[...Array(1)].map((x, k) =>{
              switch(menuItem.type){
                case "button":
                  return (<MenuButton key={menuItem.id} link={menuItem.link} title={menuItem.title} onClick={menuItem.onClick}/>)
                case "textinput":
                  return (<input key={menuItem.id} id={menuItem.id} onChange={menuItem.onChange.bind(menuItem)} style={menuItem.style} value={menuItem.value}
                  placeholder={menuItem.placeholder} maxLength={menuItem.maxLength} onKeyDown={(e) => {keyPressed(e.key, menuItem)}}/>)
              }})}
              {!menuItem.errorTop && <ValidationList validationMessages={menuCollection.errorCollection.getErrors(menuItem.id)} allignment={menuCollection.errorAlignment}/>}
            </>)
        })}
    </div>
  )
}

export default GameMenu