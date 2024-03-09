const mongoose = require("mongoose");
const moment = require("moment");
const codeSchema = mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  image: {
    type: String,
  },
  color: {
    type: String,
  },
  link: {
    type: String,
  },
  live: {
    type: String,
  },
  publishedOn: {
    type: String,
    default: moment().format("MMMM Do YYYY"),
  },
  time: {
    type: String,
    default: moment().format("LT"),
  },
});
codeSchema.index({ title: "text", description: "text" });
module.exports = mongoose.model("freeCode", codeSchema);
