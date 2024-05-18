import multer from "multer"
import path from "path"
import { type ExtendedError } from "./types/ExtendedError"

const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (file === null) {
      const error: ExtendedError = new Error("尚未上傳檔案")
      error.isOperational = true
      cb(error)
    }

    const ext = path.extname(file.originalname).toLowerCase()
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      const error: ExtendedError = new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。")
      error.isOperational = true
      cb(error)
    }

    // 接受檔案
    cb(null, true)
  }
}).any()

export default upload
