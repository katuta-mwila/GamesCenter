import React from 'react'

const ValidationList = ({validationMessages, allignment}) => {
  return (
    <>{validationMessages.length > 0 && <div className="validation-list">
        {validationMessages.map((reason, i) =>{
            return (
              <p key={reason.code} className="validation-message" style={{fontSize: "14px", color: "#ff0000", margin: 0, textAlign: allignment}}>{reason.msg}</p>   
            )
        })}
    </div>}</>
  )
}

ValidationList.defaultProps = {
  allignment: "left"
}

export default ValidationList