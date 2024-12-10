import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import MenuPage from '../../components/Layout/MenuPage'
import ContentContainer from '../../components/ContentContainer'
import { UserData } from '../../UserData'
import Helper from '../../util/Helper'

const Home = () => {
  const [value, setValue] = useState('')

  const enterName = () =>{
    if (Helper.formatText(value).length < 1) return
    UserData.setName(value)
    window.location.href = '/games'
  }

  const continueClick = () =>{
    enterName()
  }

  const keyDown = e =>{
    console.log(e)
    if (e.key === 'Enter'){
      enterName()
    }
  }

  return (
    <MenuPage>
      <ContentContainer gap='15px' className='menu-home menu-content'>
        <h1 className='ca'>Enter Username</h1>
        <input className='menu-input ca' value={value} onChange={e => setValue(e.target.value)} onKeyDown={keyDown}/>
        <div className='menu-button' onClick={continueClick}>
          <text>Continue</text>
        </div>
      </ContentContainer>
    </MenuPage>
  )
}

export default Home