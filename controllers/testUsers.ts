import { type Request, type Response, type NextFunction } from "express"
import validator from "validator"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import handleErrorAsync from "../service/handleErrorAsync"
import appError from "../service/appError"
import { successHandler } from "../service/handler"
import { generateSendJWT } from "../service/auth"
import { type UserInterface } from "../types/user"

import User from "../models/testUsersModel"

dotenv.config({ path: "./config.env" })

declare module "express-serve-static-core" {
  interface Request {
    user?: UserInterface
  }
}

const users = {
  register: handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let { name, email, photo, gender, password, confirmPassword } = req.body

      if (typeof name !== "string" || name === "" ||
    typeof email !== "string" || email === "" ||
    typeof password !== "string" || password === "" ||
    typeof confirmPassword !== "string" || confirmPassword === "") {
        appError("欄位未填寫完整", 400, next)
        return
      }

      const errorMessageArr = []

      if (!validator.isLength(name, { min: 6 })) {
        errorMessageArr.push("暱稱至少 6 字元以上")
      }
      if (password !== confirmPassword) {
        errorMessageArr.push("密碼不一致")
      }
      if (
        !validator.isStrongPassword(password, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 0,
          minNumbers: 1,
          minSymbols: 0
        })
      ) {
        errorMessageArr.push("密碼長度必須超過 8 碼，並英數混合")
      }
      if (!validator.isEmail(email)) {
        errorMessageArr.push("email 格式不正確")
      }

      // 組合錯誤訊息
      if (errorMessageArr.length > 0) {
        const errorMessage = errorMessageArr.join("、")
        appError(errorMessage, 400, next); return
      }

      // 檢查 email 是否已註冊
      const findUserByMail = await User.findOne({ email })
      if (findUserByMail !== null) {
        appError("email 已註冊", 400, next)
        return
      }

      // 建立新使用者
      password = await bcrypt.hash(password, 11)
      const data = { name, email, password, photo, gender }
      await User.create(data)

      successHandler(res, "註冊成功，請重新登入", {}, 201)
    }
  ),
  login: handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body

      if (email === undefined || email === "" || password === undefined || password === "") {
        appError("帳號及密碼必填", 400, next); return
      }

      // 檢查使用者是否存在
      const user = await User.findOne({ email }).select("+password")
      if (user === null) {
        appError("帳號錯誤或尚未註冊", 400, next); return
      }

      // 檢查密碼是否正確
      const passwordStr = typeof password === "string" ? password : ""
      const userPasswordStr = typeof user.password === "string" ? user.password : ""
      const isVerify = await bcrypt.compare(passwordStr, userPasswordStr)
      if (!isVerify) {
        appError("您的密碼不正確", 400, next); return
      }

      generateSendJWT(res, "登入成功", user.toObject() as UserInterface)
    }
  ),
  getOwnProfile: handleErrorAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      successHandler(res, "取得成功", req.user)
    }
  ),
  patchProfile: handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, photo, gender } = req.body
    const data = { name, photo, gender }

    if (name === "") {
      appError("名稱必填", 400, next); return
    }
    if (req.user?._id !== undefined && req.user._id !== null) {
      const updateUser = await User.findByIdAndUpdate(req.user._id, data, {
        returnDocument: "after",
        runValidators: true
      })

      if (updateUser !== null && updateUser !== undefined) {
        successHandler(res, "更新成功", updateUser)
      }
    }
  })
}

export default users
