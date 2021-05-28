import { Router } from 'express'
import { check, validationResult } from 'express-validator'

import authenticated from '../middlewares/authenticated'
import Profile from '../models/Profile'
import User from '../models/User'

const router = Router()

/* 
   Method: GET;
   Http: '/profile/me';
   Description: Get Current Profile
   Access: Private 
*/
router.get('/me', authenticated, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['username', 'avatar'])

    if (!profile) {
      return res.status(400).json({ msg: 'No profile found for this author!' })
    }

    res.json(profile)
  } catch (e) {
    console.error(e.message)
    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: POST;
   Http: '/profile';
   Description: Create, Update Profile
   Access: Private 
*/
router.post(
  '/',
  [
    authenticated,
    [
      check('firstName', 'Required Field! Please include your first name')
        .not()
        .isEmpty(),
      check('lastName', 'Required Field! Please include your last name')
        .not()
        .isEmpty(),
      check('school', 'Required Field! Please include your school name')
        .not()
        .isEmpty(),
      check('hobbies', 'Required Field! Please at least one hobby')
        .not()
        .isEmpty(),
      check('skills', 'Required Field! Please include at least one skill')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const {
      firstName,
      midName,
      lastName,
      country,
      city,
      school,
      hobbies,
      skills,
    } = req.body

    const fields = {}
    fields.user = req.user.id
    if (firstName) fields.firstName = firstName
    if (midName) fields.midName = midName
    if (lastName) fields.lastName = lastName
    if (country) fields.country = country
    if (city) fields.city = city
    if (school) fields.school = school
    if (hobbies) {
      fields.hobbies = hobbies.split(',').map((h) => h.trim())
    }
    if (skills) {
      fields.skills = skills.split(',').map((s) => s.trim())
    }

    try {
      let profile = await Profile.findOne({
        user: req.user.id,
      }).populate('user', ['username', 'avatar'])

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: fields },
          { new: true },
        )
        return res.json(profile)
      }

      profile = new Profile(fields)

      await profile.save()
      res.json(profile)
    } catch (e) {
      console.error(e.message)
      res.status(500).send('Error 500! Something went wrong on the server')
    }
  },
)

/* 
   Method: GET;
   Http: '/profile';
   Description: Get All Profiles
   Access: Public 
*/
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', [
      'username',
      'avatar',
    ])
    res.json(profiles)
  } catch (e) {
    console.error(e.message)
    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: GET;
   Http: '/profile/author/:userId';
   Description: Get All Profiles
   Access: Public 
*/
router.get('/author/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate('user', ['username', 'avatar'])

    if (!profile) {
      return res.status(400).json({ msg: 'No profile found for this author!' })
    }

    res.json(profile)
  } catch (e) {
    console.error(e.message)

    if (e.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'No profile found for this author!' })
    }

    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: DELETE;
   Http: '/profile';
   Description: Get All Profiles
   Access: Private 
*/
router.delete('/', authenticated, async (req, res) => {
   try {
     // remove profile
     await Profile.findOneAndDelete({ user: req.user.id })

     // remove user
     await User.findOneAndDelete({ _id: req.user.id })

     res.json({ msg: 'Exited service successfully!' })
   } catch (e) {
     console.error(e.message)
     res.status(500).send('Error 500! Something went wrong on the server')
   }
 })

export default router
