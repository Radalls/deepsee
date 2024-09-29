import { Company, CompanyInvite, Recruiter } from '../models/recruiter-model';
import api from '../utils/api-utils';

const API_URL = 'recruiters';

export const getRecruiter = async ({ recruiterId }: {
    recruiterId: Recruiter['user']['__id'],
}): Promise<Recruiter> => {
    return (await api.get(`${API_URL}/${recruiterId}`)).data as Recruiter;
};

export const getCompany = async ({ companyName }: {
    companyName: Company['name'],
}): Promise<Company> => {
    return (await api.get(`${API_URL}/company/${companyName}`)).data as Company;
};

export const createCompany = async ({ _ownerId, business, description, name }: {
    _ownerId: Company['_ownerId'],
    business: Company['business'],
    description: Company['description'],
    name: Company['name'],
}): Promise<Company> => {
    return (await api.post('auth/company', {
        _ownerId,
        business,
        description,
        name,
    })).data as Company;
};

export const updateCompany = async ({ company }: {
    company: Omit<Company, '_ownerId'>,
}): Promise<Company> => {
    return (await api.patch(`${API_URL}/company/${company.__id}`, {
        company,
    })).data as Company;
};

export const createCompanyInvite = async ({ _companyId, guestEmail }: {
    _companyId: CompanyInvite['_companyId'],
    guestEmail: CompanyInvite['guestEmail'],
}): Promise<CompanyInvite> => {
    return (await api.post(`${API_URL}/company/invite`, {
        _companyId,
        guestEmail,
    })).data as CompanyInvite;
};

export const checkCompanyInviteCode = async ({ code }: {
    code: CompanyInvite['code'],
}): Promise<CompanyInvite | undefined> => {
    return (await api.post('auth/invite', { code })).data as CompanyInvite;
};

export const deleteCompany = async ({ companyId }: { companyId: number }): Promise<void> => {
    await api.delete(`${API_URL}/company/${companyId}`);
};
