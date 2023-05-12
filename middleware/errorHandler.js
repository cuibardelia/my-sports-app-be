const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (error, request, response, next) => {
    let err = { ...error };
    err.message = error.message;

    console.log(error);

    if(error.code === 11000) {
        const message = `Duplicate Field Value Enter`;
        err = new ErrorResponse(message, 400);
    }

    if(error.name === 'ValidationError') {
        const message = Object.values(error.errors).map((val) => val.message);
        err = new ErrorResponse(message, 400);
    }

    response.status(err.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
}

module.exports = errorHandler;