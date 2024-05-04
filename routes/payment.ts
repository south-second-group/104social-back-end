import express from "express"
import crypto from "crypto"
import dotenv from "dotenv"

const router = express.Router()
dotenv.config()

interface Result {
  MerchantOrderNo: string
}

interface Order {
  TimeStamp: number
  MerchantOrderNo: string
  Amt: number
  ItemDesc: string
  Email: string
  Result: Result
}

const orders: Record<number, Order> = {}

const {
  MerchantID,
  HASHKEY,
  HASHIV,
  Version,
  PayGateWay,
  NotifyUrl,
  ReturnUrl
} = process.env
const RespondType = "JSON"

// 建立訂單
router.get("/", function (req, res) {
  res.render("index", { title: "Express" })
})
router.post("/createOrder", (req, res) => {
  const data = req.body
  console.error(data)

  // 使用 Unix Timestamp 作為訂單編號（金流也需要加入時間戳記）
  const TimeStamp = Math.round(new Date().getTime() / 1000)
  const order = {
    ...data,
    TimeStamp,
    Amt: parseInt(String(data.Amt)),
    MerchantOrderNo: TimeStamp
  }

  // 進行訂單加密
  // 加密第一段字串，此段主要是提供交易內容給予藍新金流
  const aesEncrypt = createSesEncrypt(JSON.stringify(order))
  console.error("aesEncrypt:", aesEncrypt)

  // 使用 HASH 再次 SHA 加密字串，作為驗證使用
  const shaEncrypt = createShaEncrypt(aesEncrypt)
  console.error("shaEncrypt:", shaEncrypt)
  order.aesEncrypt = aesEncrypt
  order.shaEncrypt = shaEncrypt

  orders[TimeStamp] = order
  console.error(orders[TimeStamp])

  res.redirect(`/payment/check/${TimeStamp}`)
})

router.get("/check/:id", (req, res) => {
  const id = Number(req.params.id)
  const order = orders[id]
  console.error(order)
  res.render("check", {
    title: "Express",
    PayGateWay,
    Version,
    order,
    MerchantID,
    NotifyUrl,
    ReturnUrl
  })
})

// 交易成功：Return （可直接解密，將資料呈現在畫面上）
router.post("/newebpay_return", function (req, res) {
  console.error("req.body return data", req.body)
  res.render("success", { title: "Express" })
})

// 確認交易：Notify
router.post("/newebpay_notify", function (req, res) {
  console.error("req.body notify data", req.body)
  const response = req.body

  // 解密交易內容
  const data = createSesDecrypt(String(response.TradeInfo))
  console.error("data:", data)

  // Convert MerchantOrderNo to number
  const orderNo = Number(data?.Result?.MerchantOrderNo)

  // 取得交易內容，並查詢本地端資料庫是否有相符的訂單
  console.error(orders[orderNo])

  if (orders[orderNo] !== undefined) {
    console.error("找不到訂單")
    return res.end()
  }

  // 使用 HASH 再次 SHA 加密字串，確保比對一致（確保不正確的請求觸發交易成功）
  const thisShaEncrypt = createShaEncrypt(String(response.TradeInfo))
  if (thisShaEncrypt !== "") {
    console.error("付款失敗：TradeSha 不一致")
    return res.end()
  }

  // 交易完成，將成功資訊儲存於資料庫
  console.error("付款完成，訂單：", orders[orderNo])

  return res.end()
})

// 字串組合
function genDataChain (order: Order): string {
  if (typeof MerchantID === "undefined") {
    throw new Error("MerchantID is undefined")
  }

  return `MerchantID=${MerchantID}&TimeStamp=${order.TimeStamp
    }&Version=${Version}&RespondType=${RespondType}&MerchantOrderNo=${order.MerchantOrderNo
    }&Amt=${order.Amt}&NotifyURL=${encodeURIComponent(
      NotifyUrl ?? ""
    )}&ReturnURL=${encodeURIComponent(ReturnUrl ?? "")}&ItemDesc=${encodeURIComponent(
      order.ItemDesc
    )}&Email=${encodeURIComponent(order.Email)}`
}
// 對應文件 P17
// MerchantID=MS12345678&TimeStamp=1663040304&Version=2.0&RespondType=Stri
// ng&MerchantOrderNo=Vanespl_ec_1663040304&Amt=30&NotifyURL=https%3A%2F%2
// Fwebhook.site%2Fd4db5ad1-2278-466a-9d66-
// 78585c0dbadb&ReturnURL=&ItemDesc=test

// 對應文件 P17：使用 aes 加密
// $edata1=bin2hex(openssl_encrypt($data1, "AES-256-CBC", $key, OPENSSL_RAW_DATA, $iv));
function createSesEncrypt (TradeInfo: string): string {
  if (typeof HASHKEY === "undefined" || typeof HASHIV === "undefined") {
    throw new Error("HASHKEY or HASHIV is undefined")
  }

  const order: Order = JSON.parse(TradeInfo)
  const encrypt = crypto.createCipheriv("aes-256-cbc", HASHKEY, HASHIV)
  const enc = encrypt.update(genDataChain(order), "utf8", "hex")
  return enc + encrypt.final("hex")
}

// 對應文件 P18：使用 sha256 加密
// $hashs="HashKey=".$key."&".$edata1."&HashIV=".$iv;
function createShaEncrypt (aesEncrypt: string): string {
  const sha = crypto.createHash("sha256")
  const plainText = `HashKey=${HASHKEY}&${aesEncrypt}&HashIV=${HASHIV}`

  return sha.update(plainText).digest("hex").toUpperCase()
}

// 對應文件 21, 22 頁：將 aes 解密
function createSesDecrypt (TradeInfo: string): Order {
  if (typeof HASHKEY === "undefined" || typeof HASHIV === "undefined") {
    throw new Error("HASHKEY or HASHIV is undefined")
  }

  const decrypt = crypto.createDecipheriv("aes-256-cbc", HASHKEY, HASHIV)
  decrypt.setAutoPadding(false)
  const text = decrypt.update(TradeInfo, "hex", "utf8")
  const plainText = text + decrypt.final("utf8")
  // eslint-disable-next-line no-control-regex
  const result = plainText.replace(/[\x00-\x20]+/g, "")
  return JSON.parse(result)
}

export default router
