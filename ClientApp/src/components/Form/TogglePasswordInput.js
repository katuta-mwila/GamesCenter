import React, {useState, useEffect, useRef} from 'react'
import { v4 as uuidv4 } from 'uuid';

const TogglePasswordInput = ({placeholder, textInputProp}) => {
    const [eyeToggle, setEyeToggle] = useState(false);
    const [inputSelectionPosition, setInputSelectionPosition] = useState(0)
    const hasMountedOnce = useRef(false)

    const eye = { // details based on eye toggle
        true: {eyeClass: "fa-solid fa-eye", inputType: "text"},
        false: {eyeClass: "fa-sharp fa-solid fa-eye-slash", inputType: "password"}
    }

    useEffect(() =>{
        if (hasMountedOnce.current === true){
            const pInput = document.getElementById(textInputProp.id)
            pInput.focus()
            pInput.setSelectionRange(pInput.value.length, pInput.value.length)
        } else{
            hasMountedOnce.current = true
        }
    }, [eyeToggle])

    const handleTogglerClick = () =>{ //toggle eye state when eye container clicked
        
        setEyeToggle(!eyeToggle)
        const pInput = document.getElementById(textInputProp.id)
        setInputSelectionPosition(pInput.value.length)
    }

    const keyDown = e =>{
        if (e.key == "Enter")
            textInputProp.onEnter()
    }
  return (
    <div id={`tpc_${textInputProp.id}`} className={"toggle-password-container login-password-container"}>
        <input type={eye[eyeToggle].inputType} placeholder={placeholder} name={textInputProp.id} id={textInputProp.id} className="form-text-input toggle-password-input" onKeyDown={keyDown} onChange={textInputProp.onChange.bind(textInputProp)} value={textInputProp.value}/>
        <div className={"toggle-password-toggler simple-center"} onClick={handleTogglerClick} title={`${!eyeToggle ? "Show Password" : "Hide Password"}`}>
            <i className={eye[eyeToggle].eyeClass + " simple-center toggle-password-eye"} style={{maxWidth: 0}}></i>
        </div>
    </div>
  )
}

TogglePasswordInput.defaultProps = {
    inputId: `TogglePasswordInput_${uuidv4()}`,
    onEnter: () => {}
}


export default TogglePasswordInput