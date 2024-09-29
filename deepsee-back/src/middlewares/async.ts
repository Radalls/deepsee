import { NextFunction, Request, Response } from 'express';

export const async = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
