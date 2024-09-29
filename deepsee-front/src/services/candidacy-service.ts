import { Candidacy, CandidacyStatus } from '../models/candidacy-model';
import { JobOffer } from '../models/job-model';
import { Talent } from '../models/talent-model';
import api from '../utils/api-utils';

const API_URL = 'candidacies';

export const getTalentCandidacyForJobOffer = async ({ talentId, jobOfferId }: {
    jobOfferId: JobOffer['__id'],
    talentId: Talent['user']['__id'],
}): Promise<Candidacy> => {
    return (await api.get(`${API_URL}/${talentId}/${jobOfferId}`)).data as Candidacy;
};

export const getCandidaciesByTalent = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<{ [status in CandidacyStatus]: Candidacy[] }> => {
    return (await api.get(`${API_URL}/talent/${talentId}`)).data as { [status in CandidacyStatus]: Candidacy[] };
};

export const getCandidaciesByJobOffer = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<{ [status in CandidacyStatus]: Candidacy[] }> => {
    return (await api.get(`${API_URL}/job/${jobOfferId}`)).data as { [status in CandidacyStatus]: Candidacy[] };
};

export const getCandidacy = async ({ candidacyId }: {
    candidacyId: Candidacy['__id'],
}): Promise<Candidacy> => {
    return (await api.get(`${API_URL}/candidacy/${candidacyId}`)).data as Candidacy;
};

export const createCandidacy = async ({ jobOfferId, talentId, message }: {
    jobOfferId: JobOffer['__id'],
    message: Candidacy['message'],
    talentId: Talent['user']['__id'],
}): Promise<Candidacy> => {
    return (await api.post(`${API_URL}/create`, { jobOfferId, message, talentId })).data as Candidacy;
};

export const updateCandidacyStatus = async ({ candidacyId, status }: {
    candidacyId: Candidacy['__id'],
    status: Candidacy['status'],
}): Promise<Candidacy> => {
    return (await api.patch(`${API_URL}/status`, { candidacyId, status })).data as Candidacy;
};

export const deleteCandidacy = async ({ candidacyId }: { candidacyId: Candidacy['__id'] }): Promise<void> => {
    return await api.delete(`${API_URL}/${candidacyId}`);
};

export const createMeeting = async ({ candidacyId, address, date, time, senderId }: {
    address: string,
    candidacyId: Candidacy['__id'],
    date: string,
    senderId: number,
    time: string,
}): Promise<string> => {
    return await api.post(`${API_URL}/create-meeting`, { address, candidacyId, date, senderId, time });
};
