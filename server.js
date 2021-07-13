require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const server = app.listen(port, () => console.log(`Listening on ${port}`));

const corsWhitelist = ["http://localhost:3000", "http://192.168.1.64:3000"];
const corsPrefs = {
  credentials: true,
  origin: (origin, callback) => {
    if(corsWhitelist.includes(origin)){
      callback(null, true);
    } else {
      callback(new Error("This request was blocked by CORS policy."));
    }
  }
};

app.use(cookieParser(), cors(corsPrefs), express.json(), express.urlencoded({"extended": true}));    

const socketParams = {
  cors: {origin: "*"},
  path: "/chessmainsocket"
};
const io = require('socket.io')(server, socketParams);
io.on("connection", socket => {
  socket.on("joinRoom", roomName => {
    socket.join(roomName);
  });
  socket.on("leaveRoom", roomName => {
    socket.leave(roomName);
  });
  socket.on("madeAMove", data => {
    socket.to(data.gameId).emit("newMoveCameIn", data);
  });
  socket.on("newPlayer", data => {
    socket.to(data.gameId).to("lobby").emit("playerUpdate", data);
  });
  socket.on("startGame", game => {
    socket.to(game._id).emit("gameBegun", game);
  });
  socket.on("finishGame", game => {
    socket.to(game._id).emit("gameFinished", game);
  });
  socket.on("gameDeleted", gameId => {
    socket.to(gameId).to("lobby").emit("removeGame", gameId);
  });
  socket.on("gameCreated", game => {
    socket.to("lobby").emit("addGameToList", game);
  });
  socket.on("updateDraw", game => {
    socket.to(game._id).emit("drawOfferUpdate", game);
  });
  // socket.on("disconnect", () => {});
});

require('./server/config/database.config');
require('./server/routes/user.routes')(app);
require('./server/routes/game.routes')(app);  