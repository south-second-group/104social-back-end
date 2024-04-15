import { type NextFunction } from "express"

interface ExtendedError extends Error {
  statusCode?: number
  isOperational?: boolean
}

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
