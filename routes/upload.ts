import express from "express"
import { v4 as uuidv4 } from "uuid"
import { type GetSignedUrlConfig } from "@google-cloud/storage"
import tinify from "tinify"
import dotenv from "dotenv"

import appError from "../service/appError"
import handleErrorAsync from "../service/handleErrorAsync"
import firebaseAdmin from "../service/firebase"
import image from "../service/image"
import User from "../models/testUsersModel"
import { checkAuth } from "../service/auth"

const router = express.Router()
const bucket = firebaseAdmin.storage().bucket()
dotenv.config()

if (process.env.TINYPNG_API_KEY === null || process.env.TINYPNG_API_KEY === undefined) {
  throw new Error("TINYPNG_API_KEY is not defined in the environment variables")
}
tinify.key = process.env.TINYPNG_API_KEY

router.post("/profilePhoto", checkAuth, image, handleErrorAsync(async (req, res, _next) => {
  if (req.files === null) {
    appError("尚未上傳檔案", 400, _next)
    return
    // return _next(appError("尚未上傳檔案", 400, _next))
  }
  // 取得上傳的檔案資訊列表裡面的第一個檔案
  const file = (req.files as Express.Multer.File[])[0]

  // 透過 tinify 壓縮圖片
  tinify.fromBuffer(file.buffer).toBuffer(function (err, resultData) {
    if (err !== null && err !== undefined) {
      res.status(500).send("圖片壓縮失敗")
    }

    // 基於檔案的原始名稱建立一個 blob 物件
    const blob = bucket.file(`images/${uuidv4()}.${file.originalname.split(".").pop()}`)
    // 建立一個可以寫入 blob 的物件
    const blobStream = blob.createWriteStream()

    // 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
    blobStream.on("finish", () => {
      // 設定檔案的存取權限
      const config: GetSignedUrlConfig = {
        action: "read", // 權限
        expires: "12-31-2500" // 網址的有效期限
      }

      // 取得檔案的網址
      blob.getSignedUrl(config, (err, fileUrl) => {
        if (err !== null && err !== undefined) {
          res.status(500).send("無法取得檔案網址")
        } else {
          if (req.user?._id !== undefined && req.user._id !== null) {
            User.findByIdAndUpdate(req.user?._id, { photo: fileUrl }, {
              returnDocument: "after",
              runValidators: true
            }).then(updateUser => {
              if (updateUser !== null && updateUser !== undefined) {
                res.json({
                  status: "用戶頭像已更新",
                  src: fileUrl
                })
              }
            }).catch(() => {
              res.status(500).send("更新用戶照片失敗")
            })
          }
        }
      })
    })

    // 如果上傳過程中發生錯誤，會觸發 error 事件
    blobStream.on("error", () => {
      res.status(500).send("上傳失敗")
    })

    // 將檔案的 buffer 寫入 blobStream
    blobStream.end(resultData)
  })
}))
export default router
