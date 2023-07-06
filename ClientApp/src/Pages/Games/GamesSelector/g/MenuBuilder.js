import { ErrorCollection } from "../../../../components/Props/Form/ErrorCollection";
import MenuItem from "./MenuButton";
import {v4 as uuid} from "uuid"

export class MenuBuilder{
    #MenuMap = new Map();
    #selectedMenuId;
    constructor(){

    }
    addMenuCollection(menuId, title){
        const mc = new MenuCollection()
        mc.title = title
        this.#MenuMap.set(menuId, mc)
        return mc
    }

    addMenuItem(menuId, menuItem){
        this.#MenuMap.get(menuId).addItem(menuItem)
    }

    addMenuButton(menuId, link, title, onClick){
        const menuButton = new MenuButtonFactory()
        menuButton.link = link
        menuButton.title = title
        menuButton.onClick = onClick
        this.addMenuItem(menuId, menuButton)
        return menuButton
    }

    addMenuTextInput(menuId, inputId){
        const input = new MenuTextInputFactory(inputId)
        this.addMenuItem(menuId, input)
        return input
    }

    setSelectedMenuId(menuId){
        this.#selectedMenuId = menuId
    }

    getSelectedMenuId(){
        return this.#selectedMenuId
    }

    getSelectedMenu(){
        return this.#MenuMap.get(this.#selectedMenuId)
    }

    getMenu(menuId){
        return this.#MenuMap.get(menuId)
    }
}

export class MenuCollection{
    id = uuid();
    title;
    items = [];
    errorCollection = new ErrorCollection()
    globalValidation = () => {}

    constructor(){
        this.errorCollection.addKey("global")
        // this.errorCollection.addError("global", "global error", "glob_err")
    }

    addItem(item){
        this.items.push(item)
        if (item.type == "textinput"){
            this.errorCollection.addKey(item.id)
            //this.errorCollection.addError(item.id, "item_err", "item_err")
            item.onValueUpdated.push(() =>{
                this.errorCollection.clearErrors(item.id)
                this.errorCollection.clearErrors("global")
            })
        }
    }

    populateErrors(){
        this.errorCollection.clearAllErrors()
        let errs = []
        this.globalValidation(errs)
        for (let j = 0; j < errs.length; j++){
            this.errorCollection.addError("global", errs[j].msg, errs[j].code)
        }  
        for (let i = 0; i < this.items.length; i++)
        {
            if (!this.items.validation)
                continue
            errs = []
            this.inputs[i].validation(errs)
            for (let j = 0; j < errs.length; j++){
                this.errorCollection.addError(this.items[i].id, errs[j].msg, errs[j].code)
            }       
        }
        return this.errorCollection.hasAnyErrors()
    }

    addServerErrors(jsonErrors){
        Object.keys(jsonErrors).forEach(key =>{
            this.errorCollection.addErrors(key, jsonErrors[key])
        })
    }
}

 export class MenuItemFactory{
    id
    type;
    title;
    constructor(id=uuid()){
        this.id=id
    }
 }

 export class MenuButtonFactory extends MenuItemFactory{
    type = "button"
    link;
    onClick;
    constructor(id){
        super(id)
    }
 }

 export class MenuTextInputFactory extends MenuItemFactory{
    type="textinput"
    focused=false;
    value="";
    onValueUpdated=[]
    style;
    placeholder="";
    maxLength;
    validation = () => {}
    errorAllignment = "center"
    errorTop = true
    onEnter = () => {}
    constructor(id){
        super(id)
        this.style = {
            outline: "none",
            border: "1.7px solid rgb(126, 126, 126)",
            fontSize: "21px",
            padding: "10px",
            borderRadius: "4px",
            textAlign: "Center",
            width: "100%"
        }
    }

    onChange(e){
        this.value = e.target.value
        this.onValueUpdated.forEach(update =>{
            update(this)
        })
    }
 }