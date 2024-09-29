import { CandidacyStatus } from '../../models/candidacy';
import { Conversation, Message } from '../../models/chat';
import { Company } from '../../models/recruiter';
import { Talent } from '../../models/talent';
import { fetchCandidacyById } from '../../repositories/candidacy';
import {
    fetchConversationsByCompanyId,
    fetchConversationsByTalentId,
    fetchMessageByCreatedAt,
    fetchConversationById,
    saveMessage,
    fetchMessagesByConversationId,
    updateConversation,
    fetchConversationByCandidacyId,
    saveConversation,
} from '../../repositories/chat';
import { fetchJobOfferById } from '../../repositories/job';
import { fetchCompanyById, fetchRecruiterById } from '../../repositories/recruiter';
import { fetchUserById } from '../../repositories/user';
import { sendMail } from '../mail';

export const getConversationsByTalentId = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<Conversation[]> => {
    return await Promise.all((await fetchConversationsByTalentId({ talentId })).map(async (conversation) => {
        const conversationCompany = await fetchCompanyById({ companyId: conversation._companyId });
        const conversationJobOffer = await fetchJobOfferById({ jobOfferId: conversation._jobOfferId });
        const conversationLastMessage = await fetchMessageByCreatedAt({ createdAt: conversation.updatedAt });

        return {
            ...conversation,
            contactAvatar: conversationCompany?.avatar,
            contactName: conversationCompany?.name,
            jobOfferTitle: conversationJobOffer?.title,
            lastMessage: conversationLastMessage?.content,
        };
    }));
};

export const getConversationsByCompanyId = async ({ companyId }: {
    companyId: Company['__id'],
}): Promise<Conversation[]> => {
    return await Promise.all((await fetchConversationsByCompanyId({ companyId })).map(async (conversation) => {
        const conversationTalent = await fetchUserById({ userId: conversation._talentId });
        const conversationJobOffer = await fetchJobOfferById({ jobOfferId: conversation._jobOfferId });
        const conversationLastMessage = await fetchMessageByCreatedAt({ createdAt: conversation.updatedAt });

        return {
            ...conversation,
            contactAvatar: conversationTalent?.avatar,
            contactName: `${conversationTalent?.firstName} ${conversationTalent?.lastName}`,
            jobOfferTitle: conversationJobOffer?.title,
            lastMessage: conversationLastMessage?.content,
        };
    }));
};

export const getConversationByCandidacyId = async ({ candidacyId }: {
    candidacyId: number
}): Promise<Conversation | undefined> => {
    const conversation = await fetchConversationByCandidacyId({ candidacyId });

    if (!conversation) {
        return undefined;
    }

    const conversationTalent = await fetchUserById({ userId: conversation._talentId });
    const conversationLastMessage = await fetchMessageByCreatedAt({ createdAt: conversation.updatedAt });

    return {
        ...conversation,
        contactAvatar: conversationTalent?.avatar,
        contactName: `${conversationTalent?.firstName} ${conversationTalent?.lastName}`,
        lastMessage: conversationLastMessage?.content,
    };
};

export const getMessagesByConversationId = async ({ conversationId }: {
    conversationId: Conversation['__id'],
}): Promise<Message[]> => {
    const conversation = await fetchConversationById({ conversationId });
    if (!(conversation)) {
        return [];
    }

    const conversationCompany = await fetchCompanyById({ companyId: conversation._companyId });
    const conversationTalent = await fetchUserById({ userId: conversation._talentId });

    return await Promise.all((await fetchMessagesByConversationId({ conversationId })).map(async (message) => {
        const isMessageSenderTalent = message._senderId === conversation?._talentId;

        if (isMessageSenderTalent) {
            return {
                ...message,
                senderAvatar: conversationTalent?.avatar,
                senderName: `${conversationTalent?.firstName} ${conversationTalent?.lastName}`,
            };
        }

        return {
            ...message,
            senderAvatar: conversationCompany?.avatar,
            senderName: conversationCompany?.name,
        };
    }));
};

export const getConversationById = async ({ conversationId }: {
    conversationId: Conversation['__id'],
}): Promise<Conversation | undefined> => {
    const conversation = await fetchConversationById({ conversationId });
    if (!(conversation)) {
        return undefined;
    }

    const conversationCompany = await fetchCompanyById({ companyId: conversation._companyId });
    const conversationLastMessage = await fetchMessageByCreatedAt({ createdAt: conversation.updatedAt });

    return {
        ...conversation,
        contactAvatar: conversationCompany?.avatar,
        contactName: conversationCompany?.name,
        lastMessage: conversationLastMessage?.content,
    };
};

export const createConversation = async (
    conversation: Omit<Conversation, '__id' | 'updatedAt' | '_talentId' | '_companyId' | '_jobOfferId'>
): Promise<Conversation> => {
    const candidacy = await fetchCandidacyById({ candidacyId: conversation._candidacyId });
    if (!(candidacy)) {
        throw new Error(`Could not find candidacy with id ${conversation._candidacyId}`);
    }

    const jobOffer = await fetchJobOfferById({ jobOfferId: candidacy._jobOfferId });
    if (!(jobOffer)) {
        throw new Error(`Could not find job offer with id ${candidacy._jobOfferId}`);
    }

    const statedConversation: Omit<Conversation, '__id'> = {
        ...conversation,
        _companyId: jobOffer._companyId,
        _jobOfferId: candidacy._jobOfferId,
        _talentId: candidacy._talentId,
        updatedAt: candidacy.createdAt ?? new Date(),
    };

    const savedConversation = await saveConversation({ conversation: statedConversation });

    let message = candidacy.message;

    if (!message && candidacy.status === CandidacyStatus.SUGGESTED) {
        message = 'Candidature suggérée';
    }
    else if (!message) {
        message = 'Candidature envoyée';
    }

    const statedMessage: Omit<Message, '__id'> = {
        _conversationId: savedConversation.__id,
        _senderId: savedConversation._talentId,
        content: message,
        createdAt: savedConversation.updatedAt,
    };

    await saveMessage({ message: statedMessage });

    return savedConversation;
};

export const createMessage = async ({ message }: {
    message: Omit<Message, '__id' | 'createdAt'>,
}): Promise<Message> => {
    const statedMessage: Omit<Message, '__id'> = {
        ...message,
        createdAt: new Date(),
    };

    const savedMessage = await saveMessage({ message: statedMessage });

    await updateConversation({
        conversationId: savedMessage._conversationId,
        updatedAt: savedMessage.createdAt,
    });

    const messageSender = await fetchUserById({ userId: savedMessage._senderId });
    if (!(messageSender)) {
        throw new Error(`Could not find user with id ${savedMessage._senderId}`);
    }

    const isMessageSenderRecruiter = messageSender.role === 'recruiter';
    const conversation = await fetchConversationById({ conversationId: savedMessage._conversationId });
    if (!(conversation)) {
        throw new Error(`Could not find conversation with id ${savedMessage._conversationId}`);
    }

    let receiverName: string | undefined;
    let parsedMessage: Message;
    let email;

    if (isMessageSenderRecruiter) {
        const messageSenderRecruiter = await fetchRecruiterById({ recruiterId: savedMessage._senderId });
        if (!(messageSenderRecruiter)) {
            throw new Error(`Could not find recruiter with id ${savedMessage._senderId}`);
        }
        if (!(messageSenderRecruiter._companyId)) {
            throw new Error(`Unkonwn error with id ${messageSenderRecruiter._companyId}`);
        }

        const messageSenderCompany = await fetchCompanyById({ companyId: messageSenderRecruiter._companyId });
        if (!(messageSenderCompany)) {
            throw new Error(`Could not find company with id ${messageSenderRecruiter._companyId}`);
        }

        const messageReceiver = await fetchUserById({ userId: conversation._talentId });
        if (!(messageReceiver)) {
            throw new Error(`Could not find user with id ${conversation._talentId}`);
        }

        email = messageReceiver.email;
        receiverName = `${messageReceiver.firstName} ${messageReceiver.lastName}`;
        parsedMessage = {
            ...savedMessage,
            senderAvatar: messageSenderCompany.avatar,
            senderName: messageSenderCompany.name,
        } as Message;
    }
    else {
        const messageReceiver = await fetchCompanyById({ companyId: conversation._companyId });
        if (!(messageReceiver)) {
            throw new Error(`Could not find company with id ${conversation._companyId}`);
        }

        const ownerUser = await fetchUserById({ userId: messageReceiver._ownerId });

        receiverName = messageReceiver.name;
        parsedMessage = {
            ...savedMessage,
            senderAvatar: messageSender.avatar,
            senderName: `${messageSender.firstName} ${messageSender.lastName}`,
        };

        email = ownerUser?.email;
    }

    const emailMessage = {
        ...parsedMessage,
        createdAt: parsedMessage.createdAt.toLocaleString(),
        receiverName,
        subject: 'Nouveau message reçu',
    };

    await sendMail({
        data: emailMessage,
        email,
        templateName: 'new-message',
    });

    return parsedMessage;
};
