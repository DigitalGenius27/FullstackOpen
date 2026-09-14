const { test, after, before, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const User = require('../models/user')
const Blog = require('../models/blog')
const app = require('../index')

const { connectToDatabase } = require('../utils/mongo')
const { MONGODB_URI } = require('../utils/config')

const api = supertest(app)

let token = null

const initialBlogs = [
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  }
]

before(async () => {
  await connectToDatabase(MONGODB_URI)
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('password123', 10)

  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash
  })

  const savedUser = await user.save()

  const blogsWithUser = initialBlogs.map(blog => ({
    ...blog,
    user: savedUser._id
  }))

  await Blog.insertMany(blogsWithUser)

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  token = loginResponse.body.token
})

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, initialBlogs.length)
  })
})

describe('POST /api/blogs', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Testing with SuperTest',
      author: 'Noel',
      url: 'https://example.com/testing',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    assert.strictEqual(
      response.body.length,
      initialBlogs.length + 1
    )

    const titles = response.body.map(blog => blog.title)

    assert(titles.includes('Testing with SuperTest'))
  })

  test('likes defaults to 0 if missing', async () => {
    const newBlog = {
      title: 'Blog without likes',
      author: 'Noel',
      url: 'https://example.com/no-likes'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('missing title or url returns 400', async () => {
    const blogWithoutTitle = {
      author: 'Noel',
      url: 'https://example.com/no-title',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutTitle)
      .expect(400)

    const blogWithoutUrl = {
      title: 'No URL',
      author: 'Noel',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutUrl)
      .expect(400)
  })
})

describe('DELETE /api/blogs/:id', () => {
  test('a blog can be deleted', async () => {
    const response = await api.get('/api/blogs')
    const blogToDelete = response.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAfterDelete = await api.get('/api/blogs')

    assert.strictEqual(
      blogsAfterDelete.body.length,
      initialBlogs.length - 1
    )

    const ids = blogsAfterDelete.body.map(blog => blog.id)

    assert(!ids.includes(blogToDelete.id))
  })
})

describe('PUT /api/blogs/:id', () => {
  test('a blog can be updated', async () => {
    const response = await api.get('/api/blogs')
    const blogToUpdate = response.body[0]

    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1
    }

    const result = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(
      result.body.likes,
      blogToUpdate.likes + 1
    )
  })
})

test('adding a blog fails with 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Unauthorized blog',
    author: 'Noel',
    url: 'https://example.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

after(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
})