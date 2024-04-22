// import { type Request, type Response, type NextFunction } from "express"
import express from "express"
import users from "../controllers/testUsers"
import { checkAuth } from "../service/auth"

const router = express.Router()

// router.use((req: Request, res: Response, next: NextFunction): void => {
//   const { url, method } = req
//   //* eslint-disable no-console */
//   console.info(`url: ${url} method: ${method} `) // 常用的參數：req.body, req.params, req.query, req.headers, req.cookies, req.signedCookies
//   console.log(res) // res 常用參數：
//   //* eslint-enable no-console */
//   next()
// })

// 註冊
router.post(
  "/register",
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
                "photo":"xxx.jpg",
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
)

// 登入
router.post(
  "/login",
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
  users.login
)

// 取得會員資料
router.get(
  "/profile",
  checkAuth,
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
  users.getOwnProfile
)

// 編輯自己的資訊
router.patch("/profile", checkAuth,
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
                $name: 'william44',
                $photo: '222',
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
  users.patchProfile
)

const app = express()
app.use(router)

//* eslint-disable no-console */
// console.log(router)
//* eslint-enable no-console */

export default router
