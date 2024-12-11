import React, { useContext, useState } from 'react'
import { Outlet } from 'react-router-dom'
import MenuPage from '../../components/Layout/MenuPage'
import ContentContainer from '../../components/ContentContainer'
import { UserData } from '../../UserData'
import Helper from '../../util/Helper'
import { GlobalContext } from '../../App'

const Home = () => {
  const [value, setValue] = useState('')
  const gco = useContext(GlobalContext)

  const enterName = () =>{
    if (Helper.formatText(value).length < 1) return
    let status = 0
    let headers = new Headers()
    headers.append("Content-Type", "application/json")
    fetch(`${gco.url}/api/auth/guest-login`, {
      method: 'POST',
      body: JSON.stringify({username: Helper.formatText(value)}),
      credentials: 'include',
      headers,
      mode: 'cors'
    }).then(response =>{
      status = response.status
      return response.json()
    }).then(data =>{
      if (status >= 400)
        return
      window.location.href = '/games'
    })
    
  }

  const continueClick = () =>{
    enterName()
  }

  const keyDown = e =>{
    if (e.key === 'Enter'){
      enterName()
    }
  }

  return (
    <MenuPage>
      <ContentContainer gap='15px' className='menu-home menu-content'>
        <h1 className='ca'>Enter a Display Name</h1>
        <input className='menu-input ca' value={value} maxLength={20} onChange={e => setValue(e.target.value)} onKeyDown={keyDown}/>
        <div className='menu-button' onClick={continueClick}>
          <text>Continue</text>
        </div>
      </ContentContainer>
    </MenuPage>
  )
}

export default Home