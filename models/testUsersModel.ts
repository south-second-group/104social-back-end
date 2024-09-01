import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    googleId: String,
    lineUserId: String,
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
      default: "https://firebasestorage.googleapis.com/v0/b/social-back-end.appspot.com/o/images%2Fyahoo%2Favatars%2FdefaultAvatar.webp?alt=media&token=578478f0-fd5d-4790-aa9b-a60e87a304c6"
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
    onlineStatus: {
      type: String,
      default: "offline",
      enum: {
        values: ["online", "offline", "busy"],
        message: "狀態格式不正確"
      }
    },
    messageBoard: {
      type: String,
      default: ""
    },
    friendList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FriendList"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
)

const User = mongoose.model("User", userSchema)

export default User
