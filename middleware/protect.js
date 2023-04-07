require('dotenv').config({path: "./config/.env"});

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = async (request, response, next) => {
    let token;

    if(request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        token = request.headers.authorization.split(" ")[1];
    }

    if(!token) {
        return next(new ErrorResponse("Not Authorized to access this route", 401));
    }


    try{
       const decoded = jwt.verify(token, process.env.JWT_TOKEN);

       const user = User.findById(decoded.id);

       if(!user) {
            return next(new ErrorResponse("User not found", 404));
       }

       request.user = user;

       next();
    } catch (err) {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }
}