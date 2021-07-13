const mongoose = require('mongoose');

let dbName = process.env.DB_NAME || "chessDB";
let dbAddress = process.env.CLOUD_DB_STRING || `mongodb://localhost/${dbName}`;
let connMethod = process.env.CLOUD_DB_STRING ? "in the cloud" : "locally";
console.log(dbAddress);

mongoose.connect(dbAddress, {
  useNewUrlParser:true,
  useUnifiedTopology:true
})
  .then(() => console.log(`You are now connected to ${process.env.DB_NAME} ${connMethod}.`))
  .catch(err => console.log("Melting down now...", err));