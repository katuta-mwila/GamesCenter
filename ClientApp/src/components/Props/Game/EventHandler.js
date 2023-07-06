export class EventHandler{
    //eventId;
    #calls = [];
    constructor(id){
        //this.eventId = id
    }

    containsHandler(handler){
        return this.#calls.some(h => {
            return handler == h
        })
    }

    addHandler(handler){
        if (this.containsHandler(handler)) return
        this.#calls.push(handler)
    }

    call(){
        this.#calls.forEach(handler =>{
            handler(arguments)
        })
    }
}