import { type Request, type Response, type NextFunction } from "express"
import passport from "passport"
import bcrypt from "bcryptjs"

import handleErrorAsync from "../service/handleErrorAsync"
import appError from "../service/appError"
import User from "../models/testUsersModel"
// import { successHandler } from "../service/handler"
import { generateSendJWT } from "../service/auth"
import { type UserInterface } from "../types/user"

export const authController = {
  google: {
    auth: handleErrorAsync(async (req, res, next) => {
      passport.authenticate("google", {
        scope: ["profile", "email"]
      })(req, res, next)
    }),
    execCallback: handleErrorAsync(async (req, res, next) => {
      passport.authenticate(
        "google"
        // , { session: false } // session: false 會讓 req.user 為空
      )(req, res, next)
    })
  },
  line: {
    login: handleErrorAsync(
      async (req: Request, res: Response, next: NextFunction) => {
        const { lineUserId, lineDisplayName, linePictureUrl, statusMessage } = req.body

        if (typeof lineUserId !== "string" || lineUserId === "" || typeof lineDisplayName !== "string" || lineDisplayName === "" || typeof linePictureUrl !== "string" || linePictureUrl === "") {
          appError("請提供 lineUserId, lineDisplayName, linePictureUrl", 400, next); return
        }

        try {
          // 檢查使用者是否存在
          let user = await User.findOne({ lineUserId })

          if (user === null) {
            const randomPassword = Math.random().toString(36).slice(-8)
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(randomPassword, salt)

            user = await User.create({
              lineUserId,
              name: lineDisplayName,
              email: `${lineUserId}@line.com`,
              photo: linePictureUrl,
              messageBoard: statusMessage,
              gender: "secret",
              password: hash
            })
          }

          user = await User.findOne({ lineUserId }).select("-password")

          await generateSendJWT(res, "登入成功", user.toObject() as UserInterface)
        } catch (err) {
          console.error(err)
          appError("line 登入失敗，請重新登入", 401, next)
        }
      }
    )
  }
}
