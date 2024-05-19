export interface ExtendedError {
  statusCode?: number
  statusText?: string
  stack?: string
  name?: string | undefined
  message?: string | undefined
  isOperational?: boolean
}
