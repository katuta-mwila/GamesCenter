import React, {Suspense} from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header/Header'

export const Layout = () => {
  return (
    <div>
        <Header />
        <div id="main-body">
           <Suspense>
            <Outlet/>
          </Suspense>
           
        </div>
    </div>
  )
}
