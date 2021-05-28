import { model, Schema } from 'mongoose'

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  birthdate: {
    type: Date,
    required: true
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true
})

const User = model('user', UserSchema)
export default User
