import * as ws from 'ws';

import { createMessage } from '.';

const websocket: { [userId: number]: ws } = {};
const conversation: { [conversationId: number]: number[] } = {};

export const chatWs = (ws: ws) => {
    ws.on('message', async (message: string) => {
        const parseMessage = JSON.parse(message);

        if (parseMessage.type === 'joinChat') {
            websocket[parseMessage.userId] = ws;
            if (!conversation[parseMessage.conversationId]) {
                conversation[parseMessage.conversationId] = [];
            }
            if (!conversation[parseMessage.conversationId].includes(parseMessage.userId)) {
                conversation[parseMessage.conversationId].push(parseMessage.userId);
            }
        }

        if (parseMessage.type === 'sendMessage') {
            const message = await createMessage({
                message: {
                    _conversationId: parseMessage.conversationId,
                    _senderId: parseMessage.userId,
                    content: parseMessage.content,
                },
            });

            conversation[parseMessage.conversationId].forEach((userId) => {
                if (websocket[userId]) {
                    websocket[userId].send(JSON.stringify({ data: message, type: 'messageSend' }));
                }
            });
        }

        if (parseMessage.type === 'leaveChat') {
            delete websocket[parseMessage.userId];
            conversation[parseMessage.conversationId] =
                conversation[parseMessage.conversationId]?.filter((userId) => userId !== parseMessage.userId);
        }
    });
};
