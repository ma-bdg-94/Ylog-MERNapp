import { json, Router } from 'express'
import { check, validationResult } from 'express-validator'

import authenticated from '../middlewares/authenticated'
import User from '../models/User'
import Profile from '../models/Profile'
import Publication from '../models/Publication'

const router = Router()

/* 
   Method: POST;
   Http: '/publications';
   Description: Add A Publication
   Access: Private 
*/
router.post(
  '/',
  [
    authenticated,
    [
      check('title')
        .not()
        .isEmpty()
        .withMessage('Required! Must include a title')
        .isLength({ min: 5 })
        .withMessage('Too short title!'),
      check('text')
        .not()
        .isEmpty()
        .withMessage('Required! Must include a text')
        .isLength({ min: 10 })
        .withMessage('Too short text!'),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    try {
      const user = await User.findById(req.user.id).select('-password')

      const { title, text } = req.body

      const newArticle = new Publication({
        user: req.user.id,
        author: user.username,
        avatar: user.avatar,
        title,
        text,
      })

      const publication = await newArticle.save()
      res.json(publication)
    } catch (e) {
      console.error(e.message)
      res.status(500).send('Error 500! Something went wrong on the server')
    }
  },
)

/* 
   Method: PUT;
   Http: '/publications/:pubId';
   Description: Update Publication
   Access: Private 
*/
router.put('/:pubId', authenticated, async (req, res) => {
  const { title, text } = req.body

  const pubFields = {}
  pubFields.user = req.user.id
  pubFields.author = user.username
  pubFields.avatar = user.avatar
  if (title) pubFields.title = title
  if (text) pubFields.text = text

  try {
    let publication = await Publication.findById(req.params.pubId)

    if (!publication) {
      return res.status(404).json({ msg: 'No publication found!' })
    }

    if (publication.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized!' })
    }

    publication = await Publication.findOneAndUpdate(
      { _id: req.params.pubId },
      { $set: pubId },
      { new: true },
    )

    res.json(publication)
  } catch (e) {
    console.error(e.message)
    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: GET;
   Http: '/publications';
   Description: Get All Publications
   Access: Public 
*/
router.get('/', async (req, res) => {
  try {
    const publications = await Publication.find().sort({ Date: -1 })
    res.json(publications)
  } catch (e) {
    console.error(e.message)
    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: GET;
   Http: '/publications/:pubId';
   Description: Get Publication By Id
   Access: Public 
*/
router.get('/:pubId', async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.pubId)

    if (!publication) {
      return res.status(404).json({ msg: 'No publication found!' })
    }

    res.json(publication)
  } catch (e) {
    console.error(e.message)

    if (e.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'No publication found!' })
    }

    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: GET;
   Http: '/publications/authors/:userId';
   Description: Get All Publications By User Id
   Access: Public 
*/
router.get('/authors/:userId', async (req, res) => {
  try {
    const publications = await Publication.find({
      user: req.params.userId,
    }).populate('user', ['username', 'avatar'])

    if (publications.length === 0) {
      return res
        .status(404)
        .json({ msg: 'No publication found for this author!' })
    }

    res.json(publications)
  } catch (e) {
    console.error(e.message)

    if (e.kind == 'ObjectId') {
      return res
        .status(404)
        .json({ msg: 'No publication found for this author!' })
    }

    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: GET;
   Http: '/publications/featured';
   Description: Get Featured Publications
   Access: Public 
*/
router.get('/', async (req, res) => {
  try {
    const publications = await Publication.find({ 'ratings.rate': { $gte: 4.5 } }).sort({ Date: -1 })
    res.json(publications)
  } catch (e) {
    console.error(e.message)
    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: DELETE;
   Http: '/publications/:pubId';
   Description: Delete Publication
   Access: Private 
*/
router.delete('/:pubId', authenticated, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.pubId)

    if (!publication) {
      return res.status(404).json({ msg: 'No publication found!' })
    }

    if (publication.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized!' })
    }

    await publication.remove()

    res.json({ msg: 'Publication deleted successfully!' })
  } catch (e) {
    console.error(e.message)

    if (e.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'No publication found!' })
    }

    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: PUT;
   Http: '/publications/rate/:pubId';
   Description: Rate Publication
   Access: Private 
*/
router.put('/rate/:pubId', authenticated, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.pubId)

    const { rate } = req.body

    const newRating = {
      user: req.user.id,
      rate,
    }

    if (newRating.rate < 0 || newRating.rate > 5) {
      return res.status(400).json({ msg: 'Rate must be between 0 and 5!' })
    }

    publication.ratings.push(newRating)

    await publication.save()
    res.json(publication.ratings)
  } catch (e) {
    console.error(e.message)
    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

/* 
   Method: POST;
   Http: '/publications/comment/:pubId';
   Description: Comment Publication
   Access: Private 
*/
router.post(
  '/comment/:pubId',
  [
    authenticated,
    [
      check('text')
        .not()
        .isEmpty()
        .withMessage('Required! Must include a text'),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    try {
      const user = await User.findById(req.user.id).select('-password')
      const publication = await Publication.findById(req.params.pubId)

      const { text } = req.body

      const newComment = {
        user: req.user.id,
        author: user.username,
        avatar: user.avatar,
        text,
      }

      publication.comments.unshift(newComment)

      await publication.save()
      res.json(publication.comments)
    } catch (e) {
      console.error(e.message)
      res.status(500).send('Error 500! Something went wrong on the server')
    }
  },
)

/* 
   Method: DELETE;
   Http: '/publications/comment/:pubId/:commentId';
   Description: Delete Publication Comment
   Access: Private 
*/
router.delete('/comment/:pubId/:commentId', authenticated, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.pubId)
    const comment = publication.comment.find(
      (c) => c.id === req.params.commentId,
    )

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found!' })
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not Authorized!' })
    }

    const index = publication.comments
      .map((c) => c.user.toString())
      .indexOf(req.user.id)
    publication.comments.splice(index, 1)

    await publication.save()
    res.json(publication.comments)
  } catch (e) {
    console.error(e.message)
    res.status(500).send('Error 500! Something went wrong on the server')
  }
})

export default router
