import { AuthToken } from '../utils/auth';

declare global {
    namespace Express {
        interface Request {
            user?: AuthToken;
        }
    }
}
