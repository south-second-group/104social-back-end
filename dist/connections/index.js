"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './.env' });
const DB = (_a = process.env.DATABASE) === null || _a === void 0 ? void 0 : _a.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '');
mongoose_1.default
    .connect(DB + 'testDB', {})
    .then(() => console.log('連線資料庫成功'))
    .catch((error) => console.error('連線資料庫失敗:', error));
// useCreateIndex: true,
// useFindAndModify: false,
// useUnifiedTopology: true,
