import { Request, Response, NextFunction } from 'express';

const handleErrorAsync = (func: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
    (req: Request, res: Response, next: NextFunction) => { 
        func(req, res, next)
            .catch((error: any) => next(error));
    };

export default handleErrorAsync;