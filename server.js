const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const app = require('./app')
const CONFIG = require('./config')
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(CONFIG.PORT, () =>
    console.log(`[INFO] : App listening at http://localhost:${CONFIG.PORT}`)
)
