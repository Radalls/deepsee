import express from 'express';

import { deleteUser, identifyUser } from '../../controllers/user';
import { async } from '../../middlewares/async';

const userRouter = express.Router();

userRouter.get('/ident', async(identifyUser));
userRouter.delete('/:userId', async(deleteUser));

export default userRouter;
