const mongoose = require('mongoose');

const connectDB = async() => {
    await mongoose.connect(process.env.MONGO_URI, {
        // useFindAndModify: true,
        // considered false?
    });

    console.log("fitbudb: mongo connected");
};

module.exports = {
    connectDB,
    getConnection: () => mongoose.connection,
};