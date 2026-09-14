const mongoose = require('mongoose')

const connectToDatabase = async url => {
  await mongoose.connect(url)
  console.log('connected to MongoDB')
}

module.exports = { connectToDatabase }