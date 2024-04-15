import { type Request, type Response, type NextFunction } from "express"

const handleErrorAsync = (func: (req: Request, res: Response, next: NextFunction) => Promise<void>): ((req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((error: unknown) => {
      next(error)
    })
  }

export default handleErrorAsync
