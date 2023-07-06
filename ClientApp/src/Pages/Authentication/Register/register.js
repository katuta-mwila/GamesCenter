import React, {useState, useContext} from 'react'
import {Link} from 'react-router-dom'
import { GlobalContext } from '../../../App'
import { BoringForm } from '../../../components/Form/BoringForm/BoringForm'
import { InputCollection, PasswordInputProp, TextInputProp } from '../../../components/Props/Form/Inputs'
import useReload from '../../../customhooks/useReload'

function getInputs(onUpdated){
  let collection = new InputCollection("register_inputs")
  //collection.errorCollection.addError("global", "No Connection lol", "nc")
 // collection.errorCollection.addError("global", "Username or password is incorrect", "lmao")
  collection.title = "Register"
  collection.submitText = "Register"
  let usernameInput = new TextInputProp("login_username")
  usernameInput.value = ""
  usernameInput.title = "Username"
  usernameInput.shouldFocus = true
  usernameInput.onValueUpdated.push(onUpdated)
  usernameInput.validation = (errors) =>{
    usernameInput.value = usernameInput.value.replace(/\s*$/, "")
    let value = usernameInput.value
    let regex = new RegExp("^[a-zA-Z0-9_]+$")
    if (value.length < 2 || value.length > 32){
      errors.push({msg: "Username must be between 2 and 32 characters", code: "username_incorrect_length"})
      return
    }
    if (!regex.test(value))
      errors.push({msg: "Username must only contain alphanumeric characters, underscore, or hyphen", code: "username_format_mismatch"})
  }

  let passwordInput = new PasswordInputProp("login_password")
  passwordInput.value = ""
  passwordInput.title = "Password"
  passwordInput.onValueUpdated.push(onUpdated)
  passwordInput.validation = (errors) =>{
    let regex = new RegExp("^[\\x00-\\x7F]+$")
    let value = passwordInput.value
    if (value.length < 8 || value.length > 32){
      errors.push({msg: "Password must be between 8 and 32 characters", code: "password_incorrect_length"})
      return
    }
    if (!regex.test(value))
      errors.push({msg: "Password contains invalid characters", code: "password_format_mismatch"})
  }

  let confirmPasswordInput = new PasswordInputProp("login_confirm_password")
  confirmPasswordInput.value = ""
  confirmPasswordInput.title = "Confirm Password"
  confirmPasswordInput.onValueUpdated.push(onUpdated)
  confirmPasswordInput.validation = (errors) =>{
    let value = confirmPasswordInput.value
    if (value.replace(/\s*$/, "") !== passwordInput.value.replace(/\s*$/, ""))
      errors.push({msg: "Password does not match", code: "password_nomatch"})
  }

  collection.addInputs(usernameInput, passwordInput, confirmPasswordInput)
  return collection
}

const Register = () => {
  const reload = useReload()
  const inputOnChange = function(input){
    reload()
  }
  const [inputCollection, setInputCollection] = useState(getInputs(inputOnChange))
  const globalContextObject = useContext(GlobalContext)
  inputCollection.onSubmit = () =>{
    if (!inputCollection.canSubmit) return

    let userDto = {
      username: inputCollection.inputs[0].value,
      password: inputCollection.inputs[1].value
    }
    let headers = new Headers()
    headers.append("Content-Type", "application/json")
    if (!inputCollection.populateErrors()){
      let status = 0
      inputCollection.canSubmit =  false
      fetch(`${globalContextObject.url}/api/auth/register`, {
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
        } else
          window.location.href = "/login"
      }).catch(reason =>{
        //console.log("No connection dog")
      }).finally(() =>{
        inputCollection.canSubmit = true
        reload()  
      })
    } 
    reload()
  }
  return (
    <div id="auth-page" className="simple-center chalk-background">
        <div id="auth-section">
          <BoringForm inputCollection={inputCollection}/>
            <div className='register-text-container simple-center'>
                <Link to="/login" style={{textAlign: "center"}}>Already have an account or login as guest?</Link>
            </div>
        </div>
    </div>

  )
}

export default Register