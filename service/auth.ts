import { Request, Response, NextFunction } from 'express';

import appError from '../service/appError';
import handleErrorAsync from '../service/handleErrorAsync';
import { successHandler } from '../service/handler';
import jwt, { Secret } from 'jsonwebtoken';

import User from '../models/testUsersModel';

// 檢查 token 是否存在
export const checkAuth = handleErrorAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const JWT_SECRET = process.env.JWT_SECRET as Secret;
    let token;
    const auth = req.headers.authorization;

    if (auth && auth.startsWith('Bearer')) {
      token = auth.split(' ')[1];
    }

    if (!token) {
      return appError('驗證失敗，請重新登入', 401, next);
    }

    try {
      const decode = jwt.verify(token, JWT_SECRET) as any;
      const currentUser = await User.findById(decode.id);
      (req as any).user = currentUser;
      next();
    } catch (error) {
      return appError('驗證失敗，請重新登入', 401, next);
    }
  }
);

// 產生 JWT token
export const generateSendJWT = (res: Response, message: string, user: any) => {
  const JWT_SECRET = process.env.JWT_SECRET as Secret;
  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
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
