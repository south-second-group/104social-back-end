import express, {
  type Request,
  type Response,
  type NextFunction
} from "express"
import path from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"
import cors from "cors"
import dotenv from "dotenv"
import swaggerUI from "swagger-ui-express"
import passport from "passport"
import session from "express-session"
import { defaultMiddleware } from "@nlbridge/express"

import swaggerFile from "./swagger-output.json"
import { errorHandler } from "./service/handler"
import { type ExtendedError } from "./types/ExtendedError"
import testUsersRouter from "./routes/testUsers"
import uploadRouter from "./routes/upload"
import authRouter from "./routes/auth"
import setupPassport from "./service/passport"
import payment from "./routes/payment"

// 聊天機器人
import { createAiChat } from "@nlux/core"
import { createChatAdapter } from "@nlux/nlbridge"

const app = express()
dotenv.config({ path: "./.env" })

// 程式出現重大錯誤時
process.on("uncaughtException", err => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
  console.error("Uncaughted Exception！")
  console.error(err)
  process.exit(1)
})

// 連線 mongodb
require("./connections")

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// 載入設定檔
app.use(cors())
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use(
  session({
    secret: process.env.SESSIONSECRET ?? "dev",
    resave: false,
    saveUninitialized: false
  })
)
app.use(passport.initialize())
app.use(passport.session())
setupPassport(passport)

// 路由
app.use("/api/test/v1/user", testUsersRouter)
app.use("/upload", uploadRouter)
app.use("/auth", authRouter)
app.use("/payment", payment)

app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerFile))
// import '@nlux/themes/nova.css';

app.post("/chat-api", (req, res, next) => {
  const middleware = defaultMiddleware("openai", {
    apiKey: process.env.YOUR_OPENAI_API_KEY,
    chatModel: "gpt-3.5-turbo"
  })
  // 確保 middleware 是同步執行的
  Promise.resolve(middleware(req, res, next)).catch(next)
})

const nlbridgeAdapter = createChatAdapter()
  .withUrl("http://localhost:3000/chat-api")
const aiChat = createAiChat().withAdapter(nlbridgeAdapter)

app.get("/chat", (req, res) => {
  res.render("chat", {
    aiChat
  })
})

// 404 錯誤
app.use((req: Request, res: Response, _next: NextFunction) => {
  errorHandler(res, "無此網站路由", 404)
})

// production 環境錯誤
const resErrorProd = (error: ExtendedError, res: Response): void => {
  console.error("產品環境錯誤", error)
  if (error.isOperational ?? false) {
    errorHandler(res, error.message ?? "", error.statusCode)
  } else {
    errorHandler(res, "產品環境系統異常，請洽系統管理員", 500)
  }
}

//  develop 環境錯誤
function resErrorDev (err: ExtendedError, res: Response): void {
  console.error("開發環境錯誤", err)
  const statusCode = err.statusCode ?? 500
  const statusText = err.message ?? "開發環境錯誤"
  const stack = err.stack ?? ""

  errorHandler(res, statusText, statusCode, stack)
}

// 自訂錯誤處理，依照環境不同，回傳不同錯誤訊息
app.use(
  (error: ExtendedError, _req: Request, res: Response, _next: NextFunction) => {
    // dev
    if (process.env.NODE_ENV === "develop") {
      resErrorDev(error, res)
      return
    }

    // prod
    if (error.name === "ValidationError") {
      error.message = "資料欄位填寫錯誤，請重新輸入！"
      error.isOperational = true
      resErrorProd(error, res)
      return
    }

    // Handle 'Unexpected end of form' error
    if (error.message === "Unexpected end of form") {
      error.message = "沒有文件被上傳！"
      error.isOperational = true
      resErrorProd(error, res)
      return
    }

    resErrorProd(error, res)
  }
)

// 未捕捉到的 catch
process.on("unhandledRejection", (err, promise) => {
  console.error("未捕捉到的 rejection：", promise, "原因：", err)
})

export default app
