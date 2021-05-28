import { Router } from 'express'
import { check, validationResult, oneOf } from 'express-validator'
import { compare, genSalt, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import config from 'config'

import authenticated from '../middlewares/authenticated'
import User from '../models/User'

const router = Router()

/* 
   Method: GET;
   Http: '/auth';
   Description: Get Logged In User Data
   Access: Private 
*/
router.get('/', authenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (e) {
    console.error(e.message)
    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: POST;
   Http: '/au';
   Description: Sign in user
   Access: Public 
*/
router.post(
  '/',
  [
    oneOf([
      check('username')
        .not()
        .isEmpty()
        .withMessage('Required Field! Must include the username or the email'),
      check('email')
        .not()
        .isEmpty()
        .withMessage('Required Field! Must include the username or the email'),
    ]),
    check('password')
      .exists()
      .withMessage('Required Field! Must include the password'),
  ],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const { username, email, password } = req.body

    try {
      let user = await User.findOne({ $or: [{ username }, { email }] })

      if (!user) {
        res.status(400).json({
          errors: [{ msg: 'Inexisting user with these credentials!' }],
        })
      }

      const passwordMatch = await compare(password, user.password)
      if (!passwordMatch) {
        res.status(400).json({
          errors: [{ msg: 'Inexisting user with these credentials!' }],
        })
      }

      const payload = {
        user: {
          id: user.id,
        },
      }

      sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 3600000 },
        (e, token) => {
          if (e) throw e
          res.json({ token })
        },
      )
    } catch (e) {
      console.error(e.message)
      res.status(500).send('Error 500! Something went wrong on the server')
    }
  },
)

export default router
