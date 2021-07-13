const corsWhitelist = [
  "http://localhost:3000",
  "http://localhost:8000",
  undefined
];

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

module.exports = corsPrefs;