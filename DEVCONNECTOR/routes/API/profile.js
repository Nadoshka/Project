const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const profile = require('../../models/Profile');
const user = require('../../models/User');

//@route  Get api/profile/me
//@dec    Get current users profile
//@access Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await profile
      .findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'there is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server Error');
  }
  res.send('Profile route');
});

//@route  Post api/profile
//@dec    Create or update users profile
//@access Private

// check for the errors the body errors.
router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }

    //pull everything out from the body
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    // build up this profileData object, to insert into the DB we need to check to see if this stuff is actually coming in before we set it
    const profileData = {};
    profileData.user = req.user.id;
    if (company) profileData.company = company;
    if (website) profileData.website = website;
    if (location) profileData.location = location;
    if (bio) profileData.bio = bio;
    if (status) profileData.status = status;
    if (githubusername) profileData.githubusername = githubusername;
    if (skills) {
      skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileData.social = {};
    if (youtube) profileData.youtube = youtube;
    if (twitter) profileData.twitter = twitter;
    if (facebook) profileData.facebook = facebook;
    if (linkedin) profileData.linkedin = linkedin;
    if (instagram) profileData.instagram = instagram;

    //look for a profile by the user if it's found => update it and then send back the profile
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true },
      );
      return res.json(profile);
    }

    // If the profile not found => Create, save and send the profile back
    try {
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

//@route  Get api/profile
//@dec    Get all profiles
//@access Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  Get api/profile/user/:user_id
//@dec    Get profile by user ID
//@access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [
      'name',
      'avatar',
    ]);
    if (!profile) return res.status(400).json({ msg: 'there is no profile for this user' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'objectId') {
      return res.status(400).json({ msg: 'profile not found!' });
    }
    res.status(500).send('Server Error');
  }
});

//@route  DELETE api/profile
//@dec    Delete profile, user & posts
//@access Private
router.delete('/', auth, async (req, res) => {
  try {
    //@todo - remove users posts

    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  PUT api/profile/experience
//@dec    Add profile experience
//@access Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //get the body data.
    const { title, company, location, from, to, current, description } = req.body;

    // create an object with the data that the user submits.
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      //fetch the profile that we want
      // to add the experience to.
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

//@route  DELETE api/profile/experience/:exp_id
//@dec    Delete experience from profile
//@access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    // getting the profile of the user the logged in user.
    // getting the index
    // then splicing it out
    // receiving it or saving it
    // then sending back a response.
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  PUT api/profile/education
//@dec    Add profile education
//@access Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldOfStudy', 'Field of study')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //get the body data.
    const { school, degree, fieldOfStudy, from, to, current, description } = req.body;

    // create an object with the data that the user submits.
    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    };

    try {
      //fetch the profile that we want
      // to add the education to.
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

//@route  DELETE api/profile/education/:edu_id
//@dec    Delete education from profile
//@access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    // getting the profile of the user the logged in user.
    // getting the index
    // then splicing it out
    // receiving it or saving it
    // then sending back a response.
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  GET api/github/:username/:edu_id
//@dec    Get user repos from Github
//@access Public

// take a GitHub user name
//and make a request to our back end
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId',
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };
    //and then make a request to the Github API to get the repositories of the user.
    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(400).json({ msg: 'No Github response found!' });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {}
});

module.exports = router;
