const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = async (req, res, next) => {
  try {
    let token = await req.header("auth-token");
    if (!token) {
      return res
        .status(401)
        .json({
          success: false,
          msg: "Please enter correct token and try again.",
        });
    } else {
      let data = await jwt.verify(token, JWT_SECRET);
      // console.log(data.user)
      req.user = data.user;
    }
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
  next();
};
module.exports = fetchUser;