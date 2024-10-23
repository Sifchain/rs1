import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' }, // e.g., 'user', 'admin'
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)
export default User
