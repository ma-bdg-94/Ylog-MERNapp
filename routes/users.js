import { Router } from 'express'
import { check, validationResult } from 'express-validator'
import { url } from 'gravatar'
import { genSalt, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import config from 'config'

import User from '../models/User'

const router = Router()

/* 
   Method: POST;
   Http: '/users';
   Description: Sign up new user
   Access: Public 
*/
router.post(
  '/',
  [
    check('username')
      .not()
      .isEmpty()
      .withMessage('Required Field! Must have a username')
      .isLength({ min: 6 })
      .withMessage('Wrong Format! Must be at least 6-character length')
      .isAlphanumeric()
      .withMessage('Wrong Format! Must contain only letters and numbers'),
    check('email')
      .not()
      .isEmpty()
      .withMessage('Required Field! Must have an email')
      .isEmail()
      .withMessage('Wrong Email Format!'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('Required Field! Must have a password')
      .isLength({ min: 10 })
      .withMessage('Wrong Format! Must be at least 10-character length'),
    check('birthdate')
      .not()
      .isEmpty()
      .withMessage('Required Field! Must include your birthdate')
      .isDate()
      .withMessage('Wrong Date Format!'),
  ],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const { username, email, password, birthdate } = req.body

    try {
      let user = await User.findOne({ $or: [{ username }, { email }] })

      if (user) {
        res.status(400).json({
          errors: [{ msg: 'Already existing user with these credentials' }],
        })
      }

      const avatar = url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      })

      user = new User({
        username,
        email,
        password,
        birthdate,
        avatar,
      })

      const salt = await genSalt(10)
      user.password = await hash(password, salt)

      await user.save()

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
