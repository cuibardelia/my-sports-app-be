require('dotenv').config({path: './config/.env'});

const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

const Client = require('../schemas/Client');
const Trainer = require('../schemas/Trainer');
const Admin = require('../schemas/Admin');
const { getUserSecret } = require('../utils/common');
const { getModel } = require('../utils/common');


const protect = async (request, response, next, model) => {
    let token;

    if(request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
        token = request.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('TOKEN: Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, getUserSecret(model));
        const user = await model.findById(decoded.id);

        if (!user) {
            return next(new ErrorResponse('TOKEN: User not found', 404));
        }

        request.user = user;

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

const protectUser = async (request, response, next) => {
    const userType = request.header('X-User-Type');

    const model = getModel(userType);

    await protect(request, response, next, model);
};

const protectAdmin = async (request, response, next) => {
    await protect(request, response, next, Admin);
};

const protectClient = async (request, response, next) => {
    await protect(request, response, next, Client);
};

const protectTrainer = async (request, response, next) => {
    await protect(request, response, next, Trainer);
};

module.exports = { protectAdmin, protectClient, protectTrainer, protectUser };