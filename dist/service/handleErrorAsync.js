"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleErrorAsync = (func) => (req, res, next) => {
    func(req, res, next)
        .catch((error) => next(error));
};
exports.default = handleErrorAsync;
