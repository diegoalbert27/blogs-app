const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const users = await User
    .find({})
    .populate('blogs')
  response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body
    const saltRounds = 10

    if (!body.password) {
      return response.status(400).json({ error: '`password` is required' })
    }

    if (body.password.length < 3) {
      return response.status(400).json({ error: '`password` must have at least 3 characters' })
    }

    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter
