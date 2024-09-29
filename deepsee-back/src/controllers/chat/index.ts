import { Request, Response } from 'express';

import { ConversationRequest, MessageRequest } from '../../middlewares/chat';
import {
    createConversation,
    createMessage,
    getConversationByCandidacyId,
    getConversationById,
    getConversationsByCompanyId,
    getConversationsByTalentId,
    getMessagesByConversationId,
} from '../../services/chat';
import { getUserById } from '../../services/user';

export const getConversationsByTalent = async (req: Request, res: Response): Promise<void> => {
    const talentId = Number.parseInt(req.params.talentId);
    if (!(talentId)) {
        res.status(500).json({ error: `Invalid talent id ${talentId}` });
        return;
    }

    const conversations = await getConversationsByTalentId({ talentId });
    res.json(conversations);
};

export const getConversationsByCompany = async (req: Request, res: Response): Promise<void> => {
    const companyId = Number.parseInt(req.params.companyId);
    if (!(companyId)) {
        res.status(500).json({ error: `Invalid company id ${companyId}` });
        return;
    }

    const conversations = await getConversationsByCompanyId({ companyId });
    res.json(conversations);
};

export const getConversationByCandidacy = async (req: Request, res: Response): Promise<void> => {
    const candidacyId = Number.parseInt(req.params.candidacyId);
    if (!(candidacyId)) {
        res.status(500).json({ error: `Invalid candidacy id ${candidacyId}` });
        return;
    }

    const conversation = await getConversationByCandidacyId({ candidacyId });

    if (!(conversation)) {
        res.status(204).json();
        return;
    }

    res.json(conversation);
};

export const getMessagesByConversation = async (req: Request, res: Response): Promise<void> => {
    const conversationId = Number.parseInt(req.params.conversationId);
    if (!(conversationId)) {
        res.status(500).json({ error: `Invalid conversation id ${conversationId}` });
        return;
    }

    const messages = await getMessagesByConversationId({ conversationId });
    res.json(messages);
};

export const postConversation = async (req: ConversationRequest, res: Response): Promise<void> => {
    const conversation = req.validatedData?.conversation;
    if (!(conversation)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const registeredConversation = await createConversation(conversation);

    res.json(registeredConversation);
};

export const postMessage = async (req: MessageRequest, res: Response): Promise<void> => {
    const message = req.validatedData?.message;
    if (!(message)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    //TODO: only check if conversation exists
    const conversation = await getConversationById({ conversationId: message._conversationId });
    if (!(conversation)) {
        res.status(404).json({ error: `Conversation ${message._conversationId} not found` });
        return;
    }

    //TODO: only check if sender exists
    const user = await getUserById({ userId: message._senderId });
    if (!(user)) {
        res.status(404).json({ error: `User ${message._senderId} not found` });
        return;
    }

    const registeredMessage = await createMessage({ message });
    res.json(registeredMessage);
};
