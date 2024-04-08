const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const { successHandler } = require('../service/handler');
const jwt = require('jsonwebtoken');

const User = require('../models/usersModel');

// 檢查 token 是否存在
const checkAuth = handleErrorAsync(async (req, res, next) => {
  let token;
  const auth = req.headers.authorization;

  if (auth && auth.startsWith('Bearer')) {
    token = auth.split(' ')[1];
  }

  if (!token) {
    return appError('驗證失敗，請重新登入', 401, next);
  }

  const decode = jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
    if (error) {
      return appError('驗證失敗，請重新登入', 401, next);
    }
    return payload;
  });

  const currentUser = await User.findById(decode.id);
  req.user = currentUser;
  next();
});

// 產生 JWT token
const generateSendJWT = (res, message, user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });

  user.password = undefined;

  const data = {
    token,
    profile: {
      _id: user._id,
      name: user.name,
      photo: user.photo,
    },
  };

  successHandler(res, message, data);
};

module.exports = { checkAuth, generateSendJWT };