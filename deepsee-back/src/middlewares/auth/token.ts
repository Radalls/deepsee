import { Request, Response, NextFunction } from 'express';

import { verifyToken } from '../../utils/auth';

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        const authToken = verifyToken({ token });

        if (authToken) {
            req.user = authToken;
            return next();
        }
    }

    res.status(401).json({ message: 'Unauthorized' });
};
