import Helper from "../../../../util/Helper";

export class Chat{
    chatItems = [];
    reloader = () => {}
    constructor(){

    }

    refresh(){
        this.reloader()
    }

    test(){
        const items = []
        for (let i = 0; i < 1; i++){
            const chatItem = new ChatItem()
            chatItem.title = "[i]"
            chatItem.text = "Impossible Ai has disconnected from the game"
            chatItem.titleColor = "black"
            chatItem.textColor = "black"
            items.push(chatItem)
        }
        this.addItems(items)
    }

    addSingle(chatItem){
        let value = chatItem.text
        value = Helper.formatText(value)
        if (value != ""){
            chatItem.text = value
            this.chatItems.push(chatItem)
        }
    }

    addItem(title, text, titleColor="black", textColor="black"){
        const chatItem = new ChatItem()
        chatItem.text = text
        chatItem.title = title
        chatItem.titleColor = titleColor
        chatItem.textColor = textColor
        this.addSingle(chatItem)
        this.refresh()
    }

    addItems(cItems){
        for (let i = 0; i < cItems.length; i++){
          this.addSingle(cItems[i])  
        }  
        this.refresh()
    }

    addInfo(text){
        this.addItem("[i]", text, "black", "black")
    }
}

export class ChatItem{
    title;
    text;
    titleColor;
    textColor;
    constructor(){

    }
}