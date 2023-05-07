require('dotenv').config({path: "./config/.env"});

const jwt = require('jsonwebtoken');
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

       const client = Client.findById(decoded.id);

       if(!client) {
            return next(new ErrorResponse("Client not found", 404));
       }

       request.client = client;

       next();
    } catch (err) {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }
}