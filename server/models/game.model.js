const mongoose = require('mongoose');
const {UserSchema} = require("./user.model");
const allBoards = require("../GameBoards/allBoards");
const allSpecialInfo = require("../GameSpecialInfo/allSpecialInfo");


const GameSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Required Field"],
  },
  playerWhite: {
    type: [UserSchema],
    required: [true, "Required Field"],
    maxLength: 1
  },
  playerBlack: {
    type: [UserSchema],
    required: [true, "Required Field"],
    maxLength: 1
  },
  spectators: {
    type: [UserSchema],
    required: [true, "Required Field"],
  },
  boardStatus: {
    type: Array,
    default: allBoards.standardChess()
  },
  whiteToPlay: {
    type: Boolean,
    default: true
  },
  lastMove: {
    type: [[String | Number]],
    default: []
  },
  moveLog: {
    type: [[String]],
    default: []
  },
  specialInfo: {
    type: {},
    default: allSpecialInfo.standardChess()
  },
  begun: {
    type: Boolean,
    default: false
  },
  finished: {
    type: String,
    default: ""
  },
  drawOfferedTo: {
    type: String, // will be a user ID
    default: ""
  }
}, {timestamps:true});

const Game = new mongoose.model("Game", GameSchema);

module.exports = Game;