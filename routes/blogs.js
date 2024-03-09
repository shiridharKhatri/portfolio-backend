const express = require("express");
const router = express.Router();
const Blogs = require("../models/Blogs");
const fetchAdmin = require("../middleware/fetchAdmin");
const multer = require("multer");
const moment = require("moment");
const fs = require("fs")
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./blog-image");
  },
  filename: function (req, file, cb) {
    cb(null, moment().format("MMM Do YY") + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });
// Endpoint to post a new blog
router.post(
  "/blog/post",
  upload.single("blog-img"),
  fetchAdmin,
  async (req, res) => {
    try {
      const { title, description, color, points, conclusion } = req.body;
      await Blogs.create({
        title,
        description,
        color,
        points,
        conclusion,
        img: req.file.filename,
        admin: req.admin.id,
      });
      // console.log(req.file)
      res.json({ success: true, msg: "Blog posted successfully!" });
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

// Endpoint to fetch all blogs
router.get("/blog/fetch", async (req, res) => {
  try {
    const blogs = await Blogs.find();
    if (!blogs) {
      return res.status(404).json({ success: false, msg: "Blogs not found" });
    } else {
      return res
        .status(200)
        .json({ success: true, total: blogs.length, data: blogs });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

// Endpoint to edit a blog
router.put("/blog/edit/:id", fetchAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;
    const newBlog = {};

    if (title) {
      newBlog.title = title;
    }

    if (description) {
      newBlog.description = description;
    }

    let blog = await Blogs.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, msg: "Blog not found" });
    }

    if (blog.admin.toString() !== req.admin.id.toString()) {
      return res.status(401).json({
        success: false,
        msg: "You do not have the authority to edit this blog.",
      });
    } else {
      await Blogs.findByIdAndUpdate(
        req.params.id,
        { $set: newBlog },
        { new: true }
      );
      res.status(200).json({ success: true, msg: "Blog edited successfully" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
});

// Endpoint to delete a blog
router.delete("/blog/delete/:id", fetchAdmin, async (req, res) => {
  try {
    const blog = await Blogs.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, msg: "Blog not found" });
    }

    if (blog.admin.toString() !== req.admin.id.toString()) {
      return res.status(401).json({
        success: false,
        msg: "You do not have the authority to delete this blog.",
      });
    } else {
      const filePath = `./blog-image/${blog.img}`;
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting the file:', err);
          } else {
            console.log('File deleted successfully.');
          }
        });
      } else {
        console.log('File not found.');
      }
      await Blogs.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, msg: "Blog deleted successfully" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
});

// Endpoint to search a blog
router.get("/blog/search", async (req, res) => {
  try {
    let query = req.query.q;
    let result = await Blogs.find({ $text: { $search: query } });
    if (!result || result.length <= 0) {
      return res.status(404).json({
        success: false,
        total: result.length,
        query: query,
        msg: "No result found",
      });
    } else {
      return res.status(200).json({
        success: true,
        total: result.length,
        query: query,
        result,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
});

router.get('/blog/fetch/:id', async(req,res)=>{
try {
  let blog = await Blogs.findById(req.params.id);
  if(!blog){
    return res.status(404).json({success:false, msg:"Blog not found or may deleted"})
  }else{
    return res.status(200).json({success:true, blog})
  }
} catch (error) {
  return res.status(500).json({success:false,msg:error.message})
}
})
module.exports = router;
