import express from 'express';

import {
    getSubscriptionSession,
    postSubscriptionPortal,
    postSubscriptionSession,
    subscriptionWebhook,
} from '../../controllers/sub';
import { async } from '../../middlewares/async';
import { validateSubscriptionPortal, validateSubscriptionSession } from '../../middlewares/sub';

const subRouter = express.Router();

const raw = express.raw({ type: 'application/json' });

subRouter.get('/session', async(getSubscriptionSession));
subRouter.post('/session', validateSubscriptionSession, async(postSubscriptionSession));
subRouter.post('/portal', validateSubscriptionPortal, async(postSubscriptionPortal));
subRouter.post('/webhook', raw, async(subscriptionWebhook));

export default subRouter;
