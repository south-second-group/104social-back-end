"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./.env" });
const DB = (_a = process.env.DATABASE) === null || _a === void 0 ? void 0 : _a.replace("<PASSWORD>", (_b = process.env.DATABASE_PASSWORD) !== null && _b !== void 0 ? _b : "");
mongoose_1.default
    .connect(DB + "testDB", {})
    /* eslint-disable no-console */
    .then(() => { console.log("連線資料庫成功"); })
    .catch((error) => { console.error("連線資料庫失敗:", error); });
/* eslint-enable no-console */
// useCreateIndex: true,
// useFindAndModify: false,
// useUnifiedTopology: true,
