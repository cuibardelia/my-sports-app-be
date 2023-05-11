require('dotenv').config({path: "./config/.env"});

const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

const Client = require('../schemas/Client');
const Trainer = require('../schemas/Trainer');
const Admin = require('../schemas/Admin');

// Middleware to protect routes for admin users
const protectAdmin = async (request, response, next) => {
    let token;

    if(request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        token = request.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return next(new ErrorResponse('TOKEN: Admin not found', 404));
        }

        request.user = admin;

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

const protectClient = async (request, response, next) => {
    let token;

    if(request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        token = request.headers.authorization.split(" ")[1];
    }

    // TODO: check each token, set routes for each kind of user
    if(!token) {
        return next(new ErrorResponse("TOKEN: Not Authorized to access this route", 401));
    }

    try {
       const decoded = jwt.verify(token, process.env.JWT_CLIENT_SECRET);

       const client = await Client.findById(decoded.id);

       if(!client) {
            return next(new ErrorResponse("Client not found", 404));
       }

       request.user = client;

       next();
    } catch (err) {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }
}

const protectTrainer = async (request, response, next) => {
    let token;

    if(request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        token = request.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new ErrorResponse('TOKEN: Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_TRAINER_SECRET);

        const trainer = await Trainer.findById(decoded.id);

        if (!trainer) {
            return next(new ErrorResponse('Admin not found', 404));
        }

        request.user = trainer;

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

module.exports = { protectAdmin, protectClient, protectTrainer };