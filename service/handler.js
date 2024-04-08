const successHandler = (res, message, data = {}, statusCode = 200) => {
    res.status(statusCode).json({
        status: "success",
        message: message,
        data: data
    });
}

const errorHandler = (res, message, statusCode = 400, status = "false") => {
    res.status(statusCode).json({
        status: status,
        message: message
    });
}

module.exports = { successHandler, errorHandler };