import { type NextFunction } from "express"
import { type ExtendedError } from "../types/ExtendedError"

const appError = (
  message: string,
  statusCode: number,
  next: NextFunction
): void => {
  const error: ExtendedError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  next(error)
}

export default appError
