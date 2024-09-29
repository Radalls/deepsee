import fs from 'fs/promises';
import path from 'path';

import { SpacesServiceClient } from '@google-apps/meet';
import { authenticate } from '@google-cloud/local-auth';
import { auth, OAuth2Client } from 'google-auth-library';

import { CandidacyStatus } from '../../models/candidacy';
import { fetchCandidacyById, updateCandidacy } from '../../repositories/candidacy';
import { createConversation, createMessage } from '../chat';

import { fetchConversationByCandidacyId } from './../../repositories/chat/index';

const SCOPES = ['https://www.googleapis.com/auth/meetings.space.created'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const loadSavedCredentialsIfExist = async (): Promise<any | null> => {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content.toString());
        return auth.fromJSON(credentials);
    } catch (err) {
        console.warn(err);
        return null;
    }
};

const saveCredentials = async (client: OAuth2Client): Promise<void> => {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
        type: 'authorized_user',
    });
    await fs.writeFile(TOKEN_PATH, payload);
};

const authorize = async (): Promise<OAuth2Client> => {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        keyfilePath: CREDENTIALS_PATH,
        scopes: SCOPES,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
};

const createSpace = async (authClient: any): Promise<string | null> => {
    const meetClient = new SpacesServiceClient({
        authClient: authClient,
    });
    const request: any = {
        config: {
            accessType: 1,
        },
    };

    const response = await meetClient.createSpace(request);

    response[0] = {
        ...response[0],
        config: {
            ...response[0].config,
            accessType: 1,
        },
    };

    const response2 = await meetClient.updateSpace({
        space: response[0],
    });

    return response2[0].meetingUri ?? null;
};

export const createMeet = async ({ candidacyId, address, date, senderId, time }: {
    address?: string,
    candidacyId: number,
    date: string,
    senderId: number,
    time: string,
}): Promise<void> => {
    const candidacy = await fetchCandidacyById({ candidacyId });

    if (!candidacy) {
        return;
    }

    if (candidacy.status === CandidacyStatus.PHONE_INTERVIEW) {
        const authClient = await authorize();
        const meetUrl = await createSpace(authClient);

        await updateCandidacy({
            candidacy: {
                __id: candidacyId,
                meetLink: meetUrl ?? undefined,
                phoneInterviewDate: converStringToDate(date, time),
            },
        });

        let conversation = await fetchConversationByCandidacyId({ candidacyId });
        if (!conversation) {
            conversation = await createConversation({
                _candidacyId: candidacyId,
            });
        }

        await createMessage({
            message: {
                _conversationId: conversation.__id,
                _senderId: senderId,
                content: `Entretien téléphonique prévu le ${date} à ${time} accessible sur le lien ${meetUrl}`,
            },
        });
    }

    if (candidacy.status === CandidacyStatus.INTERVIEW) {
        await updateCandidacy({
            candidacy: {
                __id: candidacyId,
                interviewDate: converStringToDate(date, time),
            },
        });

        const conversation = await fetchConversationByCandidacyId({ candidacyId });
        if (!conversation) {
            return;
        }

        await createMessage({
            message: {
                _conversationId: conversation.__id,
                _senderId: senderId,
                content: `Entretien prévu le ${date} à ${time} à l'adresse ${address}`,
            },
        });
    }
};

const converStringToDate = (date: string, time: string): Date => {
    const [day, month, year] = date.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute);
};
