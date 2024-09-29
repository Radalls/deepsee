import { Candidacy, CandidacyStatus } from '../../models/candidacy';
import { JobOffer, JobOfferStatus, JobOfferTest, JobOfferTestRun } from '../../models/job';
import { Company } from '../../models/recruiter';
import { Talent } from '../../models/talent';
import { countCandidaciesByJobOfferId, dropCandidacyById, saveCandidacy } from '../../repositories/candidacy';
import {
    fetchJobOfferById,
    saveJobOffer,
    fetchJobOffersByCompanyId,
    fetchJobOffersBySearchParams,
    fetchJobOfferSkills,
    fetchJobOfferTestById,
    saveJobOfferTest,
    saveJobOfferTestRun,
    fetchJobOfferTestRun,
    updateJobOfferTestRun,
    saveJobOfferSkill,
    updateJobOfferStatus,
    updateJobOffer,
    updateJobOfferTest,
    updateJobOfferSkill,
    deleteJobOfferSkill,
    fetchallJobOffers,
} from '../../repositories/job';
import { fetchCompanyById } from '../../repositories/recruiter';
import { fetchTalentSearchConfigsByJobOfferParams } from '../../repositories/talent';
import { match, runTestCode } from '../../utils/job';
import { editCandidacyStatus, getCandidaciesByJobOfferId } from '../candidacy';
import { sendMail } from '../mail';
import { getAllTalents, getTalentById } from '../talent';
import { getUserById } from '../user';

export const getJobOfferById = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<JobOffer | undefined> => {
    const jobOffer = await fetchJobOfferById({ jobOfferId });
    if (!(jobOffer)) {
        return;
    }

    const jobOfferSkills = await fetchJobOfferSkills({ jobOfferId: jobOffer.__id });
    const jobOfferCompany = await fetchCompanyById({ companyId: jobOffer._companyId });

    return {
        ...jobOffer,
        companyAvatar: jobOfferCompany?.avatar,
        companyBusiness: jobOfferCompany?.business,
        companyDescription: jobOfferCompany?.description,
        companyName: jobOfferCompany?.name,
        requiredSkills: jobOfferSkills,
    };
};

export const getJobOffersByCompanyId = async ({ companyId }: {
    companyId: Company['__id'],
}): Promise<JobOffer[]> => {
    return await Promise.all((await fetchJobOffersByCompanyId({ companyId })).map(async (jobOffer) => {
        const jobOfferNbOfCandidacies = await countCandidaciesByJobOfferId({ jobOfferId: jobOffer.__id });
        const jobOfferSkills = await fetchJobOfferSkills({ jobOfferId: jobOffer.__id });
        const jobOfferCompany = await fetchCompanyById({ companyId: jobOffer._companyId });

        return {
            ...jobOffer,
            companyAvatar: jobOfferCompany?.avatar,
            companyName: jobOfferCompany?.name,
            nbOfCandidacies: jobOfferNbOfCandidacies,
            requiredSkills: jobOfferSkills,
        };
    }));
};

export const getJobOffersBySearchParams = async ({ params }: {
    params: any,
}): Promise<JobOffer[]> => {
    return await Promise.all((await fetchJobOffersBySearchParams({ params })).map(async (jobOffer) => {
        const jobOfferSkills = await fetchJobOfferSkills({ jobOfferId: jobOffer.__id });
        const jobOfferCompany = await fetchCompanyById({ companyId: jobOffer._companyId });

        return {
            ...jobOffer,
            companyAvatar: jobOfferCompany?.avatar,
            companyName: jobOfferCompany?.name,
            requiredSkills: jobOfferSkills,
        };
    }));
};

export const getJobOfferSuggestionsByTalentId = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<JobOffer[]> => {
    const talent = await getTalentById({ talentId });
    if (!(talent)) {
        throw new Error(`Could not find talent: ${talentId}`);
    }

    const jobOffers: JobOffer[] = await Promise.all((await fetchallJobOffers()).map(async (jobOffer) => {
        const jobOfferSkills = await fetchJobOfferSkills({ jobOfferId: jobOffer.__id });
        const jobOfferCompany = await fetchCompanyById({ companyId: jobOffer._companyId });

        return {
            ...jobOffer,
            companyAvatar: jobOfferCompany?.avatar,
            companyName: jobOfferCompany?.name,
            requiredSkills: jobOfferSkills,
        };
    }));

    const jobOffersForSuggestion = jobOffers.map((jobOffer) => {
        const matchScore = match({ jobOffer, talent });

        if (matchScore >= 70) {
            return jobOffer;
        }

        return null!;
    }).filter((jobOffer) => jobOffer);

    return jobOffersForSuggestion;
};

export const createJobOffer = async ({ jobOffer, jobOfferTest }: {
    jobOffer: Omit<JobOffer, 'status' | 'createdAt' | '__id' | 'state'>,
    jobOfferTest?: Omit<JobOfferTest, '__id' | 'createdAt' | 'updatedAt'>,
}): Promise<{ jobOffer: JobOffer, jobOfferTest?: JobOfferTest }> => {
    const statedJobOffer: Omit<JobOffer, '__id'> = {
        ...jobOffer,
        createdAt: new Date(),
        status: JobOfferStatus.DRAFT,
    };

    const statedJobOfferTest: Omit<JobOfferTest, '__id' | 'updatedAt'> | undefined = (jobOfferTest)
        ? {
            ...jobOfferTest,
            createdAt: new Date(),
        }
        : undefined;

    const registeredJobOfferTest = (statedJobOfferTest)
        ? await saveJobOfferTest({ jobOfferTest: statedJobOfferTest })
        : undefined;

    const registeredJobOffer = await saveJobOffer({
        jobOffer: statedJobOffer,
        jobOfferTestId: registeredJobOfferTest?.__id,
    });

    jobOffer.requiredSkills?.forEach(async (skill) => {
        await saveJobOfferSkill({ jobOfferId: registeredJobOffer.__id, jobOfferSkill: skill });
    });

    return {
        jobOffer: registeredJobOffer,
        jobOfferTest: registeredJobOfferTest,
    };
};

export const editJobOffer = async ({ newJobOffer, newJobOfferTest }: {
    newJobOffer: Omit<JobOffer, '_companyId'>,
    newJobOfferTest?: JobOfferTest,
}): Promise<{ jobOffer: JobOffer, jobOfferTest?: JobOfferTest }> => {
    const updatedJobOfferTest = (newJobOfferTest)
        ? await updateJobOfferTest({ jobOfferTest: newJobOfferTest })
        : undefined;

    const updatedJobOffer = await updateJobOffer({ jobOffer: newJobOffer });

    const oldJobOfferSkills = await fetchJobOfferSkills({ jobOfferId: newJobOffer.__id });
    newJobOffer.requiredSkills?.forEach(async (newSkill) => {
        const existingSkill = oldJobOfferSkills.find((oldSkill) => oldSkill.__id === newSkill.__id);
        if (!(existingSkill)) {
            await saveJobOfferSkill({ jobOfferId: updatedJobOffer.__id, jobOfferSkill: newSkill });
        }
        else if (existingSkill.level !== newSkill.level) {
            await updateJobOfferSkill({ jobOfferId: updatedJobOffer.__id, jobOfferSkill: newSkill });
        }
    });
    const oldSkillsToRemove = oldJobOfferSkills.filter(
        (oldSkill) => !(newJobOffer.requiredSkills?.find((newSkill) => newSkill.__id === oldSkill.__id)),
    );
    if (oldSkillsToRemove.length) {
        oldSkillsToRemove.forEach(async (skill) => {
            await deleteJobOfferSkill({ jobOfferId: updatedJobOffer.__id, jobOfferSkillId: skill.__id });
        });
    }

    return {
        jobOffer: updatedJobOffer,
        jobOfferTest: updatedJobOfferTest,
    };
};

export const editJobOfferStatus = async ({ jobOffer }: {
    jobOffer: Pick<JobOffer, '__id' | 'status'>,
}): Promise<JobOffer> => {
    const updatedJobOffer = await updateJobOfferStatus({ jobOffer });

    if (jobOffer.status === JobOfferStatus.PUBLISHED) {
        const publishedJobOffer = await updateJobOffer({
            jobOffer: {
                ...updatedJobOffer,
                publishedAt: new Date(),
            },
        });

        await createJobOfferSuggestions({ jobOfferId: publishedJobOffer.__id });
        await createJobOfferAlerts({ jobOfferId: publishedJobOffer.__id });

        return publishedJobOffer;
    }
    else if (jobOffer.status === JobOfferStatus.CLOSED) {
        const candidacies = await getCandidaciesByJobOfferId({ jobOfferId: updatedJobOffer.__id });
        for (const candidacy of candidacies) {
            if (candidacy.status === CandidacyStatus.ACCEPTED) {
                continue;
            }
            if (candidacy.status === CandidacyStatus.SUGGESTED && !(candidacy.message)) {
                await dropCandidacyById({ candidacyId: candidacy.__id });
                continue;
            }

            await editCandidacyStatus({ candidacy: { ...candidacy, status: CandidacyStatus.REJECTED } });
        }
    }

    return updatedJobOffer;
};

export const createJobOfferSuggestions = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<void> => {
    const jobOffer = await getJobOfferById({ jobOfferId });
    if (!(jobOffer)) {
        throw new Error(`Could not find job offer: ${jobOfferId}`);
    }

    const talents = await getAllTalents();

    const talentsForSuggestions = talents.map((talent) => {
        const matchScore = match({ jobOffer, talent });

        if (matchScore >= 70) {
            return talent;
        }

        return null!;
    }).filter((talent) => talent);

    if (talentsForSuggestions.length) {
        for (const talent of talentsForSuggestions) {
            const candidacy: Omit<Candidacy, '__id'> = {
                _jobOfferId: jobOffer.__id,
                _talentId: talent.user.__id,
                createdAt: new Date(),
                status: CandidacyStatus.SUGGESTED,
            };

            await saveCandidacy({ candidacy });
        }
    }
};

export const createJobOfferAlerts = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<void> => {
    const jobOffer = await getJobOfferById({ jobOfferId });
    if (!(jobOffer)) {
        throw new Error(`Could not find job offer: ${jobOfferId}`);
    }

    const searchConfigsForAlert = await fetchTalentSearchConfigsByJobOfferParams({ jobOffer });
    for (const config of searchConfigsForAlert) {
        const talentUser = await getUserById({ userId: config._talentId });
        if (!(talentUser)) {
            throw new Error(`Could not find talent: ${config._talentId}`);
        }

        const alertEmailMessage = {
            companyName: jobOffer.companyName,
            jobOfferId: jobOffer.__id,
            jobTitle: jobOffer.title,
            receiverName: `${talentUser.firstName} ${talentUser.lastName}`,
            subject: `${jobOffer.title} nouvelle alerte`,
            talentId: config._talentId,
        };

        await sendMail({
            data: alertEmailMessage,
            email: talentUser.email,
            templateName: 'job-offer-alert',
        });
    }
};

export const getJobOfferTestById = async ({ jobOfferTestId }: {
    jobOfferTestId: JobOfferTest['__id'],
}): Promise<JobOfferTest | undefined> => {
    return await fetchJobOfferTestById({ jobOfferTestId });
};

export const createJobOfferTestRun = async ({ jobOfferTestId, talentId }: {
    jobOfferTestId: number,
    talentId: number,
}): Promise<JobOfferTestRun> => {
    const statedJobOfferTestRun: Pick<JobOfferTestRun, '_jobOfferTestId' | 'startableUntil' | '_talentId'> = {
        _jobOfferTestId: jobOfferTestId,
        _talentId: talentId,
        startableUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    };

    return await saveJobOfferTestRun({ jobOfferTestRun: statedJobOfferTestRun });
};

export const editJobOfferTestRun = async ({ jobOfferTestRun }: {
    jobOfferTestRun: Omit<JobOfferTestRun, 'startableUntil' | 'validatedAt'>,
}): Promise<JobOfferTestRun> => {
    return await updateJobOfferTestRun({ jobOfferTestRun });
};

export const runJobOfferTestRunCode = async ({ jobOfferTestId, talentId, testCode }: {
    jobOfferTestId: number,
    talentId: number,
    testCode: string,
}): Promise<boolean> => {
    const jobOfferTest = await fetchJobOfferTestById({ jobOfferTestId });
    if (!(jobOfferTest)) {
        throw new Error('Job offer test not found');
    }
    if (!(jobOfferTest.unitName)) {
        throw new Error('Job offer test has no unit name');
    }
    if (!(jobOfferTest.units)) {
        throw new Error('Job offer test has no unit tests');
    }

    const runResult = await runTestCode(
        testCode,
        jobOfferTest.unitName,
        jobOfferTest.units,
    );

    if (runResult) {
        const jobOfferTestRun = await fetchJobOfferTestRun({
            jobOfferTestId: jobOfferTest.__id,
            talentId,
        });
        if (!(jobOfferTestRun)) {
            throw new Error('Job offer test run not found');
        }

        await updateJobOfferTestRun({
            jobOfferTestRun: { ...jobOfferTestRun, validatedAt: new Date() },
        });
    }

    return runResult;
};
