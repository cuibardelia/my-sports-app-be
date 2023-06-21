require('dotenv').config({path: './config/.env'});
const express = require('express');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const clientRouter = require('./routes/client');
const trainerRouter = require('./routes/trainer');
const userRouter = require('./routes/user');

const cors = require('cors');

// Connect to Mongo
(async function() { await connectDB();}());

const app = express();

// middleware that allows us to get data from the body
app.use(express.json());
app.use(cors());

// redirect to routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/client', clientRouter);
app.use('/api/trainer', trainerRouter);
app.use('/api/user', userRouter);

// Error Handler - last in the middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running, right on port ${PORT}`)
})

process.on('unhandledRejection', (err, promise) => {
    console.log(`⚠ Error occurred: ${err}`);
    server.close(() => process.exit(1));
})
