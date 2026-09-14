const express = require('express')
const cors = require('cors')

const { MONGODB_URI, PORT } = require('./utils/config')
const { connectToDatabase } = require('./utils/mongo')
const Blog = require('./models/blog')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

connectToDatabase(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})