import { NextFunction, Request, Response } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction): void => {
    console.warn(`LOG: ${req.method} ${req.path}`);
    next();
};
