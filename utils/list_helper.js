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

const mostBlogs = (blogs) => {
  const authors = blogs.map(blog => blog.author)
  const uniqueAuthors = authors.filter((author, i) => authors.indexOf(author) === i)
  return uniqueAuthors
    .map(author => {
      return {
        author,
        blogs: blogs.filter(blog => blog.author === author).length
      }
    })
    .reduce((max, author) => {
      if (author.blogs > max.blogs) {
        max = { ...author }
      }

      return max
    }, { blogs: 0 })
}

const mostLikes = (blogs) => {
  const authors = blogs.map(blog => blog.author)
  const uniqueAuthors = authors.filter((author, i) => authors.indexOf(author) === i)
  return uniqueAuthors
    .map(author => {
      return {
        author,
        likes: blogs
          .filter(blog => blog.author === author)
          .reduce((a, blog) => blog.likes + a, 0)
      }
    })
    .reduce((max, author) => {
      if (author.likes > max.likes) {
        max = { ...author }
      }

      return max
    }, { likes: 0 })
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
