import React, { Component, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import GlobalContextObject from './GlobalContextObject';
import { Layout } from './components/Layout/Layout';
import './custom.css';
import RefinedPopupManager from './components/Layout/RefinedPopupManager';
//import Home from "./Pages/Home/Home"

export const GlobalContext = React.createContext()

const Home = lazy(() => import("./Pages/Home/Home.js"))
const Login = lazy(()=> import("./Pages/Authentication/Login/login.js"))
const Register = lazy(() => import("./Pages/Authentication/Register/register.js"))
const NotFound = lazy(() => import("./Pages/NotFound/NotFound.js"))
const GamesSelector = lazy(() => import("./Pages/Games/GamesSelector/GamesSelector.js"))
const G = lazy(() => import("./Pages/Games/GamesSelector/g/g.js"))
const Play = lazy(() => import("./Pages/Games/GamesSelector/g/play/play.js"))

export default function App() {
    const globalContextObject = new GlobalContextObject()
    return (
      <GlobalContext.Provider value={globalContextObject}>
        <RefinedPopupManager externalAccessor={globalContextObject}/>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/">
              <Route index element={<Home/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/games" >
                <Route index element={<GamesSelector/>}/>
                <Route path="/games/g/:game">
                  <Route index element={<G/>}/>
                  <Route path="play" element={<Play/>}/>
                </Route>
              </Route>
              <Route path="down" element={<NotFound title={"Error"} msg={"Internal systems are down"}/>}/>
              <Route path="*" element={<NotFound/>}/>
            </Route>
          </Route>
        </Routes>
      </GlobalContext.Provider>
      )
}

function Test()
{
  return (<div>Hello</div>)
}

function wait(time){
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}