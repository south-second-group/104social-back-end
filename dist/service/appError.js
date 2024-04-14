"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appError = (message, statusCode, next) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    next(error);
};
exports.default = appError;
