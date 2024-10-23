import jwt from 'jsonwebtoken'

export const verifyToken = req => {
  const token = req.headers.authorization?.split(' ')[1] // Extract the token from the Authorization header

  if (!token) {
    throw new Error('No token provided')
  }

  try {
    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // Use a secure secret from env
    return decoded // Return the decoded token (which includes the userId, etc.)
  } catch (err) {
    throw new Error('Invalid or expired token')
  }
}

export const generateToken = user => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing')
  }
  // Create a token with the userId as payload and sign it with the secret
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token valid for 7 days
  )
  return token
}
