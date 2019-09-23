const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  Post api/posts
//@dec    Create a post => create the route to add a post
//@access Public
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

//@route  Get api/posts
//@dec    Get all post
//@access Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  Get api/posts/:id
//@dec    Get post by ID
//@access Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found!' });
    }
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found!' });
    }
    res.status(500).send('Server Error');
  }
});

//@route  DELETE api/posts/:id
//@dec    Delete a post
//@access Private
router.delete('/', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.param.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found!' });
    }

    // check user => check if the user that's deleting the post is the user that owns the post.
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized!' });
    }

    await post.remove();

    res.json({ msg: 'Post removed!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  PUT api/posts/like/:id
//@dec    like a post => update the post
//@access Private

router.put('/like/:id'.auth, async (req, res) => {
  try {
    const post = await Post.findById(req.param.id);

    // check if the post has already been liked
    // Compare the current user to the user that's logged in
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json('Post already liked!');
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  PUT api/posts/unlike/:id
//@dec    unlike the post
//@access Private

router.put('/unlike/:id'.auth, async (req, res) => {
  try {
    const post = await Post.findById(req.param.id);

    // check if the post has not been liked
    // Compare the current user to the user that's logged in
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json('Post has not yet been liked!');
    }

    // Get remove index to get the correct like to remove it.
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   POST api/posts/comment/:id
//@dec     Comment on a post
//@access  Private
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.param.id); // id of the post

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

//@route   Delete api/posts/comment/:id/:comment_id => because we need to find the post by the id and then we need to know which comment to delete.
//@dec     Delete comment
//@access  Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // get the post by it's id

    // pull out comment => get the comment from the post
    const comment = post.comments.find(comment => comment.id === req.params.id);

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist!' });
    }

    // Check user => the user who did the comment is the user who want to delete it.
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized!' });
    }

    // Get remove index to get the correct like to remove it.
    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
