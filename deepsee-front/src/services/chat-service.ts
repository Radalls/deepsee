import { Conversation, Message } from '../models/chat-models';
import { Company } from '../models/recruiter-model';
import { Talent } from '../models/talent-model';
import api from '../utils/api-utils';

import { useChatStore } from './../stores/chat-store';

const API_URL = 'chat';
let wsChat = null;

export const getConversationsByCompany = async ({ companyId }: {
    companyId: Company['__id'],
}): Promise<Conversation[]> => {
    return (await api.get(`${API_URL}/company/${companyId}`)).data as Conversation[];
};

export const getConversationsByTalent = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<Conversation[]> => {
    return (await api.get(`${API_URL}/talent/${talentId}`)).data as Conversation[];
};

export const getMessagesByConversation = async ({ conversationId }: {
    conversationId: Conversation['__id'],
}): Promise<Message[]> => {
    return (await api.get(`${API_URL}/${conversationId}`)).data as Message[];
};

export const getConversationByCandidacy = async (candidacyId: number): Promise<Conversation> => {
    return (await api.get(`${API_URL}/candidacy/${candidacyId}`)).data as Conversation;
};

export const postConversation = async (candidacyId: number): Promise<Conversation> => {
    return (await api.post(`${API_URL}/conversation/create`, { candidacyId })).data as Conversation;
};

export const postMessage = async ({ content, conversationId, senderId }: {
    content: string,
    conversationId: number,
    senderId: number,
}): Promise<Message> => {
    return (await api.post(`${API_URL}/create`, { content, conversationId, senderId })).data as Message;
};

export const connectChatSocket = ({ conversationId, userId }: {
    conversationId: number,
    userId: number,
}): void => {
    // wsChat = new WebSocket('ws://localhost:3000/api/chat/wss');
    wsChat = new WebSocket(`ws://${window.location.host}/api/chat/wss`);

    wsChat.addEventListener('open', () => {
        wsChat.send(JSON.stringify({ conversationId, type: 'joinChat', userId }));

        wsChat.addEventListener('message', (event) => {
            const eventParse = JSON.parse(event.data);
            if (eventParse.type === 'messageSend') {
                useChatStore().addMessage({ message: eventParse.data });
            }
        });
    });
};

export const sendChatSocket = ({ content, conversationId, userId }: {
    content: string,
    conversationId: number,
    userId: number,
}): void => {
    wsChat.send(JSON.stringify({ content, conversationId, type: 'sendMessage', userId }));
};

export const disconnectChatSocket = ({ conversationId, userId }: {
    conversationId: number,
    userId: number,
}): void => {
    if (wsChat === null) return;

    wsChat.send(JSON.stringify({ conversationId, type: 'leaveChat', userId }));
    wsChat.close();
};
