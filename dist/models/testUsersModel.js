"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
    photo: String,
    gender: {
        type: String,
        required: [false, "請選擇您的性別"],
        enum: {
            values: ["female", "male", ""],
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
}, {
    versionKey: false
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
