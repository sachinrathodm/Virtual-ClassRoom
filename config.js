module.exports = {
    mongoUri:
        process.env.MONGO_URI ||
        'mongodb+srv://sachin:nTZy6dZasIKu2k89@cluster0.btos3.mongodb.net/virtualclass?retryWrites=true&w=majority',
    PORT: process.env.PORT || 3000,
}
