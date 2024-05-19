// import multer from "multer"
// import path from "path"

// const upload = multer({
//   limits: {
//     fileSize: 2 * 1024 * 1024
//   },
//   fileFilter (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
//     const ext = path.extname(file.originalname).toLowerCase()
//     if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
//       cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"))
//     }
//     cb(null, true)
//   }
// }).any()

// export default upload

import multer from "multer"
import path from "path"
import { type ExtendedError } from "../types/ExtendedError"

const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (file === null) {
      // ts錯誤 無法修復
      // const error: ExtendedError = new Error()
      // error.name = "檔案上傳失敗，請重新上傳。"
      // error.isOperational = true
      // cb(error)

      const error: Error = new Error("檔案上傳失敗，請重新上傳。")
      cb(error)

      // 相關改寫
      // const error = new Error() as ExtendedError // Use type assertion
      // error.name = "檔案上傳失敗，請重新上傳。"
      // error.isOperational = true
      // cb(error)

      // if (file === null) {
      //   const error: ExtendedError = new Error()
      //   if (error.name) { // Check if 'name' is defined before assigning
      //     error.name = "檔案上傳失敗，請重新上傳。"
      //   }
      //   error.isOperational = true
      //   cb(error)
      // }
    }

    const ext = path.extname(file.originalname).toLowerCase()
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      const error: Error = new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。")
      cb(error)
    }

    // 接受檔案
    cb(null, true)
  }
}).any()

export default upload
