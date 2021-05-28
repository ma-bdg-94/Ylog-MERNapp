import { model, Schema } from 'mongoose'

const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  firstName: {
    type: String,
    required: true
  },
  midName: {
    type: String
  },
  lastName: {
    type: String,
    required: true
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  school: {
    type: String,
    required: true
  },
  hobbies: {
    type: [String],
    required: true
  },
  skills: {
    type: [String],
    required: true
  }
}, {
  timestamps: true
})

const Profile = model('profile', ProfileSchema)
export default Profile
