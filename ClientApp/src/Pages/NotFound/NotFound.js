import React from 'react'

const NotFound = ({msg, title}) => {
  return (
    <div className="simple-center" style={{flexDirection: "column", flex: "1 1 0", background: "radial-gradient(circle, rgb(252, 252, 252) 15%, rgb(196, 196, 196) 100%)"}}>
      <h1 style={{color: "black"}}>{title}</h1>
      <h2 style={{fontSize: "22px", color: "#666"}}>{msg}</h2>
    </div> 
  )
}

NotFound.defaultProps = {
  title: "404 Not Found",
  msg: "The url is not valid"
}

export default NotFound