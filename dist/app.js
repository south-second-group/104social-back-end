"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = __importDefault(require("./swagger-output.json"));
const handler_1 = require("./service/handler");
const testUsers_1 = __importDefault(require("./routes/testUsers"));
const upload_1 = __importDefault(require("./routes/upload"));
const app = (0, express_1.default)();
dotenv_1.default.config({ path: "./.env" });
// 連線 mongodb
require("./connections");
// 載入設定檔
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// 路由
app.use("/api/test/v1/user", testUsers_1.default);
app.use("/api/test/v1/user/upload", upload_1.default);
app.use("/api-doc", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
// 404 錯誤
app.use((req, res, _next) => {
    (0, handler_1.errorHandler)(res, "無此網站路由", 404, "error");
});
// production 環境錯誤
const resErrorProd = (error, res) => {
    var _a, _b;
    //* eslint-disable no-console */
    console.error("環境錯誤", error);
    //* eslint-enable no-console */
    if ((_a = error.isOperational) !== null && _a !== void 0 ? _a : false) {
        (0, handler_1.errorHandler)(res, (_b = error.message) !== null && _b !== void 0 ? _b : "", error.statusCode);
    }
    else {
        (0, handler_1.errorHandler)(res, "產品環境系統異常", 500, "error");
    }
};
//  develop 環境錯誤
function resErrorDev(res, err) {
    var _a;
    /* eslint-disable no-console */
    console.log("開發環境錯誤", err);
    /* eslint-enable no-console */
    const statusCode = (_a = err.statusCode) !== null && _a !== void 0 ? _a : 500;
    const statusText = err !== null && err !== void 0 ? err : "開發環境錯誤";
    res.status(statusCode).json({
        status: "error",
        message: statusText,
        stack: err.stack
    });
}
// 自訂錯誤處理，依照環境不同，回傳不同錯誤訊息
app.use((error, req, res, _next) => {
    // dev
    if (process.env.NODE_ENV === "develop") {
        resErrorDev(res, error);
        return;
    }
    // prod
    if (error.name === "ValidationError") {
        error.message = "資料欄位填寫錯誤，請重新輸入！";
        error.isOperational = true;
        resErrorProd(error, res);
        return;
    }
    resErrorProd(error, res);
});
exports.default = app;
