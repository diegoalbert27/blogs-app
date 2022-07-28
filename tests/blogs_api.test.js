const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')

const api = supertest(app)

let token = ''

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  const userSaved = await user.save()

  const response = await api
    .post('/api/login')
    .send({
      username: 'root',
      password: 'sekret'
    })

  token = `Bearer ${response.body.token}`

  await Blog.deleteMany({})

  let blogObject = new Blog({ ...helper.initialBlogs[0], user: userSaved.id })
  await blogObject.save()

  blogObject = new Blog({ ...helper.initialBlogs[1], user: userSaved.id })
  await blogObject.save()
})

describe('when there is initially some blogs saved', () => {
  test('return 401 if assign a token validator', async () => {
    await api
      .get('/api/blogs')
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .set({ Authorization: token, Accept: 'application/json' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('id as identifier for the blogs', async () => {
    const response = await api
      .get('/api/blogs')
      .set({ Authorization: token, Accept: 'application/json' })
    expect(response.body[0].id).toBeDefined()
  })

  test('user for the blogs', async () => {
    const response = await api
      .get('/api/blogs')
      .set({ Authorization: token, Accept: 'application/json' })
    expect(response.body[0].user).toBeDefined()
  })
})

describe('addition of a new blog', () => {
  test('a valid blog can be added', async () => {
    const users = await User.find({})

    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      user: users[0].id
    }

    await api
      .post('/api/blogs')
      .set({ Authorization: token, Accept: 'application/json' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain('Canonical string reduction')

    const usernames = response.body.map(r => r.user.username)
    expect(usernames).toContain(users[0].username)
  })

  test('create and set the likes property to zero if not found', async () => {
    const users = await User.find({})

    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      user: users[0].id
    }

    const response = await api
      .post('/api/blogs')
      .set({ Authorization: token, Accept: 'application/json' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(0)
  })

  test('check if title and url properties are missing', async () => {
    const newBlog = {}
    await api
      .post('/api/blogs')
      .set({ Authorization: token, Accept: 'application/json' })
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })

  test('check if user properties are missing', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html'
    }
    await api
      .post('/api/blogs')
      .set({ Authorization: token, Accept: 'application/json' })
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: token, Accept: 'application/json' })
      .expect(204)

    const blogsAtEnd = await Blog.find({})

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('upteding of a blog', () => {
  test('succeeds updating blog if id is valid', async () => {
    const users = await User.find({})
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const updateBlog = {
      title: 'Diseño guiado por el dominio',
      author: 'Wikipedia',
      url: 'https://es.wikipedia.org/wiki/Dise%C3%B1o_guiado_por_el_dominio',
      likes: 12,
      user: users[0].id
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set({ Authorization: token, Accept: 'application/json' })
      .send(updateBlog)
      .expect(200)

    const blogsAtEnd = await Blog.find({})
    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain(updateBlog.title)
  })

  test('return 401 status if user not is valid for blogs', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const updateBlog = {
      title: 'Diseño guiado por el dominio',
      author: 'Wikipedia',
      url: 'https://es.wikipedia.org/wiki/Dise%C3%B1o_guiado_por_el_dominio',
      likes: 12,
      user: '62d4c3e178bb07603f00fdf4'
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set({ Authorization: token, Accept: 'application/json' })
      .send(updateBlog)
      .expect(401)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    await Blog.findByIdAndRemove(blogToUpdate.id)

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set({ Authorization: token, Accept: 'application/json' })
      .expect(404)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
