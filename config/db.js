const mongoose = require('mongoose');

const connectDB = async() => {
    await mongoose.connect(process.env.MONGO_URI, {
        // useFindAndModify: true,
        // considered false?
    });

    console.log("mongo connected");
};

module.exports = connectDB;
