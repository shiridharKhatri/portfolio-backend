const mongoose = require("mongoose");
const moment = require("moment");

function generateRandomString() {
  const numbers = "0123456789";
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  // Generate 9 random numbers
  for (let i = 0; i < 9; i++) {
    const randomNum = Math.floor(Math.random() * numbers.length);
    result += numbers[randomNum];
  }

  // Generate 5 random alphabets
  for (let i = 0; i < 5; i++) {
    const randomAlpha = Math.floor(Math.random() * alphabets.length);
    result += alphabets[randomAlpha];
  }

  // Shuffle the combined string
  result = result
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return result;
}

const projectSchema = mongoose.Schema({
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
  likes:[
    {
      userId:String,
      like:{
        type:Number,
        default:0
      }
    }
  ],
  comments: [
    {
      comment: {
        type: String,
      },
      commentedBy: Object,
      commentedOn: {
        type: Date,
        default: Date.now,
      },
      commentedAt: {
        type: String,
        default: moment().format("LT"),
      },
    },
  ],
  technology: {
    type: [String],
  },
  image: {
    type: [String],
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

projectSchema.index({ title: "text", description: "text" });
module.exports = mongoose.model("Projects", projectSchema);