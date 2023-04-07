require('dotenv').config({path: "./config/.env"});
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to Mongo
connectDB();

const app = express();

// middleware that allows use to get data from the body
app.use(express.json());

// redirect to routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/private', require('./routes/private'));

// Error Handler - last in the middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running, right on port ${PORT}`)
})

process.on("unhandledRejection", (err, promise) => {
    console.log(`⚠ Error occurred: ${err}`);
    server.close(() => process.exit(1));
})
