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

    // 從 cookie 中取得 token
    token = req.cookies["104social_token"]

    if (
      auth !== undefined &&
      auth !== null &&
      auth !== "" &&
      auth.startsWith("Bearer")
    ) {
      token = auth.split(" ")[1]
    }

    if (token === null || token === "" || token === undefined) {
      appError("驗證失敗，請重新登入", 401, next)
      return
    }

    try {
      const decode = jwt.verify(token, JWT_SECRET) as { id: string }
      const currentUser: UserInterface | null = await User.findById(decode.id)

      if (currentUser === null || currentUser === undefined) {
        throw new Error("User not found")
      }
      req.user = {
        _id: currentUser._id.toString(),
        name: currentUser.name,
        gender: currentUser.gender ?? "secret",
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
export const generateSendJWT = async (
  res: Response,
  message: string,
  user: UserInterface,
  isThirdPartyLogin: boolean = false
): Promise<string> => {
  const JWT_SECRET = process.env.JWT_SECRET as Secret
  const token = jwt.sign({ id: user._id, name: user.name, photo: user.photo }, JWT_SECRET, {
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

  if (isThirdPartyLogin) {
    res.redirect(`${process.env.FRONTEND_REDIRECT_URL}/callback?token=${token}&name=${user.name}&photo=${user.photo}`)
  } else {
    res.cookie("104social_token", token, { httpOnly: false, secure: false })
    successHandler(res, message, data)
  }

  return token
}
