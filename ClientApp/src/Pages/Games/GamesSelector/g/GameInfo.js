import CheckBoard from "../../../../components/Game/CheckBoard";
import ConnectBoard from "../../../../components/Game/Connect4/ConnectBoard";
import TicBoard from "../../../../components/Game/TicBoard";
import { CheckAi } from "../../../../components/Props/Game/AI/CheckAi";
import { ConnectAi } from "../../../../components/Props/Game/AI/ConnectAi";
import { TicTacToeAi } from "../../../../components/Props/Game/AI/TicTacToeAI";
import { CheckGame } from "../../../../components/Props/Game/CheckGame";
import { ConnectGame } from "../../../../components/Props/Game/ConnectGame";
import { TicGame } from "../../../../components/Props/Game/TicGame";


class GameInfo{
    name;
    getNew;
    getComponent;
    getAI;
    constructor(){

    }

    getAiName(d){
        switch(Number(d)){
            case 0:
                return "Easy Ai"
            case 1:
                return "Medium Ai"
            case 2:
                return "Impossible Ai"
        }
    }

}

const GameMap = new Map()

const tictactoe = new GameInfo()
tictactoe.name = "Tic Tac Toe"
tictactoe.getNew = (n1, n2) =>{
    return new TicGame(n1, n2)
}
tictactoe.getAI = (game, difficulty) =>{
    return new TicTacToeAi(game, difficulty)
}
tictactoe.getComponent = () =>{
    return (<TicBoard/>)
}
GameMap.set("tictactoe", tictactoe)


const connect4 = new GameInfo()
connect4.name = "Connect Four"
connect4.getNew = (n1, n2) =>{
    return new ConnectGame(n1, n2)
}
connect4.getAI = (game, difficulty) =>{
    return new ConnectAi(game, difficulty)
}
connect4.getComponent = () =>{
    return (<ConnectBoard/>)
}
GameMap.set("connect4", connect4)


const checkers = new GameInfo()
checkers.name = "Checkers"
checkers.getNew = (n1, n2) =>{
    return new CheckGame(n1, n2)
}
checkers.getComponent = () =>{
    return (<CheckBoard />)
}
checkers.getAI = (game, difficulty) =>{
    return new CheckAi(game, difficulty)
}
GameMap.set("checkers", checkers)

export {GameMap}