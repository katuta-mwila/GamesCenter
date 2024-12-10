import React, {useContext} from 'react'
import { GlobalContext } from '../../../App'
import { useLocation } from 'react-router-dom'
import { UserData } from '../../../UserData'

const loginBlacklist = ["/login", "/register"]
const logoutBlacklist = ["/login", "/register"]

const Header = () => {
  const location = useLocation()
  const globalContextObject = useContext(GlobalContext)
  const token = globalContextObject.token
  const showLogout = token != null && token.Username.substring(0, 5) != "guest" && !logoutBlacklist.some(path => location.pathname.toLocaleLowerCase() == path)
  const showLogin = !showLogout && !loginBlacklist.some(path => location.pathname.toLocaleLowerCase() == path)
  const showName = !loginBlacklist.some(path => location.pathname.toLocaleLowerCase() == path)
  const logoutClick = function(){
    document.cookie = "gameshub_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login"
  }

  const loginClick = function(){
    window.location.href = "/login"
  }
  return (
    <div id="main-header">
        <div id="main-header-left" className="main-header-section">

        </div>
        <div id="main-header-center" className="main-header-section">
            <h1 style={{width: "max-content", color: "white", marginBottom: "0"}}>Games Center</h1>
        </div>
        <div id="main-header-right" className='main-header-section'>
        <div className="header-right-settings-section">
          <div className="header-username">{globalContextObject.token.Username}</div>
          {/*showLogout && <div className='header-logout-button' onClick={(logoutClick)}>Logout</div>*/}
          {/*showLogin && <div className='header-logout-button' onClick={(loginClick)}>Login</div>*/}
          
        </div>
        </div>
    </div>
  )
}

export default Header