const express = require("express");
const router = express.Router();

// @routes GET api/posts/test
// @desc Tests posts route
// @access Public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts works" });
});

module.exports = router;
