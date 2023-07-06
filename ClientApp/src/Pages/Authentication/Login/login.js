import React, {useState, useContext, useMemo} from 'react'
import {Link} from "react-router-dom"
import { BoringForm } from '../../../components/Form/BoringForm/BoringForm'
import { InputCollection, PasswordInputProp, TextInputProp } from '../../../components/Props/Form/Inputs'
import { GlobalContext } from '../../../App'
import useReload from '../../../customhooks/useReload'

function getInputs(onUpdated){
  let collection = new InputCollection("login_inputs")
  collection.title = "Login"
  collection.submitText = "Login"

  let usernameInput = new TextInputProp("login_username")
  usernameInput.value = ""
  usernameInput.title = "Username"
  usernameInput.shouldFocus = true
  usernameInput.onValueUpdated.push(onUpdated)
  usernameInput.validation = (errors) =>{
    usernameInput.value = usernameInput.value.replace(/\s*$/, "")
    let value = usernameInput.value
    if (value == ""){
      errors.push({msg: "Enter your username", code: "username_null"})
    }
  }

  let passwordInput = new PasswordInputProp("login_password")
  passwordInput.value = ""
  passwordInput.title = "Password"
  passwordInput.onValueUpdated.push(onUpdated)
  passwordInput.validation = (errors) =>{
    if (passwordInput.value == "")
      errors.push({msg: "Enter your password", code: "password_null"})
  }

  collection.addInputs(usernameInput, passwordInput)
  return collection
}

const Login = () => {
  const reload = useReload()
  const inputOnChange = function(input){
    reload()
  }
  useMemo(() =>{
    document.cookie = "gameshub_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, [])

  const [inputCollection, setInputCollection] = useState(getInputs(inputOnChange))

  const globalContextObject = useContext(GlobalContext)

  inputCollection.onSubmit = () =>{
    if (!inputCollection.canSubmit) return

    let userDto = {
      username: inputCollection.inputs[0].value,
      password: inputCollection.inputs[1].value,
      returnClientErrors: false
    }
    if (!inputCollection.populateErrors()){
      let status = 0
      inputCollection.canSubmit = false
      let headers = new Headers()
      headers.append("Content-Type", "application/json")
      fetch(`${globalContextObject.url}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify(userDto),
        credentials: "include",
        headers,
        mode: "cors"
      }).then(response =>{
        status = response.status
        return response.json()
      }).then(data =>{
        if (status >= 400){
          inputCollection.addServerErrors(data.errorCollection.collection)
        } else {
          window.location.href = "/games"
        }
      }).catch(reason =>{
        //console.log(reason)
      }).finally(() =>{
        inputCollection.canSubmit = true
        reload()
      })
    }
    reload()
  }

  inputCollection.inputs[1].onEnter = inputCollection.onSubmit

  const guestLoginClick = () =>{
    let status = 0;
    let headers = new Headers()
    headers.append("Content-Type", "application/json")
    fetch(`${globalContextObject.url}/api/auth/guest-login`, {
      method: "POST",
      credentials: "include",
      headers,
      mode: "cors",
      body: ""
    }).then(response =>{
      status = response.status
      return response.json()
    }).then(data =>{
      if (status >= 400){
        inputCollection.addServerErrors(data.errorCollection.collection)
      } else 
        window.location.href = "/games"
    }).catch(reason =>{
      //console.log(reason)
    }).finally(() =>{
      reload()
    })
  }

  return (
    <div id="auth-page" className="simple-center chalk-background">
      <div id="auth-section">
        <BoringForm inputCollection={inputCollection}/>
        <div className="register-text-container simple-center">
          <Link to="/Register">
            Register an account
          </Link>
        </div>
        <div className="form-button simple-center" style={{marginTop: "0px"}} onClick={guestLoginClick}>Guest Login</div>
      </div>
    </div>
  )
}

export default Login