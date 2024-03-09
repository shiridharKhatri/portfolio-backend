const express = require("express");
const Admin = require("../models/Admin");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET_ADMIN;
router.post(
  "/signup",
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isStrongPassword(),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res
        .status(406)
        .json({ status: 406, success: false, errors: error.array() });
    }
    try {
      const { name, email, password } = req.body;
      const adminInfo = await Admin.findOne({ email: email });
      let admin = await Admin.find();
      if (!adminInfo) {
        let salt = await bcrypt.genSalt(10);
        let secPassword = await bcrypt.hash(password, salt);
        admin = await Admin.create({ name, email, password: secPassword });
        res
          .status(200)
          .json({ success: true, msg: "Admin created successfully" });
      } else if (adminInfo) {
        return res.status(400).json({
          success: false,
          data: !admin,
          msg: "Admin with this email already exist",
        });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body(
      "password",
      "Please enter correct password and try again later"
    ).exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(406).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email: email });

      if (!admin) {
        return res
          .status(401)
          .json({ success: false, msg: "Email is not registered." });
      }

      const compPassword = await bcrypt.compare(password, admin.password);

      if (!compPassword) {
        return res.status(401).json({
          success: false,
          msg: "Please login with correct credentials.",
        });
      } else {
        const data = {
          admin: {
            id: admin.id,
          },
        };
        let expDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
        let tokens = jwt.sign({ data, exp: expDate }, JWT_SECRET);
        return res
          .status(200)
          .json({
            success: true,
            msg: `Success! Welcome back ${admin.name}`,
            token: tokens,
          });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

module.exports = router;
