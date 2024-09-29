import express from 'express';

import { signUp, signIn, signOut, postLostPassword, postResetPassword } from '../../controllers/auth';
import { postCompany, postCompanyInviteCode } from '../../controllers/recruiter';
import { async } from '../../middlewares/async';
import {
    validateSignUp,
    validateSignIn,
    validateLostPassword,
    validateResetPassword,
} from '../../middlewares/auth';
import { auth } from '../../middlewares/auth/token';
import { validateCompany, validateCompanyInviteCode } from '../../middlewares/recruiter';

const authRouter = express.Router();

authRouter.post('/signup', async(validateSignUp), async(signUp));
authRouter.post('/signin', validateSignIn, async(signIn));
authRouter.post('/lost-password', validateLostPassword, async(postLostPassword));
authRouter.post('/reset-password', validateResetPassword, async(postResetPassword));
authRouter.post('/signout', auth, async(signOut));
authRouter.post('/company', validateCompany, async(postCompany));
authRouter.post('/invite', validateCompanyInviteCode, async(postCompanyInviteCode));

export default authRouter;
