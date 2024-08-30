"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
        default: "https://firebasestorage.googleapis.com/v0/b/social-back-end.appspot.com/o/images%2FdefaultAvatar.webp?alt=media&token=4c860c6c-2279-4f2f-ae6e-65bd0f9dd34a"
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
        default: "留下心情或分享連結..."
    },
    friendList: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "FriendList"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
