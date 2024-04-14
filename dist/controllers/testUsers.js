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
const handleErrorAsync_1 = __importDefault(require("../service/handleErrorAsync"));
const handler_1 = require("../service/handler");
const appError_1 = __importDefault(require("../service/appError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = __importDefault(require("validator"));
const auth_1 = require("../service/auth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './config.env' });
const testUsersModel_1 = __importDefault(require("../models/testUsersModel"));
const users = {
    register: (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { name, email, photo, gender, password, confirmPassword } = req.body;
        if (!name || !email || !password || !confirmPassword) {
            return (0, appError_1.default)('欄位未填寫完整', 400, next);
        }
        const errorMessageArr = [];
        if (!validator_1.default.isLength(name, { min: 6 })) {
            errorMessageArr.push('暱稱至少 6 字元以上');
        }
        if (password !== confirmPassword) {
            errorMessageArr.push('密碼不一致');
        }
        if (!validator_1.default.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 0,
            minNumbers: 1,
            minSymbols: 0,
        })) {
            errorMessageArr.push('密碼長度必須超過 8 碼，並英數混合');
        }
        if (!validator_1.default.isEmail(email)) {
            errorMessageArr.push('email 格式不正確');
        }
        // 組合錯誤訊息
        if (errorMessageArr.length > 0) {
            const errorMessage = errorMessageArr.join('、');
            return (0, appError_1.default)(errorMessage, 400, next);
        }
        // 檢查 email 是否已註冊
        const findUserByMail = yield testUsersModel_1.default.findOne({ email });
        if (findUserByMail) {
            return (0, appError_1.default)('email 已註冊', 400, next);
        }
        // 建立新使用者
        password = yield bcryptjs_1.default.hash(password, 11);
        const data = { name, email, password, photo, gender };
        yield testUsersModel_1.default.create(data);
        (0, handler_1.successHandler)(res, '註冊成功，請重新登入', {}, 201);
    })),
    login: (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { email, password } = req.body;
        if (!email || !password) {
            return (0, appError_1.default)('帳號及密碼必填', 400, next);
        }
        // 檢查使用者是否存在
        const user = yield testUsersModel_1.default.findOne({ email }).select('+password');
        if (!user) {
            return (0, appError_1.default)('帳號錯誤或尚未註冊', 400, next);
        }
        // 檢查密碼是否正確
        const isVerify = yield bcryptjs_1.default.compare(password, user.password);
        if (!isVerify) {
            return (0, appError_1.default)('您的密碼不正確', 400, next);
        }
        (0, auth_1.generateSendJWT)(res, '登入成功', user);
    })),
    getOwnProfile: (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        (0, handler_1.successHandler)(res, '取得成功', req.user);
    })),
};
exports.default = users;
