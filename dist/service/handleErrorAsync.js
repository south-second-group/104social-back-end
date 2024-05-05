"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleErrorAsync = (func) => {
    return function (req, res, next) {
        func(req, res, next).catch((err) => {
            next(err); // 錯誤被捕獲後，使用next將錯誤傳遞出去
        });
    };
};
exports.default = handleErrorAsync;
