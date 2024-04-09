const handleErrorAsync = require('../service/handleErrorAsync');
const { successHandler } = require('../service/handler');
const appError = require('../service/appError');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { generateSendJWT } = require('../service/auth');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const User = require('../models/testUsersModel');

const users = {
  register: handleErrorAsync(async (req, res, next) => {
    let { name, email, photo, gender, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return appError('欄位未填寫完整', 400, next);
    }

    const errorMessageArr = [];

    if (!validator.isLength(name, { min: 6 })) {
      errorMessageArr.push('暱稱至少 6 字元以上');
    }
    if (password !== confirmPassword) {
      errorMessageArr.push('密碼不一致');
    }
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
      })
    ) {
      errorMessageArr.push('密碼長度必須超過 8 碼，並英數混合');
    }
    if (!validator.isEmail(email)) {
      errorMessageArr.push('email 格式不正確');
    }

    // 組合錯誤訊息
    if (errorMessageArr.length > 0) {
      const errorMessage = errorMessageArr.join('、');
      return appError(errorMessage, 400, next);
    }

    // 檢查 email 是否已註冊
    const findUserByMail = await User.findOne({ email });
    if (findUserByMail) {
      return appError('email 已註冊', 400, next);
    }

    // 建立新使用者
    password = await bcrypt.hash(password, 11);
    const data = { name, email, password, photo, gender };
    await User.create(data);

    successHandler(res, '註冊成功，請重新登入', {}, 201);
  }),
  login: handleErrorAsync(async (req, res, next) => {
    let { email, password } = req.body;

    if (!email || !password) {
      return appError('帳號及密碼必填', 400, next);
    }

    // 檢查使用者是否存在
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return appError('帳號錯誤或尚未註冊', 400, next);
    }

    // 檢查密碼是否正確
    const isVerify = await bcrypt.compare(password, user.password);
    if (!isVerify) {
      return appError('您的密碼不正確', 400, next);
    }

    generateSendJWT(res, '登入成功', user);
  }),
  getOwnProfile: handleErrorAsync(async (req, res, next) => {
    successHandler(res, '取得成功', req.user);
  }),
};

module.exports = users;
