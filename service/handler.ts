import { Response } from 'express';

export const successHandler = (res: Response, message: string, data: object = {}, statusCode: number = 200) => {
    res.status(statusCode).json({
        status: "success",
        message: message,
        data: data
    });
}

export const errorHandler = (res: Response, message: string, statusCode: number = 400, status: string = "false") => {
    res.status(statusCode).json({
        status: status,
        message: message
    });
}