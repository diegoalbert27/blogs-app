const dummy = (blogs) => {
  return blogs ? 1 : 0
}

const totalLikes = (blogs) => {
  return blogs
    .map(blog => blog.likes)
    .reduce((p, like) => p + like, 0)
}

const favoriteBlog = (blogs) => {
  const likesBlog = blogs.map(blog => blog.likes)
  const maxLiked = Math.max(...likesBlog)
  const { title, author, likes } = blogs[blogs.findIndex(blog => blog.likes === maxLiked)]
  return { title, author, likes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
