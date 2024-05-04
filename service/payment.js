import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config({ path: "./.env" })

const { MerchantID, RespondType, HASHKEY, HASHIV, Version } = process.env

function genDataChain (order: any): string {
  return `MerchantID=${MerchantID}&RespondType=${RespondType}&TimeStamp=${
    order.TimeStamp
  }&Version=${Version}&MerchantOrderNo=${order.MerchantOrderNo}&Amt=${
    order.Amt
  }&ItemDesc=${encodeURIComponent(order.ItemDesc)}&Email=${encodeURIComponent(
    order.Email
  )}`
}

function createMpgAesEncrypt (tradeInfo: any): string {
  const encrypt = crypto.createCipheriv("aes256", HASHKEY, HASHIV)
  const enc = encrypt.update(genDataChain(tradeInfo), "utf8", "hex")
  return enc + encrypt.final("hex")
}

function createMpgShaEncrypt (aesEncrypt: string): string {
  const sha = crypto.createHash("sha256")
  const plainText = `HashKey=${HASHKEY}&${aesEncrypt}&HashIV=${HASHIV}`
  return sha.update(plainText).digest("hex").toUpperCase()
}

function createMpgAesDecrypt (tradeInfo: any): any {
  const decrypt = crypto.createDecipheriv("aes256", HASHKEY, HASHIV)
  decrypt.setAutoPadding(false)
  const text = decrypt.update(tradeInfo, "hex", "utf8")
  const plainText = text + decrypt.final("utf8")
  const result = plainText.replace(/[\x00-\x20]+/g, "")
  return JSON.parse(result)
}

export {
  genDataChain,
  createMpgAesEncrypt,
  createMpgShaEncrypt,
  createMpgAesDecrypt
}
