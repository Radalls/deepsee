import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import expressWs from 'express-ws';

import { auth } from './middlewares/auth/token';
import { error } from './middlewares/error';
import { logger } from './middlewares/logger';
import { notFound } from './middlewares/notfound';
import { parser } from './middlewares/parser';
import authRouter from './routes/auth/router';
import candidacyRouter from './routes/candidacy/router';
import chatRouter from './routes/chat/router';
import jobRouter from './routes/job/router';
import recruiterRouter from './routes/recruiter/router';
import subRouter from './routes/sub/router';
import talentRouter from './routes/talent/router';
import userRouter from './routes/user/router';
import { chatWs } from './services/chat/wss';

dotenv.config();

// Create Express application
const { app } = expressWs(express());

// Middlewares
app.use(logger);
app.use(cors({
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    origin: process.env.DOMAIN,
}));

app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.includes('webhook')) {
        next();
    }
    else {
        parser(req, res, next);
    }
});

// Routes
app.get('/api', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.ws('/api/chat/wss', chatWs);

app.use('/api/auth', authRouter);
app.use('/api/candidacies', auth, candidacyRouter);
app.use('/api/jobs', auth, jobRouter);
app.use('/api/recruiters', auth, recruiterRouter);
app.use('/api/talents', auth, talentRouter);
app.use('/api/users', auth, userRouter);
app.use('/api/chat', auth, chatRouter);
app.use('/api/sub', subRouter);

app.use(notFound);
app.use(error);

export default app;
