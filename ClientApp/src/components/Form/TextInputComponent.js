import React from 'react'

const TextInputComponent = ({textInputProp}) => {
  const onEnter = (e) =>{
    if (e.key != "Enter") return
    textInputProp.onEnter()
  }
  return (
    <input id={textInputProp.id} onChange={textInputProp.onChange.bind(textInputProp)} className="form-text-input" value={textInputProp.value} onKeyDown={onEnter}/>
  )
}

export default TextInputComponent