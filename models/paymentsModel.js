import mongoose, { type Schema, type Document } from "mongoose"

interface IPayment extends Document {
  user: Schema.Types.ObjectId
  Amt?: number
  ItemDesc?: string
  TradeNo?: string
  MerchantOrderNo: string
  PaymentType?: string
  PayTime?: Date
}

// 建立 Schema
const paymentsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "請填寫訂閱者 ID"]
    },
    // 交易金額
    Amt: {
      type: Number
    },
    // 交易項目
    ItemDesc: {
      type: String
    },
    // 藍新金流交易序
    TradeNo: {
      type: String
    },
    // 商店訂單編號
    MerchantOrderNo: {
      type: String,
      required: true
    },
    // 付款方式
    PaymentType: {
      type: String
    },
    // 付款時間
    PayTime: {
      type: Date
    },
    // 付款狀態
    isPaid: {
      type: Boolean,
      default: false
    },
    // 建立時間
    createdAt: {
      type: Date,
      default: Date.now
    },
    // 更新時間
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
)

// eslint-disable-next-line
paymentsSchema.pre(/^find/, function (this: mongoose.Query<any, any, any, any>, next) {
  this.populate({
    path: "user",
    select: "id name createdAt"
  })
  next()
})

export default mongoose.model<IPayment>("Payment", paymentsSchema)
