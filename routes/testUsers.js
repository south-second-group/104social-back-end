const express = require('express');
const users = require('../controllers/testUsers');
const { checkAuth } = require('../service/auth');

const router = express.Router();

// 註冊
router.post(
  '/user/register',
  /**
     * #swagger.tags = ['Users']
     * #swagger.description = '註冊'
     * #swagger.parameters['body'] = {
            in: 'body',
            type: 'object',
            required: true,
            description: '資料格式',
            schema: {
                "name": "william01",
                "email": "william01@gmail.com",
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
  users.register
);

// 登入
router.post(
  '/user/login',
  /**
     * #swagger.tags = ['Users']
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
  users.login
);

// 取得會員資料
router.get(
  '/user/profile',
  checkAuth,
  /**
     * #swagger.tags = ['Users']
     * #swagger.description = '取得會員資料'

     * #swagger.responses[200] = {
            description: '個人資訊',
            schema: {
                status: 'success',
                message: '取得成功',
                "data": {
                    "_id": "6612a656f06e7b681e99952b",
                    "name": "william01",
                    "photo": "",
                    "gender": "",
                    "followers": [],
                    "following": [],
                    "createdAt": "2024-04-07T13:57:42.923Z"
                }
            }
        }
     */
  users.getOwnProfile
);

module.exports = router;
