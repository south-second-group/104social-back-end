const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUI = require('swagger-ui-express');

const swaggerFile = require('./swagger-output.json');
const { errorHandler } = require('./service/handler');
const usersRouter = require('./routes/users');

const app = express();
dotenv.config({ path: './.env' });

// 連線 mongodb
require('./connections');

// 載入設定檔
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api/v1', usersRouter);
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));

// 404 錯誤
app.use((req, res, next) => {
  errorHandler(res, '無此網站路由', 404, 'error');
});

// production 環境錯誤
const resErrorProd = (error, res) => {
  if (error.isOperational) {
    errorHandler(res, error.message, error.statusCode);
  } else {
    errorHandler(res, '系統異常', 500, 'error');
  }
};

//  develop 環境錯誤
const resErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: 'false',
    message: error.message,
    error: error,
    stack: error.stack,
  });
};

// 自訂錯誤處理，依照環境不同，回傳不同錯誤訊息
app.use((error, req, res, next) => {
  // dev
  if (process.env.NODE_ENV === 'develop') {
    return resErrorDev(error, res);
  }

  // prod
  if (error.name === 'ValidationError') {
    error.message = '資料欄位填寫錯誤，請重新輸入！';
    error.isOperational = true; 
    return resErrorProd(error, res);
  }
  resErrorProd(error, res);
});

module.exports = app;
