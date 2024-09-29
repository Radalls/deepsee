import { defineStore } from 'pinia';
import { ref } from 'vue';

import { Message } from '../models/chat-models';

export const useChatStore = defineStore('chat', () => {
    const messages = ref<Message[]>([]);

    const getMessages = (): Message[] => {
        return messages.value;
    };

    const addMessage = ({ message }: { message: Message }): void => {
        messages.value.push(message);
    };

    const initializeMessages = ({ newMessages }: { newMessages: Message[] }): void => {
        messages.value = newMessages;
    };

    return {
        addMessage,
        getMessages,
        initializeMessages,
    };
});
