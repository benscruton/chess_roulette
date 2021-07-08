const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}`, {
  useNewUrlParser:true,
  useUnifiedTopology:true
})
  .then(() => console.log(`You are now connected to ${process.env.DB_NAME}.`))
  .catch(err => console.log("Melting down now...", err))