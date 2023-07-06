import { Chat } from "../Props/Game/Chat/Chat";

export default class GameContextObject{
    game;
    gameId;
    createComponent;
    mode;
    forceReload;
    totalGames = 0;
    chat = new Chat();
    constructor(){

    }
}