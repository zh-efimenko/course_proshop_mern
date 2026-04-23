const proxy = require('http-proxy-middleware')

const target = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001'

module.exports = function (app) {
  app.use('/api', proxy({ target, changeOrigin: true }))
  app.use('/uploads', proxy({ target, changeOrigin: true }))
}