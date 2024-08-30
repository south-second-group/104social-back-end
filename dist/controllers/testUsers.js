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
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const handleErrorAsync_1 = __importDefault(require("../service/handleErrorAsync"));
const appError_1 = __importDefault(require("../service/appError"));
const handler_1 = require("../service/handler");
const auth_1 = require("../service/auth");
const testUsersModel_1 = __importDefault(require("../models/testUsersModel"));
dotenv_1.default.config({ path: "./config.env" });
const users = {
    register: (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let { name, email, gender, password, confirmPassword } = req.body;
        if (typeof name !== "string" || name === "" ||
            typeof email !== "string" || email === "" ||
            typeof password !== "string" || password === "" ||
            typeof confirmPassword !== "string" || confirmPassword === "") {
            (0, appError_1.default)("欄位未填寫完整", 400, next);
            return;
        }
        const errorMessageArr = [];
        if (!validator_1.default.isLength(name, { min: 6 })) {
            errorMessageArr.push("暱稱至少 6 字元以上");
        }
        if (password !== confirmPassword) {
            errorMessageArr.push("密碼不一致");
        }
        if (!validator_1.default.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 0,
            minNumbers: 1,
            minSymbols: 0
        })) {
            errorMessageArr.push("密碼長度必須超過 8 碼，並英數混合");
        }
        if (!validator_1.default.isEmail(email)) {
            errorMessageArr.push("email 格式不正確");
        }
        // 組合錯誤訊息
        if (errorMessageArr.length > 0) {
            const errorMessage = errorMessageArr.join("、");
            (0, appError_1.default)(errorMessage, 400, next);
            return;
        }
        // 檢查 email 是否已註冊
        const findUserByMail = yield testUsersModel_1.default.findOne({ email });
        if (findUserByMail !== null) {
            (0, appError_1.default)("email信箱 已註冊", 400, next);
            return;
        }
        // 建立新使用者
        password = yield bcryptjs_1.default.hash(password, 11);
        const data = { name, email, password, gender };
        yield testUsersModel_1.default.create(data);
        (0, handler_1.successHandler)(res, "註冊成功，請重新登入", {}, 201);
    })),
    login: (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (email === undefined || email === "" || password === undefined || password === "") {
            (0, appError_1.default)("帳號及密碼必填", 400, next);
            return;
        }
        // 檢查使用者是否存在
        const user = yield testUsersModel_1.default.findOne({ email }).select("+password");
        if (user === null) {
            (0, appError_1.default)("帳號錯誤或尚未註冊", 400, next);
            return;
        }
        // 檢查密碼是否正確
        const passwordStr = typeof password === "string" ? password : "";
        const userPasswordStr = typeof user.password === "string" ? user.password : "";
        const isVerify = yield bcryptjs_1.default.compare(passwordStr, userPasswordStr);
        if (!isVerify) {
            (0, appError_1.default)("您的密碼不正確", 400, next);
            return;
        }
        yield (0, auth_1.generateSendJWT)(res, "登入成功", user.toObject());
    })),
    getOwnProfile: (0, handleErrorAsync_1.default)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const result = yield testUsersModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        (0, handler_1.successHandler)(res, "取得成功", result === null || result === void 0 ? void 0 : result.toObject());
    })),
    patchProfile: (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const { onlineStatus, name, gender, messageBoard } = req.body;
        const data = { onlineStatus, name, gender, messageBoard };
        if (name === "") {
            (0, appError_1.default)("名稱必填", 400, next);
            return;
        }
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) !== undefined && req.user._id !== null) {
            const updateUser = yield testUsersModel_1.default.findByIdAndUpdate(req.user._id, data, {
                returnDocument: "after",
                runValidators: true
            });
            if (updateUser !== null && updateUser !== undefined) {
                (0, handler_1.successHandler)(res, "更新成功", updateUser);
            }
        }
    }))
};
exports.default = users;
