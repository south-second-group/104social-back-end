import multer from "multer"
import path from "path"

const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"))
    }
    cb(null, true)
  }
}).any()

export default upload
