const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((favorite, blog) =>
    blog.likes > favorite.likes ? blog : favorite
  )
}

const mostBlogs = (blogs) => {
  const counts = {}

  blogs.forEach(blog => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })

  const [author, blogsCount] = Object.entries(counts)
    .reduce((most, current) =>
      current[1] > most[1] ? current : most
    )

  return {
    author,
    blogs: blogsCount
  }
}

const mostLikes = (blogs) => {
  const likes = {}

  blogs.forEach(blog => {
    likes[blog.author] = (likes[blog.author] || 0) + blog.likes
  })

  const [author, total] = Object.entries(likes)
    .reduce((most, current) =>
      current[1] > most[1] ? current : most
    )

  return {
    author,
    likes: total
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}