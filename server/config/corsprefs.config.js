// const corsWhitelist = [
//   "http://localhost:3000",
//   "http://localhost:8000",
//   "chrome-extension://mpognobbkildjkofajifpdfhcoklimli",
//   undefined
// ];

const corsPrefs = {
  credentials: true,
  origin: (origin, callback) => {
    callback(null, true);
    return;
    // console.log(origin);
    // if(corsWhitelist.includes(origin)){
    //   callback(null, true);
    // } else {
    //   callback(new Error("This request was blocked by CORS policy."));
    // }
  }
};

module.exports = corsPrefs;