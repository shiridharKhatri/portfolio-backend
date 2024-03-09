const mongoose = require("mongoose");
const moment = require("moment");
const blogSchema = mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin-Data",
  },
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  img: {
    type: String,
  },
  points: {
    type: [String],
  },
  conclusion: {
    type: String,
  },
  color: {
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
blogSchema.index({ title: "text", description: "text" });
module.exports = mongoose.model("Blogs", blogSchema);
