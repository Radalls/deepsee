import { JobOffer } from './job-model';

export type Conversation = {
    __id: number;
    _companyId: number;
    _jobOfferId: number;
    _talentId: number;
    contactAvatar?: string;
    contactName?: string;
    jobOfferTitle?: JobOffer['title'];
    lastMessage?: string;
    updatedAt: Date;
}

export type Message = {
    __id: number;
    _conversationId: number;
    _senderId: number;
    content?: string;
    createdAt: Date;
    senderAvatar?: string;
    senderName?: string;
};
