export interface ExtendedError {
  statusCode?: number
  statusText?: string
  stack?: string
  name?: string
  message?: string | undefined
  isOperational?: boolean
}
