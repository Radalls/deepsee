import { Company, CompanyInvite, Recruiter } from '../../models/recruiter';
import { User } from '../../models/user';
import { fetchJobOffersByCompanyId } from '../../repositories/job';
import {
    dropCompanyById,
    fetchCompanyById,
    fetchCompanyByName,
    fetchCompanyInviteByCode,
    fetchRecruiterByCompanyid,
    fetchRecruiterById,
    saveCompany,
    saveCompanyInvite,
    saveRecruiter,
    updateCompany,
    updateRecruiter,
} from '../../repositories/recruiter';
import { fetchUserById } from '../../repositories/user';
import { generateCompanyInviteCode } from '../../utils/recruiter';
import { sendMail } from '../mail';
import { createUser, deleteUserById } from '../user';

export const getRecruiterById = async ({ recruiterId }: {
    recruiterId: Recruiter['user']['__id'],
}): Promise<Recruiter | undefined> => {
    const recruiterUser = await fetchUserById({ userId: recruiterId });
    if (!(recruiterUser)) {
        return;
    }

    const recruiter = await fetchRecruiterById({ recruiterId });
    if (!(recruiter)) {
        return;
    }
    if (!(recruiter._companyId)) {
        throw new Error('Recruiter has no company');
    }

    const recruiterCompany = await fetchCompanyById({ companyId: recruiter._companyId });
    if (!(recruiterCompany)) {
        return;
    }

    return {
        ...recruiter,
        companyAvatar: recruiterCompany.avatar,
        companyName: recruiterCompany.name,
        user: recruiterUser,
    };
};

export const createRecruiter = async ({ companyId, userCredentials }: {
    companyId: Recruiter['_companyId'],
    userCredentials: Required<Pick<User, 'email' | 'firstName' | 'lastName' | 'password' | 'role'>>,
}): Promise<Recruiter> => {
    const user = await createUser({ userCredentials });

    const statedRecruiter = {
        _companyId: companyId,
        user,
    };

    return await saveRecruiter({ recruiter: statedRecruiter });
};

export const editRecruiter = async ({ recruiter }: {
    recruiter: Recruiter,
}) => {
    return await updateRecruiter({ recruiter });
};

export const getCompanyById = async ({ companyId }: {
    companyId: Company['__id'],
}): Promise<Company | undefined> => {
    const company = await fetchCompanyById({ companyId });
    if (!(company)) {
        return;
    }

    const companyJobOffers = await fetchJobOffersByCompanyId({ companyId: company.__id });
    const companyRecruiters = [] as Recruiter[]; //TODO: implement fetchRecruitersByCompanyId

    return {
        ...company,
        jobOffers: companyJobOffers,
        recruiters: companyRecruiters,
    };
};

export const getCompanyByName = async ({ companyName }: {
    companyName: Company['name'],
}): Promise<Company | undefined> => {
    const company = await fetchCompanyByName({ companyName });
    if (!(company)) {
        return;
    }

    const companyJobOffers = await fetchJobOffersByCompanyId({ companyId: company.__id });
    const companyRecruiters = [] as Recruiter[]; //TODO: implement fetchRecruitersByCompanyId

    return {
        ...company,
        jobOffers: companyJobOffers,
        recruiters: companyRecruiters,
    };
};

export const createCompany = async ({ company }: {
    company: Omit<Company, '__id'>,
}): Promise<Company> => {
    const registeredCompany = await saveCompany({ company });
    const companyOwner = await fetchRecruiterById({ recruiterId: registeredCompany._ownerId });
    if (!(companyOwner)) {
        throw new Error('Company owner not found');
    }

    await editRecruiter({
        recruiter: {
            ...companyOwner,
            _companyId: registeredCompany.__id,
        },
    });

    return registeredCompany;
};

export const editCompany = async ({ company, companyId }: {
    company: Partial<Company>,
    companyId: number,
}): Promise<Company> => {
    const statedCompany = {
        __id: companyId,
        ...company,
    };

    return await updateCompany({ company: statedCompany });
};

export const getCompanyInviteByCode = async ({ code }: {
    code: CompanyInvite['code'],
}): Promise<CompanyInvite | undefined> => {
    return await fetchCompanyInviteByCode({ code });
};

export const createCompanyInvite = async ({ companyInvite }: {
    companyInvite: Omit<CompanyInvite, '__id'>,
}): Promise<CompanyInvite> => {
    const statedCompanyInvite = {
        ...companyInvite,
        code: generateCompanyInviteCode(),
    };

    const registeredCompanyInvite = await saveCompanyInvite({ companyInvite: statedCompanyInvite });
    const company = await fetchCompanyById({ companyId: registeredCompanyInvite._companyId });
    if (!(company)) {
        throw new Error('Company not found');
    }

    await sendMail({
        data: {
            code: registeredCompanyInvite.code,
            companyName: company.name,
            subject: 'Invitation à rejoindre un espace entreprise',
        },
        email: registeredCompanyInvite.guestEmail,
        templateName: 'company-invite',
    });

    return registeredCompanyInvite;
};

export const deleteCompanyById = async ({ companyId }: {
    companyId: number,
}): Promise<void> => {
    const company = await fetchCompanyById({ companyId });
    if (!(company)) {
        throw new Error('Company not found');
    }

    const recruiters = await fetchRecruiterByCompanyid({ companyId });
    for (const recruiter of recruiters) {
        await deleteUserById({ userId: recruiter.user.__id });
    }

    await dropCompanyById({ companyId });
};
