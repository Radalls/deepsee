import { Router } from 'express';

import {
    getConversationByCandidacy,
    getConversationsByCompany,
    getConversationsByTalent,
    getMessagesByConversation,
    postConversation,
    postMessage,
} from '../../controllers/chat';
import { async } from '../../middlewares/async';
import { validateConversation, validateMessage } from '../../middlewares/chat';

const chatRouter = Router();

chatRouter.get('/talent/:talentId', async(getConversationsByTalent));
chatRouter.get('/company/:companyId', async(getConversationsByCompany));
chatRouter.get('/candidacy/:candidacyId', async(getConversationByCandidacy));
chatRouter.get('/:conversationId', async(getMessagesByConversation));
chatRouter.post('/conversation/create', validateConversation, async(postConversation));
chatRouter.post('/message/create', validateMessage, async(postMessage));

export default chatRouter;
