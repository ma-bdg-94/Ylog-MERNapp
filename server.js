import express from 'express'
import dbConnect from './config/database'

/* Import routes */
import auth from './routes/auth'
import users from './routes/users'
import profile from './routes/profile'
import publications from './routes/publications'

const app = express()

/* Connect to Database */
dbConnect()

/* Init middleware */
app.use(express.json())

/* Define Routes */
app.use('/auth', auth)
app.use('/users', users)
app.use('/profile', profile)
app.use('/publications', publications)

const Port = process.env.Port || 10000

app.listen(Port, () => console.log(`Server running on http://localhost:${Port}`))
