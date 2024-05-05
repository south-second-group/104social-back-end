import { type Request, type Response, type NextFunction } from "express"

// 定義一個類型，表示一個非同步函數，接受 Express 的 req、res、next 並傳回 Promise
type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> // 假設這裡我們不期望func有返回值，因為它只處理

const handleErrorAsync = (func: AsyncFunction) => {
  return function (req: Request, res: Response, next: NextFunction): void {
    func(req, res, next).catch((err: Error) => {
      next(err) // 錯誤被捕獲後，使用next將錯誤傳遞出去
    })
  }
}

export default handleErrorAsync
