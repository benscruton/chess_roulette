require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const server = app.listen(port, () => console.log(`Listening on ${port}`));

const corsPrefs = require("./server/config/corsprefs.config");

app.use(
  cookieParser(),
  cors(corsPrefs),
  express.json(),
  express.urlencoded({"extended": true})
);    

const {socketParams, socketFunctions} = require("./server/config/socket.config");
const io = require('socket.io')(server, socketParams);
io.on("connection", socketFunctions);

require('./server/config/database.config');

const routes = require("./server/routes");
app.use(routes);