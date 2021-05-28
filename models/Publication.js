import { model, Schema } from 'mongoose'

const PublicationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },
  avatar: {
    type: String,
  },
  ratings: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      rate: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      text: {
        type: String,
        required: true,
      },
      author: {
        type: String,
      },
      avatar: {
        type: String,
      },
      commentedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  writtenAt: {
    type: Date,
    default: Date.now,
  },
})

const Publication = model('publication', PublicationSchema)
export default Publication
