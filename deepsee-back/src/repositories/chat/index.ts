import { client } from '../../middlewares/database';
import { Conversation, Message } from '../../models/chat';
import { Company } from '../../models/recruiter';
import { Talent } from '../../models/talent';

export const fetchConversationByCandidacyId = async ({ candidacyId }: {
    candidacyId: number,
}): Promise<Conversation | undefined> => {
    const conversation = (await client.query(
        'SELECT * FROM conversation WHERE candidacy_id = $1', [candidacyId]
    )).rows[0];

    return (conversation)
        ? parseConversation({ queryResult: conversation })
        : undefined;
};

export const fetchConversationById = async ({ conversationId }: {
    conversationId: Conversation['__id'],
}): Promise<Conversation | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM conversation WHERE id = $1',
        [conversationId],
    )).rows[0];

    return queryResult
        ? parseConversation({ queryResult })
        : undefined;
};

export const fetchConversationsByTalentId = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<Conversation[]> => {
    return await Promise.all((await client.query(
        'SELECT * FROM conversation WHERE talent_id = $1 ORDER BY updated_at DESC',
        [talentId],
    )).rows.map((queryResult) => parseConversation({ queryResult })));
};

export const fetchConversationsByCompanyId = async ({ companyId }: {
    companyId: Company['__id'],
}): Promise<Conversation[]> => {
    return await Promise.all((await client.query(
        'SELECT * FROM conversation WHERE company_id = $1 ORDER BY updated_at DESC',
        [companyId],
    )).rows.map((queryResult) => parseConversation({ queryResult })));
};

export const updateConversation = async ({ conversationId, updatedAt }: {
    conversationId: Conversation['__id'],
    updatedAt: Conversation['updatedAt'],
}): Promise<Conversation> => {
    const queryResult = (await client.query(
        'UPDATE conversation SET updated_at = $1 WHERE id = $2 RETURNING *;',
        [updatedAt, conversationId],
    )).rows[0];

    if (!(queryResult)) {
        throw new Error(`Could not update conversation ${conversationId}`);
    }

    return parseConversation({ queryResult });
};

export const fetchMessageByCreatedAt = async ({ createdAt }: {
    createdAt?: Date,
}): Promise<Message | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM message WHERE created_at = $1 ORDER BY created_at DESC',
        [createdAt],
    )).rows[0];

    return (queryResult)
        ? parseMessage({ queryResult })
        : undefined;
};

export const fetchMessagesByConversationId = async ({ conversationId }: {
    conversationId: Conversation['__id'],
}): Promise<Message[]> => {
    return await Promise.all((await client.query(
        'SELECT * FROM message WHERE conversation_id = $1',
        [conversationId],
    )).rows.map((queryResult) => parseMessage({ queryResult })));
};

export const saveMessage = async ({ message }: {
    message: Omit<Message, '__id'>,
}): Promise<Message> => {
    const registeredMessage = (await client.query(
        `INSERT INTO message(
            content,
            conversation_id,
            created_at,
            sender_id
        ) VALUES($1, $2, $3, $4) RETURNING *;`,
        [
            message.content,
            message._conversationId,
            message.createdAt,
            message._senderId,
        ],
    )).rows[0];

    if (!(registeredMessage)) {
        throw new Error(`Could not save message: ${message}`);
    }

    return parseMessage({ queryResult: registeredMessage });
};

export const saveConversation = async ({ conversation }: {
    conversation: Omit<Conversation, '__id'>
}): Promise<Conversation> => {
    const registeredConversation = (await client.query(
        `INSERT INTO conversation(candidacy_id, job_offer_id, company_id, talent_id, updated_at) 
        VALUES($1, $2, $3, $4, $5) RETURNING *;`,
        [
            conversation._candidacyId,
            conversation._jobOfferId,
            conversation._companyId,
            conversation._talentId,
            conversation.updatedAt,
        ]
    )).rows[0];

    if (!(registeredConversation)) {
        throw new Error(`Could not save conversation: ${conversation}`);
    }

    return parseConversation({ queryResult: registeredConversation });
};

const parseConversation = ({ queryResult }: { queryResult: any }): Conversation => ({
    __id: queryResult.id,
    _candidacyId: queryResult.candidacy_id,
    _companyId: queryResult.company_id,
    _jobOfferId: queryResult.job_offer_id,
    _talentId: queryResult.talent_id,
    updatedAt: queryResult.updated_at,
});

const parseMessage = ({ queryResult }: { queryResult: any }): Message => ({
    __id: queryResult.id,
    _conversationId: queryResult.conversation_id,
    _senderId: queryResult.sender_id,
    content: queryResult.content,
    createdAt: queryResult.created_at,
});
