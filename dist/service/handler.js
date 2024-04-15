"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.successHandler = void 0;
const successHandler = (res, message, data = {}, statusCode = 200) => {
    res.status(statusCode).json({
        status: "success",
        message,
        data
    });
};
exports.successHandler = successHandler;
const errorHandler = (res, message, statusCode = 400, status = "false") => {
    res.status(statusCode).json({
        status,
        message
    });
};
exports.errorHandler = errorHandler;
