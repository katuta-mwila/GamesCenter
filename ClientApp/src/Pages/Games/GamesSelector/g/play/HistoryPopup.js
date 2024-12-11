import React, {useState, useContext} from 'react'
import { BoringForm } from '../../../../../components/Form/BoringForm/BoringForm'
import { InputCollection, TextInputProp } from '../../../../../components/Props/Form/Inputs'
import useReload from '../../../../../customhooks/useReload'
import { GlobalContext } from '../../../../../App'
import { Link } from 'react-router-dom'

function getInputs(onUpdated, historyDto){
  
  let collection = new InputCollection("save_game_collection")
  collection.title = "Save game as"
  collection.submitText = "Save"

  let nameInput = new TextInputProp("savegame_name")
  nameInput.value = ""
  nameInput.shouldFocus = true
  nameInput.onValueUpdated.push(onUpdated)
  nameInput.validation = (errors) =>{
    nameInput.value = nameInput.getFormatedValue()
    if (nameInput.value.length < 1 || nameInput.value.length > 32){
      errors.push({msg: "Name must be between 1 and 32 characters", code: "savagame_incorrect_length"})
    }
  }

  collection.globalValidation = (errors) =>{
    if (historyDto.sequence.length == 0){
      errors.push({msg: "Game history is invalid, try again after the game is finished", code: "global_invalid_history"})
    }
  }
  
  collection.addInputs(nameInput)
  return collection
}

const HistoryPopup = ({historyDto}) => {
    const reload = useReload()
    const [inputCollection, setInputCollection] = useState(getInputs(reload, historyDto))
    const [formCompleted, setFormCompleted] = useState(false)
    const globalContextObject = useContext(GlobalContext)
    inputCollection.onSubmit = () =>{
      if (!inputCollection.canSubmit) return
      historyDto.name = inputCollection.inputs[0].value
      const headers = new Headers()
      headers.append("Content-Type", "application/json")
      if (!inputCollection.populateErrors()){
        let status = 0
        inputCollection.canSubmit = false
        fetch(`${globalContextObject.url}/api/game/autha/add-history`, {
          method: "POST",
          body: JSON.stringify(historyDto),
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
          {
            setFormCompleted(true)
          }
        }).catch(reason =>{
          inputCollection.errorCollection.addError("global", "No connection", "global_no_connection")
        }).finally(() =>{
          inputCollection.canSubmit = true
          reload()  
        })
      }
      reload()
    }

  return (
    <div id="history-popup" className='simple-center generic-popup popup-shadow'>
        {!formCompleted && <BoringForm inputCollection={inputCollection}/>}
        {formCompleted && <p style={{marginBottom: "0", textAlign: "center"}}>Successfully saved game "{inputCollection.inputs[0].value}" into <Link onClick={() => {globalContextObject.closePopups()}} to={`/games/g/${historyDto.gameId}/history`}>History</Link></p>}
    </div>
  )
}

export default HistoryPopup