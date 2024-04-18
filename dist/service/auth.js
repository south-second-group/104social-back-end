"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSendJWT = exports.checkAuth = void 0;
const appError_1 = __importDefault(require("../service/appError"));
const handleErrorAsync_1 = __importDefault(require("../service/handleErrorAsync"));
const handler_1 = require("../service/handler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const testUsersModel_1 = __importDefault(require("../models/testUsersModel"));
// 檢查 token 是否存在
exports.checkAuth = (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const JWT_SECRET = process.env.JWT_SECRET;
    let token;
    const auth = req.headers.authorization;
    if (auth !== undefined && auth !== null && auth !== "" && auth.startsWith("Bearer")) {
        token = auth.split(" ")[1];
    }
    if (token === null || token === "" || token === undefined) {
        (0, appError_1.default)("驗證失敗，請重新登入", 401, next);
        return;
    }
    try {
        const decode = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const currentUser = yield testUsersModel_1.default.findById(decode.id);
        if (currentUser === null || currentUser === undefined) {
            throw new Error("User not found");
        }
        req.user = {
            _id: currentUser._id.toString(),
            name: currentUser.name,
            gender: currentUser.gender,
            photo: (_a = currentUser.photo) !== null && _a !== void 0 ? _a : "",
            password: currentUser.password
        };
        next();
    }
    catch (error) {
        (0, appError_1.default)("驗證失敗，請重新登入", 401, next);
    }
}));
// 產生 JWT token
const generateSendJWT = (res, message, user) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY
    });
    user.password = undefined;
    const data = {
        token,
        profile: {
            _id: user._id,
            name: user.name,
            gender: user.gender,
            photo: user.photo
        }
    };
    (0, handler_1.successHandler)(res, message, data);
};
exports.generateSendJWT = generateSendJWT;
