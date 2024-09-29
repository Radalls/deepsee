import { Company } from '../models/recruiter-model';
import api from '../utils/api-utils';

const API_URL = 'sub';

export const createSubscriptionSession = async ({ companyId }: {
    companyId: Company['__id'],
}): Promise<any> => {
    const response = (await api.post(`${API_URL}/session`, {
        companyId,
    }));

    return response.data;
};

export const createPortalSession = async ({ companyId, sessionId }: {
    companyId: Company['__id'],
    sessionId: Company['subId'],
}): Promise<any> => {
    const response = (await api.post(`${API_URL}/portal`, {
        companyId,
        sessionId,
    }));

    return response.data;
};
