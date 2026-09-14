const express = require('express')
const cors = require('cors')

const { MONGODB_URI, PORT } = require('./utils/config')
const { connectToDatabase } = require('./utils/mongo')
const Blog = require('./models/blog')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({})

  response.json(blogs)
})

app.post('/api/blogs', async (request, response) => {
  const blog = new Blog(request.body)

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
  }

  next(error)
}

app.use(errorHandler)

if (require.main === module) {
  connectToDatabase(MONGODB_URI).then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
}

module.exports = app