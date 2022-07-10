const config = require('./utils/config')
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const { errorHandler, unknownEndpoint } = require('./utils/middleware')

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())

morgan.token('body', req => {
  const { name, number } = req.body
  return JSON.stringify({ name, number })
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use('/api/blogs', blogsRouter)

app.use(errorHandler)
app.use(unknownEndpoint)

module.exports = app
