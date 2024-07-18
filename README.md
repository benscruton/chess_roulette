# Welcome to Chess Roulette

A fully playable chess application built from scratch using React, Socket.IO, Express, MongoDB, Bootstrap CSS, and a lot of custom algorithms.

<img alt="Chess Roulette screenshot" src="/demoImages/main_image.png" width="300" />

## Running the project

### Online Demo

This project is fully deployed (complete with two one-click-login demo users) at https://chess.benscruton.horse.

Feel free to make moves as either of the demo users in pre-existing games, to create your own game, or even to create a new account and start a game!

### Running locally

To download the project and run it locally, you'll need to have JavaScript, Yarn, and a MongoDB server. 

- Clone this Git repository,
- Create an `.env` file and add a value for `JWT_KEY`
- Install Node modules in root and client directories,
- Create a production build of the front end, and
- Start the Express server.

```
$ git clone https://github.com/benscruton/chess_roulette.git
$ cd chess_roulette
$ echo "JWT_KEY=SomeRandomString" > .env
$ yarn
$ cd client
$ yarn
$ yarn build
$ cd ..
$ node server.js
```

By default, the project will run on port 8000, and look for a local MongoDB server with a database named `chessDB`. These can be overridden in a `.env` file:

`.env`
```
JWT_KEY=SomeRandomString
PORT=8001
DB_NAME=someDatabaseName
CLOUD_DB_STRING="A valid MongoDB connection string"
```

Only `JWT_KEY` is required. `DB_NAME` can be included to override the default name in a local database; to access a cloud database, a full connection string can be included as `CLOUD_DB_STRING`. If both are included, the connection string will override the database name.

The Express server serves both the back end server and the production build of the front end; if you want to run the front end separately, running `yarn start` in the `client` directory will start a React development server on port 3000.

## Features

### Login and Registration

Chess Roulette allows users to create an account, log in, and edit some information once they've logged in.  For demonstration purposes, I have also created two demo users that only require a button click to log in.

<img alt="Login page" src="/demoImages/login.png" />

Usernames cannot be changed, but users can edit their first and last name, email, and password. In order to update a password, users must supply their current password and type the new password twice.

<img alt="Editing profile" src="/demoImages/editUser.gif" />

### Game Setup

Anyone is able to create a new game, whether they are logged in or not. Once a user is logged in, they will be able to join games in the Game Lobby. The Lobby shows a list of games, which can be filtered to find specific subsets of games:
- All (no filters)
- Unfinished (games in progress and games that have not yet started)
- Unstarted
- Ongoing (only games that are in progress)
- Finished
- Joinable (games with at least one open seat)

In addition to these filters, if a user is logged in there is also a My Games toggle that they can use to show only the games that they have joined.

<img alt="Game Lobby demonstration of filters" src="/demoImages/gameFilters.gif" />

The Game Lobby is Socket.IO-enabled, as are all individual Game Rooms. So as games are created and joined, those changes will show up in real time for all users viewing either the Lobby or the Game Room.

<img alt="Game Lobby socket demo" src="/demoImages/createJoinStartSocket.gif" />

### Game Play

The games themselves are fully operational according to the rules of standard chess. I wrote all of the move logic myself, as well as other game-play logic such as checks, checkmates, and stalemates.

When you click a piece, all available moves are highlighted on the board (green for normal moves, red for capture moves). Anyone can click on a piece to view its available moves, but only the user is able to actually make moves.

Users cannot move into check, and if they are in check they must block or move out of the check, in accordance with standard chess rules.

<img alt="Moving and checks" src="/demoImages/movingInCheck.gif" />

After any new moves are made, or when a user enters a Game Room, the most recent move is highlighted in purple; this both helps users see when new moves come in, and helps users quickly see the most recent activity when entering a Game Room.

<img alt="Last move is highlighted purple" src="/demoImages/latMove.png" />

As mentioned in the last section, the Game Room is Socket.IO-enabled, so moves are shown in real time across browsers and devices. Below is a demonstration of a complete game, the "Fool's Mate," taking just two moves. The two side-by-side browsers represent two different users logged in.

<img alt="Fool's Mate, showing moves in real time" src="/demoImages/foolsMate.gif" />

Pawn promotion is also fully functional. When a player moves a pawn to the final rank, they will see a new display box at the top of the screen allowing them to select a new piece. For other users, they will simply see a pawn on the final rank until the turn is complete.

<img alt="Pawn promotion, from two users' perspectives" src="/demoImages/pawnPromotion.gif" />

Moves are also converted into standard chess notation, and added to a running move log below the game board. This includes the proper notation for castling and capturing.

<img alt="Move log demonstration" src="/demoImages/moveLog.gif" />

Finally, there is also a system for ending the game early, by resigning or agreeing to a draw. When one player offers a draw, the other player can accept or reject the draw, or the original player can rescind the offer before it has been accepted. If a player wishes to resign, they'll be prompted to confirm before the resignation goes through, to safeguard against accidental clicks.

<img alt="Example of draw offers and resignation" src="/demoImages/offerDrawResign.gif" />

## Developer's Note

This was one of the earlier tech projects that I worked on, and while I am very proud of much of the work I did on this project, I have also learned a lot since I started it, and there are some things that I would do differently if I were to start it again.

I chose this project because I wanted to try my hand at something that was going to be fairly algorithm-heavy and require some creativity in terms of data structures. I stand by most of the work that I did in this regard -- the only changes I would make to the way game states are stored would be trivial updates like changing names of variables or using `null` instead of `false`.

Diving in a bit deeper: the board itself is stored as a matrix / array of arrays.  For standard chess boards (the only type currently available), this is an 8x8 matrix, with each square containing a JSON object that looks something like this:

```
// Occupied square
{
  rank: 8,
  file: "A",
  occupied: {
    type: "rook",
    color: "black",
    abbrev: "R"
  }
}

// Empty square
{
  rank: 8,
  file: "B",
  occupied: false
}
```

From there, when rendering the board, the front end pulls the color and piece name for each square from the `occupied` object, the sprite style from the user's selected style, and then displays the corresponding image.

Move logic is all handled in custom functions, with each piece's move logic stored in a separate module. I debated whether these should live in the front end or the back end, but ended up keeping them in the front end to limit the number of API calls necessary -- the user's browser is therefore able to calculate the possible moves for any given piece, and only needs to talk to the server when loading a game for the first time or when moves are actually made.

### Things I would change

However, as mentioned, there are things I would do differently if I were to start again or do a major overhaul:

#### Database

I used MongoDB for this project, quite simply, because that was the database technology I was learning at the time. There are certainly advantages to MongoDB, but I'm not sure it was the best choice for this project.

I definitely appreciate being able to just throw the game state into the database as a JSON array, rather than having to create separate models for game boards, game squares, pieces, and so on. However, there are advantages of a table-based relational database that would be useful for certain functionality. I was able to work around these within MongoDB for a project of this scale, but features like filtering out certain games by criteria and players would perform better at large scale with SQL.

I would therefore switch to a PostgreSQL database, as it offers the best of both worlds: relational tables, but also `json` and `jsonb` data types available.

#### Move validation

Currently, moves are handled by updating the game board JSON on the front end with the newest move, and then just sending the entire new board status to the back end. This does reduce the load on the server and minimize the number of API calls necessary; however, the flip side of that is that a knowledgeable user may be able to manually edit a game board JSON with an illegal move and send it alongside their authentication token.

I do therefore think it would be worthwhile to store the move logic on the server side. With that in mind, at least two options would be available:

1) Keep the same move logic saved on both the front end and the back end. When clicking a piece, the front end still calculates all possible moves.

2) When sending a board to the front end, go ahead and calculate all available moves for all pieces, and send that information as well. Then, when a user clicks a piece to see its available moves, the front end wouldn't run any calculations at all; it would simply refer to the array of previously calculated available moves, and highlight those on the board.

In either case, instead of sending the whole new game board to the back end to make a move, only the piece to move and its destination would be sent. The back end would then take this information and confirm that it's a legal move. Finally, the new game board with the latest move would be rendered on the back end, and sent out to the front end via Socket.IO.

#### Socket.IO and API duplicate functionality

Initially, all communication between client and server was handled via API calls. It was not until the basic move functionality had already been completed that I added in Socket.IO, allowing moves and other information to be pushed to all connected browsers and devices without page refreshes.

It was not until much later that I realized I had created some duplicate functionality, with the API and Socket.IO sharing some of the same data. This could definitely stand to be cleaned up a bit, although implementing the changes outlined in the Move Validation section would probably remove most of the duplicate functionality.

#### Previous game states

While a knowledgeable player could use the move log to recreate the game up to its current point, there are no records saved of boards in previous game states; there's only the current board status. It would be handy to have an array of previous board states as well, so that instead of just showing previous moves in a running log, each of those moves could be converted to links that could be clicked to display the board status at the time of that move.