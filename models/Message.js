const mongoose = require("mongoose");
const moment = require("moment");
const messageSchema = mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  message: {
    type: String,
    require: true,
  },
  askedOn: {
    type: String,
    default: moment().format("MMMM Do YYYY"),
  },
  time: {
    type: String,
    default: moment().format("LT"),
  },
});
module.exports = mongoose.model("Messages", messageSchema)