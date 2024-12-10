import React from 'react'

const MenuPage = ({children, ...others}) => {
  return (
    <div className='menu-page simple-center chalk-background'>
      {children}
    </div>
  )
}

export default MenuPage