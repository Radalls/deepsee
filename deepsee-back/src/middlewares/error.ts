import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

interface CustomError extends Error {
    stack?: string;
    status?: number;
}

export const error: ErrorRequestHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    const statusCode = err.status || 500;
    const environment = process.env.NODE_ENV || 'production';

    console.error(
        `ERROR:
        Name: ${err.name}
        Message: ${err.message}
        Status: ${statusCode}
        Stack: ${err.stack || 'No stack trace available'}
        URL: ${req.originalUrl}
        Method: ${req.method}
        IP: ${req.ip}`
    );

    if (environment === 'development') {
        console.error(`Request Headers: ${JSON.stringify(req.headers, null, 2)}`);
        console.error(`Request Body: ${JSON.stringify(req.body, null, 2)}`);
    }

    const response = {
        message: 'Something went wrong!',
        ...(environment === 'development' && { error: err.message, stack: err.stack }),
    };

    res.status(statusCode).json(response);
};
