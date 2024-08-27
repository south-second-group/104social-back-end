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
      await generateSendJWT(
        res,
        "登入成功",
        req.user, true
      )
    } else {
      appError("Google 認證錯誤", 401, _next)
    }
  })
)
router.post("/lineLogin",
  /**
     * #swagger.tags = ['line']
     * #swagger.description = 'line 登入'
     * #swagger.parameters['body'] = {
            in: 'body',
            type: 'object',
            required: true,
            description: '資料格式',
            schema: {
                $lineUserId: 'fnuwe242352on52j3n',
                $lineDisplayName: 'test',
                $linePictureUrl: '11111111',
                $statusMessage: 'test'
            }
        }
     * #swagger.responses[200] = {
            description: '登入資訊',
            schema: {
                "status": "success",
                "message": "登入成功",
                "data": {
                    }
                }
            }
        }
     */
  authController.line.login)

export default router
