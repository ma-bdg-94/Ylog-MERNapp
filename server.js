import express from 'express'

const app = express()

const Port = process.env.Port || 10000

app.listen(Port, () => console.log(`Server running on http://localhost:${Port}`))
