const express = require("express");
const Review = require("../models/Review");
const router = express.Router();
const multer = require("multer");
const moment = require('moment')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./review-image");
  },
  filename: function (req, file, cb) {
    cb(null, moment().format("MMM Do YY") + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.post("/postReview", upload.single("review-img"), async (req, res) => {
  try {
    const { review, star, display_name, source } = req.body;
    await Review.create({
      review,
      star,
      display_name,
      source,
      img: req.file.filename,
    });
    return res
      .status(200)
      .json({ success: true, msg: "Review added successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
});

router.get("/fetch", async (req, res) => {
  try {
    let review = await Review.find();
    if (!review) {
      return res.status(404).json({ success: false, msg: "No review found" });
    } else {
      return res
        .status(200)
        .json({ success: true, total: review.length, review });
    }
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
});
module.exports = router;
