import { ErrorCollection } from "./ErrorCollection";

class InputCollection{
    id;
    title = ""
    inputs = [];
    errorCollection = new ErrorCollection()
    onSubmit = () => {}
    canSubmit = true
    submitText = ""
    globalValidation = () => {}
    constructor(_id){
        this.id = _id;
        this.errorCollection.addKey("global")
    }

    addInput(input){
        this.inputs.push(input)
        this.errorCollection.addKey(input.id)
        input.onValueUpdated.push(() =>{
            this.errorCollection.clearErrors(input.id)
            this.errorCollection.clearErrors("global")
        })
    }

    addInputs(){
        for (let i = 0; i < arguments.length; i++){
            this.addInput(arguments[i])
        }
    }

    populateErrors(){
        let errs = []
        this.globalValidation(errs)
        for (let j = 0; j < errs.length; j++){
            this.errorCollection.addError("global", errs[j].msg, errs[j].code)
        }  
        for (let i = 0; i < this.inputs.length; i++)
        {
            errs = []
            this.inputs[i].validation(errs)
            for (let j = 0; j < errs.length; j++){
                this.errorCollection.addError(this.inputs[i].id, errs[j].msg, errs[j].code)
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

class GenericInput{
    value;
    id;
    title;
    onValueUpdated = [];
    validation = () => {};
    constructor(_id){
        this.id = _id
    }
    onChange(e){
        this.value = e.target.value
        for (let i = 0; i < this.onValueUpdated.length; i++){
            this.onValueUpdated[i](this)
        }
    }
    getFormatedValue(){
        return this.value.replace(/(^ +)|(\ +$)/g, '').replace(/(?<=[^ ]) +(?=[^ ])/g, ' ')
    }
}

class TextInputProp extends GenericInput{
    type = "text";
    shouldFocus;
    onEnter = () => {};
    constructor(_id){
        super(_id)
        this.id = _id
        this.value = ""
    }
}

class PasswordInputProp extends GenericInput{
    type = "password"
    onEnter = () => {};
    constructor(_id){
        super(_id)
        this.value = ""
    }
}

export {InputCollection, TextInputProp, PasswordInputProp}