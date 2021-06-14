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
        console.log(origin);
        console.log(corsWhitelist.indexOf(origin));
        if(corsWhitelist.indexOf(origin) !== -1){
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

    socket.on("joinRoom", gameId => {
        socket.join(gameId);
    });

    socket.on("madeAMove", data => {
        socket.to(data.gameId).emit("newMoveCameIn", data);
    });

    socket.on("newPlayer", data => {
        socket.to(data.gameId).emit("playerUpdate", data);
    });

    socket.on("startGame", data => {
        socket.to(data.gameId).emit("gameBegun", data.game);
    });
});


require('./server/config/database.config');
require('./server/routes/user.routes')(app);
require('./server/routes/game.routes')(app);  