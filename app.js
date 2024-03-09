const express = require("express");
const cors = require("cors");
const connectToDatabase = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", require("./routes/blogs"));
app.use("/api/project", require("./routes/projects"));
app.use("/api/review", require("./routes/review"));
app.use("/auth/Admin", require("./routes/admin"));
app.use("/freeCode", require("./routes/freeCode"));
app.use("/auth/User", require("./routes/user"));
app.use("/message", require("./routes/message"));

// Static Assets
app.use("/blogImage", express.static("./blog-image"));
app.use("/reviewImage", express.static("./review-image"));
app.use("/projectImage", express.static("./project-image"));
app.use("/freeCodeImage", express.static("./free-code-image"));

// Database Connection
connectToDatabase().then(() => {
  // Server Listening
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error)=>{
  console.log(error);
});
