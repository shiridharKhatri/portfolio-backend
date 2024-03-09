const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET_ADMIN;
const fetchAdmin = async (req, res, next) => {
  try {
    let token = await req.header("auth-token");
    if(!token){
        return res.status(401).json({success:false, msg:"Please enter correct token"})
    }
    let data = await jwt.verify(token, JWT_SECRET);
    req.admin = data.data.admin;
    // console.log(data.data.admin)
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
  next();
};
module.exports = fetchAdmin;
