import React, {useMemo, useState} from 'react'
import ClickRegistry from "../../util/ClickRegistry.js"
import useReload from "../../customhooks/useReload"

export class PopupProp{
    id;
    component;
    blurred = false;
    closeOnBackgroundClick = true;
    constructor(_id, _component){
        this.id = _id
        this.component = _component
    }
}

export class PopupCollectionProp{
    popups = new Map();
    selectedPopupId;
    constructor(){

    }

    getLength(){
        return this.popups.size
    }

    addPopup(popupProp, makeSelected=false){
        this.popups.set(popupProp.id, popupProp)
        if (this.getLength() || makeSelected)
            this.selectedPopupId = popupProp.id
    }

    removePopup(id){
        this.popups.delete(id)
        if (this.selectedPopupId == id)
            this.setDefaultSelected()
    }

    setSelectedPopup(id){
        if (this.popups.has(id))
            this.selectedPopupId = id
    }

    setDefaultSelected(){
        if (this.getLength() > 0)
            this.selectedPopupId = this.popups.keys[0]
        else
            this.selectedPopupId = null
    }

    removeAll(){
        this.popups = new Map()
        this.setDefaultSelected()
    }

    getSelectedPopup(){
        if (this.selectedPopupId == null) return null
        return this.popups.get(this.selectedPopupId)
    }

    getPopup(id){
        return this.popups.get(id)
    }
}

const RefinedPopupManager = ({externalAccessor}) => {
    const [popupCollection, setPopupCollection] = useState(new PopupCollectionProp())
    const reload = useReload()

    useMemo(() =>{
        externalAccessor.closePopups = () =>{
            popupCollection.removeAll()
            reload()
        }
        externalAccessor.addPopup = (popupProp, makeSelected=false) => {
            popupCollection.addPopup(popupProp, makeSelected)
            reload()
        }
        externalAccessor.setSelectedPopup =  (id) =>{
            popupCollection.setSelectedPopup(id)
            reload()
        }
        externalAccessor.removePopup = (id) =>{
            popupCollection.removePopup(id)
            reload()
        }
    }, [externalAccessor])

    ClickRegistry.removeByButtonId("popup-manager-refined")
    const selectedPopup = popupCollection.getSelectedPopup()
    if (selectedPopup != null){
        const registryGroup = `popup-manager-refined_${selectedPopup.id}`
        ClickRegistry.addRegistry(registryGroup, "popup-manager-refined", `POPUP_MANAGER__${selectedPopup.id}`, "mousedown", (target, state) =>{
            if (state == "direct_click" && selectedPopup.closeOnBackgroundClick){
    
                ClickRegistry.removeGroup(registryGroup)
                popupCollection.removeAll()
                reload()
            }
        })
    }
  return (
    <div id="popup-manager-refined" className={selectedPopup == null ? "inactive" : "active"} style={{backdropFilter: (selectedPopup != null && selectedPopup.blurred) ? "blur(4px)" : ""}}>
        {Array.from(popupCollection.popups.keys()).map((key, i) =>{
            const popupProp = popupCollection.getPopup(key)
            const isSelected = key == popupCollection.selectedPopupId
            return (<div id={`POPUP_MANAGER__${key}`} key={key} className={isSelected ? "flex-display" : "no-display"}>
                {popupProp.component}
            </div>)
        })}
    </div>
  )
}

RefinedPopupManager.defaultProps = {
    popupCollectionProp: new PopupCollectionProp()
}

export default RefinedPopupManager
