exports.getPrivateData = (request, response, next) => {
    response.status(200).json({
        success: true,
        data: 'Access granted to this route',
    });
};
