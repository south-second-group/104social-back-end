import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    onlineStatus: {
      type: String,
      default: "offline",
      enum: {
        values: ["online", "offline", "busy"],
        message: "狀態格式不正確"
      }
    },
    name: {
      type: String,
      required: [true, "請輸入您的名字"]
    },
    email: {
      type: String,
      required: [true, "請輸入您的 Email"],
      unique: true,
      lowercase: true,
      select: false
    },
    photo: {
      type: String,
      default: "https://firebasestorage.googleapis.com/v0/b/social-back-end.appspot.com/o/images%2FdefaultAvatar.png?alt=media&token=0552f8e8-de22-4037-8665-417639ee994e"
    },
    gender: {
      type: String,
      required: [true, "請選擇您的性別"],
      enum: {
        values: ["female", "male", "secret"],
        message: "性別格式不正確"
      }
    },
    password: {
      type: String,
      required: [true, "請輸入您的密碼"],
      minlength: 8,
      select: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    googleId: String
  },
  {
    versionKey: false
  }
)

const User = mongoose.model("User", userSchema)

export default User
