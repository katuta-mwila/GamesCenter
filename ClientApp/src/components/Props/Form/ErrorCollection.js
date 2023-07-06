class ErrorCollection{
    collection;
    constructor(){
        this.collection = new Map()
    }

    parse(obj)
    {
        Object.keys(obj.collection).forEach(key =>{
            this.addKey(key)
            this.addErrors(key, obj.collection[key])
        })
    }

    addKey(key){
        this.collection.set(key, [])
    }

    hasKey(key){
        return this.collection.has(key)
    }

    clearErrors(key){
        if (this.hasKey(key))
            this.collection.set(key, [])
    }

    clearAllErrors(){

        Array.from(this.collection.keys()).forEach(key =>{
            this.clearErrors(key)
        })
    }

    hasError(key, code)
    {
        return this.collection.get(key).some(element => element.code == code)
    }

    addError(key, msg, code)
    {
        if (!this.collection.has(key) || this.hasError(key, code)) return
        this.collection.get(key).push({msg, code})
    }

    addErrors(key, errors){
        for (let i = 0; i < errors.length; i++){
            this.addError(key, errors[i].msg, errors[i].code)
        }
    }

    getErrors(key){
        return this.collection.get(key) != null ? this.collection.get(key) : []
    }

    hasAnyErrors(){
        return Array.from(this.collection.keys()).some(key =>{
            return this.collection.get(key).length > 0
        })
    }
}

export {ErrorCollection}