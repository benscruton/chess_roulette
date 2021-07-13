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
const socketFunctions = require("./server/config/socket.config");
const io = require('socket.io')(server, socketParams);
io.on("connection", socketFunctions);

require('./server/config/database.config');

const routes = require("./server/routes");
app.use(routes);