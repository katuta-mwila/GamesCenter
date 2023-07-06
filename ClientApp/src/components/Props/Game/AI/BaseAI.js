export class BaseAI{
    difficulty; //0, 1, 2
    game;
    aiPlayer;
    humanPlayer;
    delay = 1000; // milliseconds
    constructor(game, difficulty){
        this.difficulty = difficulty
        this.game = game
        this.aiPlayer = game.player2
        this.humanPlayer = game.player1
    }

    chooseBestOption(){
        setTimeout(this.chooseBestOptionAfterDelay.bind(this, this.game.currentGameId), this.delay)
    }

    chooseBestOptionAfterDelay(){

    }

    onGameStart(){

    }
}