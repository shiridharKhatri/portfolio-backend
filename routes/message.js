const express = require("express");
const Message = require("../models/Message");
const router = express.Router();
const { body, validationResult } = require("express-validator");
router.post(
  "/messagePost",
  [body("email").isEmail(), body("message").isLength({ min: 5 })],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ success: false, error: error.array() });
    }
    try {
      const { email, message } = req.body;
      const exists = await Message.findOne({ email: email });
      if (exists) {
        res.status(400).json({
          success: false,
          msg: "Thank you. No need for duplicate submissions. Please await our reply and respond directly to the email. Appreciate your patience",
        });
      } else {
        await Message.create({
          email,
          message,
        });
        res.status(200).json({
          success: true,
          msg: "Message sent successfully! Anticipate our response through your provided email address.",
        });
      }
    } catch (error) {
      return res.status(500).json({ success: false, msg: error.message });
    }
  }
);

router.get("/message/user", async (req, res) => {
  try {
    let message = await Message.find();
    if (!message) {
      return res
        .status(404)
        .json({ success: false, msg: "Messages not found in our system." });
    } else {
      return res
        .status(200)
        .json({ success: true, total: message.length, message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
});
module.exports = router;
