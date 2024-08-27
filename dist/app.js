"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const express_2 = require("@nlbridge/express");
const swagger_output_json_1 = __importDefault(require("./swagger-output.json"));
const handler_1 = require("./service/handler");
const testUsers_1 = __importDefault(require("./routes/testUsers"));
const upload_1 = __importDefault(require("./routes/upload"));
const auth_1 = __importDefault(require("./routes/auth"));
const passport_2 = __importDefault(require("./service/passport"));
const payment_1 = __importDefault(require("./routes/payment"));
const friendList_1 = __importDefault(require("./routes/friendList"));
// 聊天機器人
// import { createAiChat } from "@nlux/core"
// import { createChatAdapter } from "@nlux/nlbridge"
const app = (0, express_1.default)();
dotenv_1.default.config({ path: "./.env" });
// 程式出現重大錯誤時
process.on("uncaughtException", err => {
    // 記錄錯誤下來，等到服務都處理完後，停掉該 process
    console.error("Uncaughted Exception！");
    console.error(err);
    process.exit(1);
});
// 連線 mongodb
require("./connections");
// view engine setup
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
// 載入設定檔
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use((0, express_session_1.default)({
    secret: (_a = process.env.SESSIONSECRET) !== null && _a !== void 0 ? _a : "dev",
    resave: false,
    saveUninitialized: false
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, passport_2.default)(passport_1.default);
// 路由
app.use("/api/test/v1/user", testUsers_1.default);
app.use("/upload", upload_1.default);
app.use("/auth", auth_1.default);
app.use("/payment", payment_1.default);
app.use("/api/v1/friendList", friendList_1.default);
app.use("/api-doc", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
// import '@nlux/themes/nova.css';
app.post("/chat-api", (req, res, next) => {
    const middleware = (0, express_2.defaultMiddleware)("openai", {
        apiKey: process.env.YOUR_OPENAI_API_KEY,
        chatModel: "gpt-3.5-turbo"
    });
    // 確保 middleware 是同步執行的
    Promise.resolve(middleware(req, res, next)).catch(next);
});
// const nlbridgeAdapter = createChatAdapter()
//   .withUrl("http://localhost:3000/chat-api")
// const aiChat = createAiChat().withAdapter(nlbridgeAdapter)
// app.get("/chat", (req, res) => {
//   res.render("chat", {
//     aiChat
//   })
// })
// 404 錯誤
app.use((req, res, _next) => {
    (0, handler_1.errorHandler)(res, "無此網站路由", 404);
});
// production 環境錯誤
const resErrorProd = (error, res) => {
    var _a, _b;
    console.error("產品環境錯誤", error);
    if ((_a = error.isOperational) !== null && _a !== void 0 ? _a : false) {
        (0, handler_1.errorHandler)(res, (_b = error.message) !== null && _b !== void 0 ? _b : "", error.statusCode);
    }
    else {
        (0, handler_1.errorHandler)(res, "產品環境系統異常，請洽系統管理員", 500);
    }
};
//  develop 環境錯誤
function resErrorDev(err, res) {
    var _a, _b, _c;
    console.error("開發環境錯誤", err);
    const statusCode = (_a = err.statusCode) !== null && _a !== void 0 ? _a : 500;
    const statusText = (_b = err.message) !== null && _b !== void 0 ? _b : "開發環境錯誤";
    const stack = (_c = err.stack) !== null && _c !== void 0 ? _c : "";
    (0, handler_1.errorHandler)(res, statusText, statusCode, stack);
}
// 自訂錯誤處理，依照環境不同，回傳不同錯誤訊息
app.use((error, _req, res, _next) => {
    // dev
    if (process.env.NODE_ENV === "develop") {
        resErrorDev(error, res);
        return;
    }
    // prod
    if (error.name === "ValidationError") {
        error.message = "資料欄位填寫錯誤，請重新輸入！";
        error.isOperational = true;
        resErrorProd(error, res);
        return;
    }
    // Handle 'Unexpected end of form' error
    if (error.message === "Unexpected end of form") {
        error.message = "沒有文件被上傳！";
        error.isOperational = true;
        resErrorProd(error, res);
        return;
    }
    resErrorProd(error, res);
});
// 未捕捉到的 catch
process.on("unhandledRejection", (err, promise) => {
    console.error("未捕捉到的 rejection：", promise, "原因：", err);
});
exports.default = app;
