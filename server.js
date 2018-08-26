const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
const { update, revert } = require('./index')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' })
  }

  if (req.headers.authorization === `Token ${process.env.TOKEN}`) {
    console.log('Client connected:', req.connection.remoteAddress)
    next()
  } else {
    return res.status(401).json({ error: 'Unauthorized. Wrong token!' })
  }
})

app.post('/', (req, res) => {
  if (!req.body.type) {
    return res.status(400).json({ error: `Only parameter 'type' is allowed.` })
  }

  switch(req.body.type) {
  case 'UPDATE':
    update()
      .then((p) => {
        return res.json({ success: 'Date updated.', path: p })
      })
      .catch((error) => {
        return res.status(500).json({ error: error })
      })
    break
  case 'REVERT':
    revert()
      .then((p) => {
        return res.json({ success: 'Date reverted.', path: p })
      })
      .catch((error) => {
        return res.status(500).json({ error: error })
      })
    break
  default:
    return res.status(400).json({ error: `Only type 'UPDATE' or 'REVERT' is allowed.` })
  }
})

const listener = app.listen(3000, () => {
  console.log('Server listening on port', listener.address().port)
})
