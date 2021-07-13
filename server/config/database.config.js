const mongoose = require('mongoose');

const dbName = process.env.DB_NAME || "chessDB";
const dbAddress = process.env.CLOUD_DB_STRING || `mongodb://localhost/${dbName}`;
const connMethod = process.env.CLOUD_DB_STRING ? "in the cloud" : "locally";

mongoose.connect(dbAddress, {
  useNewUrlParser:true,
  useUnifiedTopology:true
})
  .then(() => console.log(`You are now connected to ${process.env.DB_NAME} ${connMethod}.`))
  .catch(err => console.log("Melting down now...", err));