import { verify } from 'jsonwebtoken'
import config from 'config'

export default (req, res, next) => {
  const token = req.header('x-auth-token')

  if (!token) {
    return res.status(401).json({ msg: 'Not Authorized!' })
  }

  try {
    const decoded = verify(token, config.get('jwtSecret'))
    req.user = decoded.user
    next()
  } catch (e) {
    res.status(401).json({ msg: 'Not Authorized!' })
  }
}
