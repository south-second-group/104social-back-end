export interface Error {
  statusCode?: number
  statusText?: string
  stack?: string
  name?: string
  message?: string | undefined
  isOperational?: boolean
}
