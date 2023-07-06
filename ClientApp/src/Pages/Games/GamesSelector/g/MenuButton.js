import React from 'react'
import { Link } from 'react-router-dom'

const MenuButton = ({link, title, onClick}) => {
  return (
    <>
    {link != null && <Link to={link} reloadDocument={true} className="menu-item menu-button simple-center">
        <text style={{fontSize: "21px"}}>{title}</text>
    </Link>}
    {link == null && <div className="not-a-link menu-item simple-center menu-button" onClick={onClick}>
        <text style={{fontSize: "21px"}}>{title}</text>
      </div>}
    </>
  )
}

export default MenuButton