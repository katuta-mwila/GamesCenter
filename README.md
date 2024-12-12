# Games Center
A website containing three games, Tic Tac Toe, Connect 4 and Checkers. All games can be played two player locally, singleplayer vs Ai or two player online.  

The website is currently running live [here](https://games-center.azurewebsites.net/).

To play either of the three games first enter a display name then click through the menus for any of the games.
# Development
Games Center uses .NET 7.0 for the backend API with the front end developed using react as the main framework. The purpose of using a backend is to facilitate the
use of websockets that are required for the online mode to function.

The website was deployed publicly using a Microsoft Azure app service.
# What I Learned
* How to create a game Ai using the [minimax](https://en.wikipedia.org/wiki/Minimax) Algorithm. Every game uses this algorithm to create the Ai, each of the difficulties have some slight adjustments to create separation between the difficulties.
* How to use React context.
* How to use Web Workers in javascript. Because the Ai sometimes takes a non negligible time to calculate the best move this task was better done in the background of the application so that it does not hang the ui.
* How to use Web Sockets. For the online mode web sockets were necessary to allow two way communication between the client and the server.
* How to create an online chat. Example of this in the online mode.
* Using exceptions to short circuit http requests.
* How to deploy a website to Microsoft Azure
## Game Modes
### Two Player Local
This gamemode is for two players playing on the same computer.
### Singleplayer vs Ai
This gamemode is for playing against an Ai opposition. There are three different difficulties for each game, these are Easy, Medium, and Impossible.
### Two Player Online
This gamemode is for playing against another human player who is on a different computer. In the games menu click "online" then click "create game" to create a session and share the game code. Alternatively click "online" then click "join game" and enter the game code of the session you want to join.
