import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUI from 'swagger-ui-express';
import { Request, Response, NextFunction } from 'express';

import swaggerFile from './swagger-output.json';
import { errorHandler } from './service/handler';
import testUsersRouter from './routes/testUsers';

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
app.use('/api/test/v1', testUsersRouter);

app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));

// 404 錯誤
app.use((req: Request, res: Response, next: NextFunction) => {
  errorHandler(res, '無此網站路由', 404, 'error');
});

// production 環境錯誤
const resErrorProd = (error: any, res: Response) => {
  console.error(error);
  if (error.isOperational) {
    errorHandler(res, error.message, error.statusCode);
  } else {
    errorHandler(res, '產品環境系統異常', 500, 'error');
  }
};

interface Error {
  statusCode?: number;
  statusText?: string;
  stack?: string;
}

//  develop 環境錯誤
function resErrorDev(res: Response, err: Error) {
  console.log(err);
  let statusCode = err.statusCode || 500;
  let statusText = err || '開發環境錯誤'; 

  res.status(statusCode).json({
    status: 'error',
    message: statusText,
    stack: err.stack,
  });
}

// 自訂錯誤處理，依照環境不同，回傳不同錯誤訊息
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  // dev
  if (process.env.NODE_ENV === 'develop') {
    return resErrorDev(res, error);
  }

  // prod
  if (error.name === 'ValidationError') {
    error.message = '資料欄位填寫錯誤，請重新輸入！';
    error.isOperational = true;
    return resErrorProd(error, res);
  }
  resErrorProd(error, res);
});

export default app;
