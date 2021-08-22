const mongoose = require('mongoose')
const { mongoUri } = require('../../config')

exports.connect = () => {
    // Connecting to the database
    mongoose
        .connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        })
        .then(() => {
            console.log(
                '[INFO] : Database Connection SUCCESS. MongoDB database Connected'
            )
        })
        .catch((error) => {
            console.log('database connection failed. exiting now...')
            console.error(error)
            process.exit(1)
        })
}
