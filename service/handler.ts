import { type Response } from "express"

export const successHandler = (res: Response, message: string, data: object = {}, statusCode: number = 200): void => {
  res.status(statusCode).json({
    status: "success",
    message,
    data
  })
}

export const errorHandler = (res: Response, message: string, statusCode: number = 400, status: string = "false"): void => {
  res.status(statusCode).json({
    status,
    message
  })
}
