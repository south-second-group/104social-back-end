import { type Response } from "express"

export const successHandler = (res: Response, message: string, data: object = {}, statusCode: number = 200): void => {
  res.status(statusCode).json({
    statusCode,
    status: "success",
    message,
    data
  })
}

export const errorHandler = (res: Response, message: string, statusCode: number = 400, stack: string = ""): void => {
  res.status(statusCode).json({
    statusCode,
    status: "error",
    message,
    stack
  })
}
