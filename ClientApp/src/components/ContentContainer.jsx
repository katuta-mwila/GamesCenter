import React from 'react'

const ContentContainer = ({children, className, gap, rowGap, columnGap, flexDirection,style,  ...others}) => {
    if (rowGap == null || columnGap == null){
      rowGap = gap
      columnGap = gap
    }
  return (
    <div className={"content-container" + (className == null ? "" : " " + className)} style={{display: "flex", flexDirection, rowGap, columnGap, ...style}} {...others}>
        {children}
    </div>
  )
}

ContentContainer.defaultProps = {
    flexDirection: "column",
}

export default ContentContainer