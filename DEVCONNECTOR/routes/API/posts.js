const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  Post api/posts
//@dec    Create a post => create the route to add a post
//@access Public
router.post('/', [
  auth,
  [
    check('school', 'School is required')
      .not()
      .isEmpty(),
  ]
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('-password');
  
    const newPost = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    }
    const post = await newPost.save();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

//@route  Get api/posts
//@dec    Get all post 
//@access Private
  router.get('/', auth, async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1 })
      res.json(posts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }

//@route  Get api/posts/:id
//@dec    Get post by ID
//@access Private
  router.get('/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ msg: 'Post not found!'})
      }
      res.json(posts);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found!'})
      }
      res.status(500).send('Server Error');
    }

//@route  DELETE api/posts/:id
//@dec    Delete a post 
//@access Private
  router.delete('/', auth, async (req, res) => {
    try {
      const posts = await Post.findById(req.param.id);

      if (!post) {
        return res.status(404).json({ msg: 'Post not found!'})
      }

      // check user => check if the user that's deleting the post is the user that owns the post.
      if (post.user.toString() !== req.user.id) {
        return  res.status(401).json({ msg: 'User not authorized!'})
      }

      await post.remove();

      res.json({ msg: 'Post removed!'};
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }


module.exports = router;
