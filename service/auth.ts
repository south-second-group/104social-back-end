import { type Request, type Response, type NextFunction } from "express"

import appError from "../service/appError"
import handleErrorAsync from "../service/handleErrorAsync"
import { successHandler } from "../service/handler"
import jwt, { type Secret } from "jsonwebtoken"
import { type UserInterface } from "../types/user"

import User from "../models/testUsersModel"

declare module "express-serve-static-core" {
  interface Request {
    user?: UserInterface
  }
}

// 檢查 token 是否存在
export const checkAuth = handleErrorAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const JWT_SECRET = process.env.JWT_SECRET as Secret
    let token: string | undefined
    const auth = req.headers.authorization

    if (auth !== undefined && auth !== null && auth !== "" && auth.startsWith("Bearer")) {
      token = auth.split(" ")[1]
    }

    if (token === null || token === "" || token === undefined) {
      appError("驗證失敗，請重新登入", 401, next)
      return
    }

    try {
      const decode = jwt.verify(token, JWT_SECRET) as { id: string }
      const currentUser = await User.findById(decode.id)
      if (currentUser === null || currentUser === undefined) {
        throw new Error("User not found")
      }
      req.user = {
        _id: currentUser._id.toString(),
        name: currentUser.name,
        gender: currentUser.gender,
        photo: currentUser.photo ?? "",
        password: currentUser.password
      }
      next()
    } catch (error) {
      appError("驗證失敗，請重新登入", 401, next)
    }
  }
)

// 產生 JWT token
export const generateSendJWT = (res: Response, message: string, user: UserInterface): void => {
  const JWT_SECRET = process.env.JWT_SECRET as Secret
  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY
  })

  user.password = undefined

  const data = {
    token,
    profile: {
      _id: user._id,
      name: user.name,
      gender: user.gender,
      photo: user.photo
    }
  }

  successHandler(res, message, data)
}
