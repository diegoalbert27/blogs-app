const logger = require('./logger')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  let token = ''

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring(7)
  }

  request.token = token

  next()
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  if (error.name === 'SyntaxError') {
    return response.status(400).json({ error: error.message })
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
  errorHandler,
  unknownEndpoint,
  tokenExtractor
}
