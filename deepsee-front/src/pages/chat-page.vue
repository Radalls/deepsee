<script lang="ts" setup>
import { onMounted, onUnmounted, onUpdated, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Conversation } from '../models/chat-models';
import {
    connectChatSocket,
    disconnectChatSocket,
    getConversationsByCompany,
    getConversationsByTalent,
    getMessagesByConversation,
    sendChatSocket,
} from '../services/chat-service';
import { getRecruiter } from '../services/recruiter-service';
import { useAuthStore } from '../stores/auth-store';
import { useChatStore } from '../stores/chat-store';
import { formatTimeElapsedSince } from '../utils/time-utils';

const router = useRouter();

const route = useRoute();
const companyName = route.params.companyName as string;
const talentId = route.params.talentId as string;

const { isUserRecruiter, isUserTalent, getUser } = useAuthStore();
const userId = ref(getUser().__id);

const { getMessages, initializeMessages } = useChatStore();

const isLoading = ref(true);

const jobOfferId = ref('');
const chat = ref(null);
const currentConversationIndex = ref(0);
const newMessage = ref('');
const conversations = ref<Conversation[]>([]);

onMounted(async () => {

    if (isUserTalent()) {
        conversations.value = await getConversationsByTalent({ talentId: userId.value });
    }
    else if (isUserRecruiter()) {
        const recruiter = await getRecruiter({ recruiterId: userId.value });
        conversations.value = await getConversationsByCompany({ companyId: recruiter._companyId });
    }

    isLoading.value = false;

    const conversationId = route.params.conversationId as string;

    if (conversations.value.length === 0) { return; }

    if (!conversationId) {
        router.replace({
            name: `chat-${ isUserRecruiter() ? 'recruiter' : 'talent' }`,
            params: { conversationId: conversations.value[0].__id.toString() },
        });
        await selectConversation(0);
        return;
    }

    const conversationIndex = conversations.value.findIndex(
        (conversation) => conversation.__id === Number.parseInt(conversationId),
    );

    if (conversationIndex !== -1) {
        await selectConversation(conversationIndex);
        return;
    }
});

onUpdated(() => {
    if (chat.value) {
        chat.value.scrollTop = chat.value.scrollHeight;
    }
});

onUnmounted(() => {
    disconnectChatSocket({
        conversationId: conversations.value[currentConversationIndex.value]?.__id,
        userId: userId.value,
    });
    initializeMessages({ newMessages: [] });
});

const sendMessage = async () => {
    sendChatSocket({
        content: newMessage.value,
        conversationId:conversations.value[currentConversationIndex.value].__id,
        userId: userId.value,
    });

    newMessage.value = '';
};

const selectConversation = async (conversationIndex: number) => {
    jobOfferId.value = conversations.value[conversationIndex]._jobOfferId.toString();
    disconnectChatSocket({
        conversationId: conversations.value[conversationIndex].__id,
        userId: userId.value,
    });
    connectChatSocket({
        conversationId: conversations.value[conversationIndex].__id,
        userId: userId.value,
    });
    initializeMessages({ newMessages: [] });

    currentConversationIndex.value = conversationIndex;
    const messagesData = await getMessagesByConversation({
        conversationId: conversations.value[conversationIndex].__id,
    });
    initializeMessages({ newMessages: messagesData });

    router.replace({
        name: `chat-${ isUserRecruiter() ? 'recruiter' : 'talent' }`,
        params: { conversationId: conversations.value[conversationIndex].__id.toString() },
    });
};

const detectLink = (message: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
};
</script>

<template>
    <div
        v-if="!isLoading"
        class="row no-scroll"
    >
        <div class="contact column">
            <div
                v-for="(conversation, index) of conversations"
                :key="conversation.__id"
                class="row gap-8 conversation"
                :class="{ 'active': currentConversationIndex === index}"
                @click="selectConversation(index)"
            >
                <img
                    v-if="conversation.contactAvatar"
                    width="48"
                    height="40"
                    :src="conversation.contactAvatar"
                >
                <div
                    v-else
                    class="no-avatar"
                    style="height: 38px; width: 48px;"
                >
                    {{ conversation.contactName[0] }}
                </div>

                <div class="width-100 column justify-center">
                    <div class="row justify-between gap-8 align-center">
                        <div class="bold mb-2">
                            {{ conversation.contactName }}
                        </div>
                        <div class="text-right caption">
                            {{ formatTimeElapsedSince(conversation.updatedAt) }}
                        </div>
                    </div>

                    <div>
                        {{ conversation.jobOfferTitle }}
                    </div>
                </div>
            </div>

            <div
                v-if="conversations.length === 0"
                class="ma-28"
            >
                Aucune conversation
            </div>
        </div>

        <div class="width-100">
            <div class="job-offer row justify-end">
                <button class="primary border row align-center gap-8">
                    <img src="/icons/file-icon.png">
                    <router-link :to="isUserRecruiter() ? `/recruiter/${companyName.toLowerCase()}/jobs/${jobOfferId}` : `/talent/${talentId}/search/${jobOfferId}`">
                        <div>Voir l'offre</div>
                    </router-link>
                </button>
            </div>

            <div
                v-if="getMessages().length > 0"
                class="chat-container column justify-end gap-18"
            >
                <div
                    ref="chat"
                    class="column gap-18 chat"
                >
                    <div
                        v-for="message of getMessages()"
                        :key="message.__id"
                        class="row align-end gap-12"
                        :class="{ 'me': message._senderId === userId }"
                    >
                        <img
                            v-if="message.senderAvatar"
                            height="40"
                            width="48"
                            :src="message.senderAvatar"
                        >
                        <div
                            v-else
                            class="no-avatar"
                            style="height: 40px; width: 48px;"
                        >
                            {{ message.senderName[0] }}
                        </div>

                        <div class="width-100 message">
                            <div class="row gap-8 justify-between mb-2">
                                <div class="subtitle">
                                    {{ message.senderName }}
                                </div>
                                <div class="text-right">
                                    {{ formatTimeElapsedSince(message.createdAt) }}
                                </div>
                            </div>

                            <div
                                class="text-justify"
                                v-html="detectLink(message.content)"
                            />
                        </div>

                        <div class="placeholder" />
                    </div>
                </div>

                <div class="row gap-18 chat-input">
                    <div class="placeholder" />

                    <div class="width-100 row gap-8">
                        <input v-model="newMessage">
                        <button
                            class="primary"
                            :disabled="newMessage.length === 0"
                            @click="sendMessage"
                        >
                            Envoyer
                        </button>
                    </div>

                    <div class="placeholder" />
                </div>
            </div>

            <div
                v-else-if="getMessages().length === 0"
                class="ma-28"
            >
                Aucun messages
            </div>

            <div
                v-else
                class="width-100 height-100 row justify-center align-center"
            >
                <spinner-component />
            </div>
        </div>
    </div>

    <div
        v-else
        class="width-100 height-100 row justify-center align-center"
    >
        <spinner-component />
    </div>
</template>

<style lang="scss" scoped>
.conversation:hover {
    background-color: #ecf6ff;
}

.conversation {
    cursor: pointer;
    padding: 12px 18px;
    transition: all 0.2s;
}

.conversation.active {
    background-color: #dbefff;
}

.contact {
    border-right: 2px solid #e8e8e8;
    height: 100%;
    max-width: calc(420px - 58px);
    width: 100%;
}

.message {
    background-color: white;
    border: solid 1px #339dab;
    border-color: #339dab;
    border-radius: 4px;
    color: #339dab;
    padding: 12px;
}

.me img {
    order: 2;
}

.me .no-avatar {
    order: 2;
}

.me .message {
    order: 1;
}

.me .placeholder {
    order: 0;
}

.me .message {
    background-color: #339dab;
    color: white;
}

.placeholder {
    width: 48px;
}

img {
    border-radius: 4px;
    object-fit: cover;
}

.chat {
    max-height: calc(100vh - 250px);
    overflow-y: auto;
    padding: 0 28px 0 28px;
}

.chat-container {
    height: calc(100% - 98px);
    padding-top: 28px;
}

.chat-input {
    padding-bottom: 28px;
}

.job-offer {
    padding: 12px 28px 12px 0;
    background-color: white;
    border-bottom: solid 2px #e8e8e8;
}
</style>
