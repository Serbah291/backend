const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET

function generateToken(id, role) {
  return jwt.sign(
    {
      id: id,
      role: role,
    },
    secret
  )
}

module.exports = generateToken
