"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { type Request, type Response, type NextFunction } from "express"
const express_1 = __importDefault(require("express"));
const testUsers_1 = __importDefault(require("../controllers/testUsers"));
const auth_1 = require("../service/auth");
const router = express_1.default.Router();
// router.use((req: Request, res: Response, next: NextFunction): void => {
//   const { url, method } = req
//   //* eslint-disable no-console */
//   console.info(`url: ${url} method: ${method} `) // 常用的參數：req.body, req.params, req.query, req.headers, req.cookies, req.signedCookies
//   console.log(res) // res 常用參數：
//   //* eslint-enable no-console */
//   next()
// })
// 註冊
router.post("/register", 
/**
   * #swagger.tags = ['test Users']
   * #swagger.description = '註冊'
   * #swagger.parameters['body'] = {
          in: 'body',
          type: 'object',
          required: true,
          description: '資料格式',
          schema: {
              "name": "william01",
              "email": "william01@gmail.com",
              "gender": "secret",
              "password": "a11111111",
              "confirmPassword": "a11111111"
              }
      }
   * #swagger.responses[200] = {
          description: '註冊資訊',
          schema: {
              status: 'success',
              message: '註冊成功，請重新登入',
              data: {}
          }
      }
   */
testUsers_1.default.register);
// 登入
router.post("/login", 
/**
   * #swagger.tags = ['test Users']
   * #swagger.description = '登入'
   * #swagger.parameters['body'] = {
          in: 'body',
          type: 'object',
          required: true,
          description: '資料格式',
          schema: {
              $email: 'william01@gmail.com',
              $password: 'a11111111'
          }
      }
   * #swagger.responses[200] = {
          description: '登入資訊',
          schema: {
              "status": "success",
              "message": "登入成功",
              "data": {
                  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MTJhNjU2ZjA2ZTdiNjgxZTk5OTUyYiIsImlhdCI6MTcxMjQ5OTA2Nn0.rK_A2oK_1SQqYFPqghvhJhvfAg_5UXsazV0s0mvYQkw",
                  "profile": {
                  "_id": "6612a656f06e7b681e99952b",
                  "name": "william01",
                  "photo": ""
                  }
              }
          }
      }
   */
testUsers_1.default.login);
// 取得會員資料
router.get("/profile", auth_1.checkAuth, 
/**
   * #swagger.tags = ['test Users']
   * #swagger.description = '取得會員資料 （使用上方Authorization統一解鎖）'
   * #swagger.security = [{
          Bearer: []
      }]

   * #swagger.responses[200] = {
          description: '個人資訊',
          schema: {
              status: 'success',
              message: '取得成功',
              "data": {
                  "_id": "6612a656f06e7b681e99952b",
                  "name": "william01",
                  "photo": "",
                  "gender": "secret",
                  "createdAt": "2024-04-07T13:57:42.923Z"
              }
          }
      }
   */
testUsers_1.default.getOwnProfile);
// 編輯自己的資訊
router.put("/profile", auth_1.checkAuth, 
/**
   * #swagger.tags = ['test Users']
   * #swagger.description = '編輯自己的資訊'
   * #swagger.security = [{
          Bearer: []
      }]
   * #swagger.parameters['body'] = {
          in: 'body',
          type: 'object',
          required: true,
          description: '資料格式',
          schema: {
              $onlineStatus: 'online',
              $name: 'william05',
              $gender: 'secret'
          }
      }

   * #swagger.responses[200] = {
          description: '個人資訊',
          schema: {
              status: 'success',
              message: '更新成功',
              "data": {
                  "_id": "6614bcf9269fee9fe3784df0",
                  "name": "william04",
                  "photo": "222",
                  "gender": "secret",
                  "createdAt": "2024-04-09T03:58:49.066Z"
              }
          }
      }
   */
testUsers_1.default.patchProfile);
const app = (0, express_1.default)();
app.use(router);
// console.error('路由層錯誤：',router)
exports.default = router;
