import express from "express"

import { authController } from "../controllers/authController"
import handleErrorAsync from "../service/handleErrorAsync"
import appError from "../service/appError"
import { generateSendJWT } from "../service/auth"

const router = express.Router()

router.get("/google", (req, res, next) => {
  /**
   * #swagger.ignore = true
   */
  authController.google.auth(req, res, next)
})
router.get(
  "/google/callback",
  (req, res, next) => {
    authController.google.execCallback(req, res, next)
  },
  /**
   * #swagger.ignore = true
   */
  handleErrorAsync(async (req, res, _next) => {
    if (req.user !== null && req.user !== undefined) {
      const token: string | null = await generateSendJWT(
        res,
        "登入成功",
        req.user
      )

      // successHandler(res,"登入成功",req.user);
      // console.log("token", token)

      if (token === null) {
        appError("無生成 Token 的權限", 400, _next)
      }
    } else {
      appError("Google 認證錯誤", 401, _next)
    }
  })
)

export default router
