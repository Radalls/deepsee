import { JobOffer, JobOfferTest, JobOfferTestRun } from '../models/job-model';
import { Company } from '../models/recruiter-model';
import { Talent } from '../models/talent-model';
import api from '../utils/api-utils';

const API_URL = 'jobs';

export const getJobOffer = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<JobOffer> => {
    return (await api.get(`${API_URL}/${jobOfferId}`)).data as JobOffer;
};

export const getJobOffersByCompany = async ({ companyId }: {
    companyId: Company['__id'],
}): Promise<JobOffer[]> => {
    return (await api.get(`${API_URL}/company/${companyId}`)).data as JobOffer[];
};

export const searchJobOffers = async ({ params }: {
    params: any,
}): Promise<JobOffer[]> => {
    return (await api.get(`${API_URL}/search`, { params })).data as JobOffer[];
};

export const getJobOfferSuggestions = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<JobOffer[]> => {
    return (await api.get(`${API_URL}/search/${talentId}`)).data as JobOffer[];
};

export const createJobOffer = async ({ jobOffer, jobOfferTest }: {
    jobOffer: {
        companyId: number,
        contractType: string,
        location: string,
        mainDescription: string,
        requiredDiploma: string,
        requiredSkills: { __id: number, level: string, name: string }[],
        requiredYearsOfExperience: number,
        requirementDescription: string,
        title: string,
        workDescription: string,
    },
    jobOfferTest?: {
        duration: string;
        instructions: string;
        unitName: string;
        units: { expected: string, params: string }[];
    },
}): Promise<{ jobOffer: JobOffer, jobOfferTest: JobOfferTest }> => {
    return (await api.post(`${API_URL}/draft`, {
        ...jobOffer,
        test: jobOfferTest,
    })).data as { jobOffer: JobOffer, jobOfferTest: JobOfferTest };
};

export const updateJobOffer = async ({ jobOffer, jobOfferTest }: {
    jobOffer: {
        __id: number,
        contractType: string,
        location: string,
        mainDescription: string,
        requiredDiploma: string,
        requiredSkills: { __id: number, level: string, name: string }[],
        requiredYearsOfExperience: number,
        requirementDescription: string,
        title: string,
        workDescription: string,
    },
    jobOfferTest?: {
        __id: number,
        duration: string;
        instructions: string;
        unitName: string;
        units: { expected: string, params: string }[];
    },
}): Promise<{ jobOffer: JobOffer, jobOfferTest: JobOfferTest }> => {
    return (await api.patch(`${API_URL}/draft`, {
        ...jobOffer,
        test: jobOfferTest,
    })).data as { jobOffer: JobOffer, jobOfferTest: JobOfferTest };
};

export const updateJobOfferStatus = async ({ jobOfferId, status }: {
    jobOfferId: JobOffer['__id'],
    status: JobOffer['status'],
}) => {
    return (await api.patch(`${API_URL}/status`, { jobOfferId, status })).data as JobOffer;
};

export const getJobOfferTest = async ({ jobOfferTestId }: {
    jobOfferTestId: JobOfferTest['__id'],
}): Promise<JobOfferTest> => {
    return (await api.get(`${API_URL}/test/${jobOfferTestId}`)).data as JobOfferTest;
};

export const updateJobOfferTestRun = async ({ jobOfferTestRun }: {
    jobOfferTestRun: JobOfferTestRun,
}): Promise<JobOfferTestRun> => {
    return (await api.patch(`${API_URL}/run`, jobOfferTestRun)).data as JobOfferTestRun;
};

export const createJobOfferTestRunCode = async ({ jobOfferTestId, talentId, testCode }: {
    jobOfferTestId: JobOfferTest['__id'],
    talentId: Talent['user']['__id'],
    testCode: string,
}): Promise<boolean> => {
    return (await api.post(`${API_URL}/test/${jobOfferTestId}/${talentId}/run`, { testCode })).data as boolean;
};
