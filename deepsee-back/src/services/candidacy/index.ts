import { Candidacy, CandidacyStatus } from '../../models/candidacy';
import { JobOffer } from '../../models/job';
import { Talent } from '../../models/talent';
import {
    dropCandidacyById,
    fetchCandidaciesByJobOfferId,
    fetchCandidaciesByTalentId,
    fetchCandidacyById,
    fetchCandidacyByTalentIdAndJobOfferId,
    saveCandidacy,
    updateCandidacy,
} from '../../repositories/candidacy';
import { fetchJobOfferById, fetchJobOfferSkills, fetchJobOfferTestRun } from '../../repositories/job';
import { fetchCompanyById } from '../../repositories/recruiter';
import { fetchUserById } from '../../repositories/user';
import { getConversationByCandidacyId } from '../chat';
import { createJobOfferTestRun, getJobOfferById } from '../job';
import { sendMail } from '../mail';
import { getCompanyById } from '../recruiter';
import { getTalentById } from '../talent';
import { getUserById } from '../user';

export const getCandidacyById = async ({ candidacyId }: {
    candidacyId: Candidacy['__id'],
}): Promise<Candidacy | undefined> => {
    const candidacy = await fetchCandidacyById({ candidacyId });
    if (!(candidacy)) {
        return undefined;
    }

    const candidacyTalent = await getTalentById({ talentId: candidacy._talentId });
    if (!(candidacyTalent)) {
        return undefined;
    }

    const candidacyJobOffer = await fetchJobOfferById({ jobOfferId: candidacy._jobOfferId });
    const candidacyJobOfferSkills = await fetchJobOfferSkills({ jobOfferId: candidacy._jobOfferId });

    return {
        ...candidacy,
        jobOfferRequiredDiploma: candidacyJobOffer?.requiredDiploma,
        jobOfferRequiredYearsOfExperience: candidacyJobOffer?.requiredYearsOfExperience,
        jobOfferSkills: candidacyJobOfferSkills,
        talentAvatar: candidacyTalent.user?.avatar,
        talentFirstName: candidacyTalent.user?.firstName,
        talentHighestDiploma: candidacyTalent.highestDiploma,
        talentLastName: candidacyTalent.user?.lastName,
        talentSkills: candidacyTalent.skills,
        talentWorkExperience: candidacyTalent.workExperiences,
        talentYearsOfExperience: candidacyTalent.yearsOfExperience,
    };
};

export const getCandidacyByTalentIdAndJobOfferId = async ({ talentId, jobOfferId }: {
    jobOfferId: JobOffer['__id'],
    talentId: Talent['user']['__id'],
}): Promise<Candidacy | undefined> => {
    const candidacy = await fetchCandidacyByTalentIdAndJobOfferId({
        jobOfferId,
        talentId,
    });

    if (!(candidacy)) {
        return undefined;
    }

    const jobOffer = await fetchJobOfferById({ jobOfferId });
    if (!(jobOffer)) {
        throw new Error(`Invalid job offer id ${jobOfferId}`);
    }
    if (!(jobOffer._jobOfferTestId)) {
        throw new Error(`Invalid job offer test id ${jobOffer._jobOfferTestId}`);
    }

    const jobOfferTestRun = await fetchJobOfferTestRun({
        jobOfferTestId: jobOffer._jobOfferTestId,
        talentId: candidacy._talentId,
    });

    return {
        ...candidacy,
        _jobOfferTestId: jobOffer._jobOfferTestId,
        testRunEndedAt: jobOfferTestRun?.endedAt,
        testRunStartableUntil: jobOfferTestRun?.startableUntil,
        testRunStartedAt: jobOfferTestRun?.startedAt,
        testRunValidatedAt: jobOfferTestRun?.validatedAt,
    };
};

export const getCandidaciesByTalentId = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<Candidacy[]> => {
    return await Promise.all((await fetchCandidaciesByTalentId({ talentId })).map(async (candidacy) => {
        const candidacyJobOffer = await fetchJobOfferById({ jobOfferId: candidacy._jobOfferId });
        if (!(candidacyJobOffer)) {
            return null!;
        }
        if (!(candidacyJobOffer._jobOfferTestId)) {
            throw new Error(`Invalid job offer test id ${candidacyJobOffer._jobOfferTestId}`);
        }

        const candidacyCompany = await fetchCompanyById({ companyId: candidacyJobOffer._companyId });
        if (!(candidacyCompany)) {
            return null!;
        }

        const jobOfferTestRun = await fetchJobOfferTestRun({
            jobOfferTestId: candidacyJobOffer._jobOfferTestId,
            talentId: candidacy._talentId,
        });

        const conversation = await getConversationByCandidacyId({ candidacyId: candidacy.__id });

        return {
            ...candidacy,
            _conversationId: conversation?.__id,
            _jobOfferTestId: candidacyJobOffer._jobOfferTestId,
            companyAvatar: candidacyCompany.avatar,
            companyId: candidacyJobOffer._companyId,
            companyName: candidacyCompany.name,
            jobOfferTitle: candidacyJobOffer.title,
            testRunEndedAt: jobOfferTestRun?.endedAt,
            testRunStartableUntil: jobOfferTestRun?.startableUntil,
            testRunStartedAt: jobOfferTestRun?.startedAt,
            testRunValidatedAt: jobOfferTestRun?.validatedAt,
        };
    }));
};

export const getCandidaciesByJobOfferId = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<Candidacy[]> => {
    return await Promise.all((await fetchCandidaciesByJobOfferId({ jobOfferId })).map(async (candidacy) => {
        const candidacyTalentUser = await fetchUserById({ userId: candidacy._talentId });
        if (!(candidacyTalentUser)) {
            return null!;
        }

        const jobOffer = await fetchJobOfferById({ jobOfferId });
        if (!(jobOffer) || !(jobOffer?._jobOfferTestId)) {
            return null!;
        }

        const jobOfferTestRun = await fetchJobOfferTestRun({
            jobOfferTestId: jobOffer._jobOfferTestId,
            talentId: candidacy._talentId,
        });

        return {
            ...candidacy,
            talentAvatar: candidacyTalentUser.avatar,
            talentFirstName: candidacyTalentUser.firstName,
            talentLastName: candidacyTalentUser.lastName,
            testRunEndedAt: jobOfferTestRun?.endedAt,
            testRunStartableUntil: jobOfferTestRun?.startableUntil,
            testRunStartedAt: jobOfferTestRun?.startedAt,
            testRunValidatedAt: jobOfferTestRun?.validatedAt,
        };
    }));
};

export const createCandidacy = async ({ candidacy }: {
    candidacy: Omit<Candidacy, '__id'>,
}): Promise<Candidacy> => {
    const suggestedCandidacy = await getCandidacyByTalentIdAndJobOfferId({
        jobOfferId: candidacy._jobOfferId,
        talentId: candidacy._talentId,
    });

    let savedCandidacy;

    if (suggestedCandidacy) {
        savedCandidacy = await updateCandidacy({
            candidacy: { ...suggestedCandidacy, message: candidacy.message },
        });
    }
    else {
        const statedCandidacy = {
            ...candidacy,
            createdAt: new Date(),
            status: CandidacyStatus.APPLIED,
        };
        savedCandidacy = await saveCandidacy({ candidacy: statedCandidacy });
    }

    if (!(savedCandidacy)) {
        throw new Error(
            `Failed to create candidacy for talent ${candidacy._talentId} and job offer ${candidacy._jobOfferId}`
        );
    }

    const candidacyTalent = await getTalentById({ talentId: savedCandidacy._talentId });
    const candidacyJobOffer = await getJobOfferById({ jobOfferId: savedCandidacy._jobOfferId });
    if (!(candidacyJobOffer)) {
        throw new Error(`Job offer ${savedCandidacy._jobOfferId} not found`);
    }

    const candidacyCompany = await getCompanyById({ companyId: candidacyJobOffer._companyId });
    if (!(candidacyCompany)) {
        throw new Error(`Company ${candidacyJobOffer._companyId} not found`);
    }

    const ownerUser = await getUserById({ userId: candidacyCompany._ownerId });

    const talentEmailMessage = {
        ...savedCandidacy,
        companyName: candidacyJobOffer?.companyName,
        jobOfferId: savedCandidacy._jobOfferId,
        jobTitle: candidacyJobOffer?.title,
        receiverName: `${candidacyTalent?.user?.firstName} ${candidacyTalent?.user?.lastName}`,
        subject: `${candidacyJobOffer?.title} candidature envoyée`,
        talentId: savedCandidacy._talentId,
    };

    await sendMail({
        data: talentEmailMessage,
        email: candidacyTalent?.user?.email,
        templateName: 'candidacy-send',
    });

    // No mail send to company if suggested candidacy
    if (suggestedCandidacy) {
        return savedCandidacy;
    }

    const recruiterEmailMessage = {
        ...savedCandidacy,
        candidacyId: savedCandidacy.__id,
        companyName: candidacyJobOffer?.companyName?.toLowerCase(),
        createdAt: new Date().toLocaleString(),
        jobOfferId: savedCandidacy._jobOfferId,
        jobTitle: candidacyJobOffer?.title,
        receiverName: candidacyJobOffer?.companyName,
        subject: `${candidacyJobOffer?.title} candidature reçue`,
        talentAvatar: candidacyTalent?.user?.avatar,
        talentName: `${candidacyTalent?.user?.firstName} ${candidacyTalent?.user?.lastName}`,
    };

    await sendMail({
        data: recruiterEmailMessage,
        email: ownerUser?.email,
        templateName: 'candidacy-received',
    });

    return savedCandidacy;
};

export const editCandidacyStatus = async ({ candidacy }: {
    candidacy: Pick<Candidacy, '__id' | 'status'>,
}): Promise<Candidacy | undefined> => {
    const updatedCandidacy = await updateCandidacy({ candidacy });
    const jobOffer = await getJobOfferById({ jobOfferId: updatedCandidacy._jobOfferId });
    if (!(jobOffer)) {
        throw new Error(`Job offer ${updatedCandidacy._jobOfferId} not found`);
    }

    const talentUser = await fetchUserById({ userId: updatedCandidacy._talentId });
    if (!(talentUser)) {
        throw new Error(`Talent ${updatedCandidacy._talentId} not found`);
    }

    if (updatedCandidacy.status === CandidacyStatus.TEST) {
        if (!(jobOffer._jobOfferTestId)) {
            throw new Error(`Job offer test ${jobOffer._jobOfferTestId} not found`);
        }

        const jobOfferTestRun = await createJobOfferTestRun({
            jobOfferTestId: jobOffer._jobOfferTestId,
            talentId: updatedCandidacy._talentId,
        });

        await sendMail({
            data: {
                companyName: jobOffer.companyName,
                jobOfferId: updatedCandidacy._jobOfferId,
                jobOfferTitle: jobOffer.title,
                receiverName: `${talentUser.firstName} ${talentUser.lastName}`,
                startableUntil: jobOfferTestRun.startableUntil?.toLocaleString(),
                subject: `Nouveau test ${jobOffer.title}`,
                talentId: updatedCandidacy._talentId,
            },
            email: talentUser?.email,
            templateName: 'new-test-run',
        });
    }

    if (updatedCandidacy.status === CandidacyStatus.ACCEPTED) {
        await sendMail({
            data: {
                companyName: jobOffer.companyName,
                jobOfferId: updatedCandidacy._jobOfferId,
                jobOfferTitle: jobOffer.title,
                receiverName: `${talentUser.firstName} ${talentUser.lastName}`,
                subject: `Candidature acceptée pour ${jobOffer.title}`,
                talentId: updatedCandidacy._talentId,
            },
            email: talentUser?.email,
            templateName: 'accepted-candidacy',
        });
    }

    if (updatedCandidacy.status === CandidacyStatus.REJECTED) {
        await sendMail({
            data: {
                companyName: jobOffer.companyName,
                jobOfferTitle: jobOffer.title,
                receiverName: `${talentUser.firstName} ${talentUser.lastName}`,
                subject: `Candidature refusée pour ${jobOffer.title}`,
                talentId: updatedCandidacy._talentId,
            },
            email: talentUser?.email,
            templateName: 'refused-candidacy',
        });
    }

    return updatedCandidacy;
};

export const deleteCandidacyById = async ({ candidacyId }: {
    candidacyId: Candidacy['__id'],
}): Promise<void> => {
    await dropCandidacyById({ candidacyId });
};
