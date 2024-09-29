import { json } from 'body-parser';
import { RequestHandler } from 'express';

export const parser: RequestHandler = json();
