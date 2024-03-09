const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const forgetPassword = require("../mail/forgetPassword");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
// Helper function to generate a random code
const generateRandomCode = (count) => {
  let code = "";
  for (let i = 0; i < count; i++) {
    const randomNumber = Math.floor(Math.random() * 10);
    code += randomNumber;
  }
  return code;
};

// Signup route
router.post(
  "/signup",
  [
    body(
      "name",
      "Invalid name. Please use only letters and spaces and minimum length of three."
    ).isLength({ min: 3 }),
    body(
      "email",
      "Invalid email address. Please use a valid email format (e.g., example@example.com)."
    ).isEmail(),
    body(
      "password",
      "Invalid password. Please use at least 8 characters, mix of uppercase/lowercase, numbers, and special characters."
    ).isStrongPassword(),
    body("gender").isLength({ min: 3 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(406).json({ success: false, errors: errors.array() });
      }

      const { name, email, password, gender } = req.body;

      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(401)
          .json({ success: false, msg: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        gender,
      });

      res
        .status(200)
        .json({ success: true, msg: "Account created successfully" });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }
);

// Login route
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(406).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(401).json({
          success: false,
          msg: "No user found with given email! Please recheck and try again.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ success: false, msg: "Incorrect password!" });
      }

      const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET, {
        expiresIn: "30d",
      });

      res.status(200).json({
        success: true,
        msg: `Welcome back, ${user.name}`,
        name: user.name,
        email: user.email,
        token: token,
        id:user._id
      });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }
);

// Forget password email validation route
router.post("/forgetPasswordEmailValidation", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, msg: "User with given email doesn't exist!" });
    }

    const code = generateRandomCode(6);
    await forgetPassword(user.email, user.name, code);
    await User.findByIdAndUpdate(
      user._id,
      { $set: { forgetPasswordCode: code } },
      { new: true }
    );

    // Set a timer to nullify forgetPasswordCode after 1 hour (3600000 milliseconds)
    setTimeout(async () => {
      await User.findByIdAndUpdate(
        user._id,
        { $set: { forgetPasswordCode: null } },
        { new: true }
      );
    }, 3600000); // 1 hour in milliseconds

    res.json({
      success: true,
      msg: "Forget password code sent successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
});

// Forget password confirmation route
router.post("/forgetPasswordConfirm", async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email: email });

    if (!user || user.forgetPasswordCode === null) {
      return res.status(400).json({
        success: false,
        msg: "Failed! Request code by validating email.",
      });
    }

    if (code !== user.forgetPasswordCode) {
      return res.status(400).json({
        success: false,
        msg: "Failed! Please enter the correct code and try again.",
      });
    } else {
      await User.findByIdAndUpdate(
        user._id,
        { $set: { forgetPasswordCode: null } },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        msg: "Code validated successfully",
        name: user.name,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
});

// Forget password change password route
router.post(
  "/forgetChangePassword",
  [
    body("password").isStrongPassword(),
    body("confirm_password").isStrongPassword(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({ success: false, errors: errors.array() });
      }

      const { password, confirm_password } = req.body;
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found!" });
      } else if (password !== confirm_password) {
        return res.status(401).json({
          success: false,
          msg: "Password and confirm password must be the same",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(
          user._id,
          { $set: { password: hashedPassword } },
          { new: true }
        );

        res
          .status(200)
          .json({ success: true, msg: "Password created successfully." });
      }
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }
);
router.get("/fetch", fetchUser, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      res
        .status(404)
        .json({ success: false, msg: "User is not registered in my system" });
    } else {
      res.status(200).json({
        success: true,
        email: user.email,
        gender: user.gender,
        name: user.name,
        id: user._id,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
});
module.exports = router;
