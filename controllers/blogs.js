const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  try {
    const blogs = await Blog
      .find({})
      .populate('user')
    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const userId = decodedToken

  try {
    let body = request.body
    if (body.likes === undefined) {
      body = { ...body, likes: 0 }
    }

    const user = await User.findById(userId)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user.id
    })
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const userId = decodedToken

  try {
    const { id } = request.params
    const blog = await Blog.findById(id)
    const user = await User.findById(userId)

    if (blog.user.toString() !== user._id.toString()) {
      return response.status(401).json({ error: 'user is invalid' })
    }

    await Blog.findByIdAndRemove(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const userId = decodedToken

  try {
    const { id } = request.params
    const body = request.body
    const blog = await Blog.findById(id)

    const user = await User.findById(userId)

    if (blog.user.toString() !== user.id) {
      return response.status(401).json({ error: 'user is invalid' })
    }

    const blogUpdate = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user.id
    }

    const updatePerson = await Blog.findByIdAndUpdate(id, blogUpdate, { new: true })
    if (updatePerson) {
      response.json(updatePerson)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter
