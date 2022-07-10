const app = require('./app') // la aplicación Express real
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const PORT = config.PORT

const server = http.createServer(app)

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
