import { NextFunction, Request, Response } from 'express';

import { Conversation, Message } from '../../models/chat';
import { validateNumber, validateString } from '../../utils/validation';

export interface ConversationRequest extends Request {
    validatedData?: {
        conversation: Required<Pick<Conversation,
            '_candidacyId'
        >>;
    };
}

export interface MessageRequest extends Request {
    validatedData?: {
        message: Required<Pick<Message,
            '_conversationId' | '_senderId' | 'content'
        >>;
    };
}

export const validateConversation = (req: ConversationRequest, res: Response, next: NextFunction): void => {
    const {
        candidacyId,
    } = req.body;

    const validatedCandidacyId = validateNumber(candidacyId);
    if (!(validatedCandidacyId)) {
        throw new Error(`Invalid candidacy id ${candidacyId}`);
    }

    req.validatedData = {
        conversation: {
            _candidacyId: validatedCandidacyId,
        },
    };

    next();
};

export const validateMessage = (req: MessageRequest, res: Response, next: NextFunction): void => {
    const {
        content,
        conversationId,
        senderId,
    } = req.body;

    const validatedContent = validateString(content);
    if (!(validatedContent)) {
        throw new Error(`Invalid content ${content}`);
    }

    const validatedConversationId = validateNumber(conversationId);
    if (!(validatedConversationId)) {
        throw new Error(`Invalid conversation id ${conversationId}`);
    }

    const validatedSenderId = validateNumber(senderId);
    if (!(validatedSenderId)) {
        throw new Error(`Invalid sender id ${senderId}`);
    }

    req.validatedData = {
        message: {
            _conversationId: validatedConversationId,
            _senderId: validatedSenderId,
            content: validatedContent,
        },
    };

    next();
};
