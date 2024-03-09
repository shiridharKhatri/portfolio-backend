const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const url = process.env.DATABASE;
const connectToDatabase = async () => {
  try {
    let connection = await mongoose.connect(url);
    if (connection){
      console.log("Connected to mongodb database successfully")
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = connectToDatabase;
