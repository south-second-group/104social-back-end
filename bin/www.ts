#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from "../app"
import debugModule from "debug"
import http from "http"
import wss1 from "../service/ws"
import { type WebSocket as WSWebSocket } from "ws"
import { URL } from "url"
const debug = debugModule("104social:server")

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT ?? "3005")
app.set("port", port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

server.on("upgrade", function upgrade (request, socket, head) {
  const { pathname = "" } = new URL(request.url ?? "", "http://localhost")

  if (pathname === "/ws") {
    wss1.handleUpgrade(request, socket, head, function done (ws: WSWebSocket) {
      wss1.emit("connection", ws, request)
    })
  } else {
    socket.destroy()
  }
})

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on("error", onError)
server.on("listening", onListening)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val: string): number | string | boolean {
  const port = parseInt(val, 10)
  if (isNaN(port)) {
    // named pipe
    return val
  }
  if (port >= 0) {
    // port number
    return port
  }
  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") {
    throw error
  }
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case "EADDRINUSE":
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening (): void {
  const addr = server.address()
  const bind =
    typeof addr === "string"
      ? "pipe " + addr
      : addr === null
        ? "null"
        : "http://localhost:" + addr.port
  debug("Listening on " + bind)
  console.warn("---------------------------------------")
  console.warn("| Listening on  " + bind + " |")
  console.warn("---------------------------------------")
}
