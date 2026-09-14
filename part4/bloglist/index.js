const express = require('express')
const cors = require('cors')

const { MONGODB_URI, PORT } = require('./utils/config')
const { connectToDatabase } = require('./utils/mongo')
const middleware = require('./utils/middleware')

const blogsRouter = require('./routes/blogs')
const usersRouter = require('./routes/users')
const loginRouter = require('./routes/login')

const app = express()

app.use(cors())
app.use(express.json())

app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
  }

  if (error.name === 'CastError') {
    return response.status(400).json({
      error: 'malformatted id'
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