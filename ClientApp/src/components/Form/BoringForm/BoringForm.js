import React, {useEffect} from 'react'
import TextInputComponent from '../TextInputComponent'
import TogglePasswordInput from '../TogglePasswordInput'
import ValidationList from '../ValidationList'

export const BoringForm = ({inputCollection, submitText, onSubmit}) => {

    useEffect(() =>{
        for (let i = 0; i < inputCollection.inputs.length; i++){
            if (!inputCollection.inputs[i].shouldFocus) continue
            document.getElementById(inputCollection.inputs[i].id).select()
        }
    }, [])

  return (
    <div id={inputCollection.id} className='boring-form'>
        <h1 className="simple-center boring-form-title" style={{fontSize: 24, padding: 0, overflowWrap: "anywhere"}}>{inputCollection.title}</h1>
        <ValidationList validationMessages={inputCollection.errorCollection.getErrors("global")} allignment="center"/>
        {inputCollection.inputs.map((input, i) =>{
            return (
                <div className='boring-form-input-section' key={input.id}>
                    {input.title && <label className='boring-form-label' htmlFor={input.id}>{input.title}</label>}
                    {[...Array(1)].map((x, k) =>{
                        switch(input.type){
                            case "text":
                                return (<TextInputComponent key={input.id} textInputProp={input}/>)
                            case "password":
                                return (<TogglePasswordInput key={input.id} textInputProp={input}/>)
                        }
                    })}
                    <ValidationList validationMessages={inputCollection.errorCollection.getErrors(input.id)}/>
                </div>
            )
        })}
        <div className="form-button simple-center" style={{marginTop: "5px"}} onClick={inputCollection.onSubmit}>{inputCollection.submitText}</div>
    </div>
  )
}
