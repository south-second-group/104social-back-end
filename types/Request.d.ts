import { type UserInterface } from "../types/user"

// 無效，需使用檔案宣告
declare module "express-serve-static-core" {
  interface Request {
    user?: UserInterface
  }
}
