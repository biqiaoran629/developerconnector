const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post model
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/post");

// @route GET api/posts/test
// @desc   Tests posts route
// @access Public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts works" });
});

// @route  GET api/posts
// @desc    Get post
// @access  public
router.get("/", (req, res) => {
  const errors = {};

  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(() => {
      errors.postnotfound = "No post found with that ID";

      res.status(404).json(errors);
    });
});

// @route  GET api/posts
// @desc    Get post by id
// @access  public
router.get("/:id", (req, res) => {
  const errors = {};

  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(() => {
      errors.postnotfound = "No post found with that ID";
      res.status(404).json(errors);
    });
});

// @route  POST api/posts
// @desc    Create post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => {
      res.json(post);
    });
  }
);

// @route  DELETE api/posts/:id
// @desc   Delete post
// @access  public
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(() => {
          errors.postnotfound = "No post found";
          res.status(404).json(errors);
        });
    });
  }
);

// @route  POST api/like/:id
// @desc   Like post
// @access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(() => {
          errors.postnotfound = "No post found";
          res.status(404).json(errors);
        });
    });
  }
);

// @route  POST api/unlike/:id
// @desc   Like post
// @access Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            !post.likes.filter(like => like.user.toString() === req.user.id)
              .length
          ) {
            errors.notliked = "You have not yet liked this post";
            return res.status(400).json(errors);
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(() => {
          errors.postnotfound = "No post found";
          res.status(404).json(errors);
        });
    });
  }
);

// @route  POST api/posts/comment:/id
// @desc   Add comment to post
// @access Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id).then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      };

      // Add to comments array
      post.comments.unshift(newComment);

      // Save
      post
        .save()
        .then(post => res.json(post))
        .catch(err => {
          errors.nopostfound = "No post found";
          res.status(404).json({ errors });
        });
    });
  }
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Remove comments from post
// @access Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Post.findById(req.params.id)
      .then(post => {
        if (
          !post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length
        ) {
          errors.commentnotexist = "comment does not exist";
          return res.status(404).json(errors);
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => {
        errors.postnotfound = "No post found";
        res.status(404).json(errors);
      });
  }
);

module.exports = router;
