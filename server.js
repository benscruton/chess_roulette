require('dotenv').config();

const express = require('express'),
    app = express(),
    port = process.env.PORT,
    cors = require('cors'),
    cookieParser = require('cookie-parser'),
    server = app.listen(port, () => console.log(`Listening on ${port}`)),
    io = require('socket.io')(server, {
        cors: {
            origin: "*"
        }
    });

const corsWhitelist = ["http://localhost:3000", 'http://192.168.1.64:3000'];
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

io.on("connection", socket => {
    console.log(socket.id);

    socket.on("disconnect", data =>{
        console.log("A User disconnected.");
    })

    socket.on("joinRoom", roomName => {
        console.log(roomName);
        socket.join(roomName);
    });

    socket.on("madeAMove", data => {
        socket.to(data.gameId).emit("newMoveCameIn", data);
    });

    socket.on("newPlayer", data => {
        socket.to(data.gameId).to("lobby").emit("playerUpdate", data);
    });

    socket.on("startGame", data => {
        socket.to(data.gameId).emit("gameBegun", data.game);
    });

    socket.on("gameDeleted", gameId => {
        socket.to(gameId).to("lobby").emit("removeGame", gameId);
    });

    socket.on("gameCreated", data => {
        console.log(data);
        socket.to("lobby").emit("addGameToList", data);
    });
});


require('./server/config/database.config');
require('./server/routes/user.routes')(app);
require('./server/routes/game.routes')(app);  