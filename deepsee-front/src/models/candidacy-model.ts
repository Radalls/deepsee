import { JobOffer, JobOfferTestRun } from './job-model';
import { Company } from './recruiter-model';
import { Talent } from './talent-model';
import { User } from './user-model';

export type Candidacy = {
    __id: number;
    _companyId?: number;
    _conversationId?: number;
    _jobOfferId: number;
    _jobOfferTestId?: number;
    _talentId: number;
    companyAvatar?: Company['avatar'];
    companyName?: Company['name'];
    createdAt?: Date;
    interviewDate?: Date;
    jobOfferRequiredDiploma?: JobOffer['requiredDiploma'];
    jobOfferRequiredYearsOfExperience?: JobOffer['requiredYearsOfExperience'];
    jobOfferSkills?: JobOffer['requiredSkills'];
    jobOfferTitle?: JobOffer['title'];
    meetLink?: string;
    message?: string;
    phoneInterviewDate?: Date;
    status?: CandidacyStatus;
    talentAvatar?: User['avatar'];
    talentFirstName?: User['firstName'];
    talentHighestDiploma?: Talent['highestDiploma'];
    talentLastName?: User['lastName'];
    talentSkills?: Talent['skills'];
    talentWorkExperience?: Talent['workExperiences'];
    talentYearsOfExperience?: Talent['yearsOfExperience'];
    testRunEndedAt?: JobOfferTestRun['endedAt'];
    testRunStartableUntil?: JobOfferTestRun['startableUntil'];
    testRunStartedAt?: JobOfferTestRun['startedAt'];
    testRunValidatedAt?: JobOfferTestRun['validatedAt'];
    updatedAt?: Date;
}

export enum CandidacyStatus {
    ACCEPTED = 'ACCEPTED',
    APPLIED = 'APPLIED',
    INTERVIEW = 'INTERVIEW',
    PHONE_INTERVIEW = 'PHONE_INTERVIEW',
    REJECTED = 'REJECTED',
    SELECTED = 'SELECTED',
    SUGGESTED = 'SUGGESTED',
    TEST = 'TEST',
}

// NOTE: L'ordre est important
export const candidaciesStatus = [
    CandidacyStatus.SUGGESTED,
    CandidacyStatus.APPLIED,
    CandidacyStatus.SELECTED,
    CandidacyStatus.TEST,
    CandidacyStatus.PHONE_INTERVIEW,
    CandidacyStatus.INTERVIEW,
    CandidacyStatus.ACCEPTED,
    CandidacyStatus.REJECTED,
];

export const candidaciesStatusColumns = [
    {
        color: '#EDD0FF',
        name: 'Suggestions',
        status: CandidacyStatus.SUGGESTED,
    },
    {
        color: '#D3DAFF',
        name: 'Candidatures',
        status: CandidacyStatus.APPLIED,
    },
    {
        color: '#bfd8ff',
        name: 'Sélectionnés',
        status: CandidacyStatus.SELECTED,
    },
    {
        color: '#BFE4FF',
        name: 'Test technique',
        status: CandidacyStatus.TEST,
    },
    {
        color: '#bff3ff',
        name: 'Entretien téléphonique',
        status: CandidacyStatus.PHONE_INTERVIEW,
    },
    {
        color: '#b2ffed',
        name: 'Entretien physique',
        status: CandidacyStatus.INTERVIEW,
    },
    {
        color: '#B2FFBE',
        name: 'Acceptés',
        status: CandidacyStatus.ACCEPTED,
    },
    {
        color: '#FFB2B2',
        name: 'Refusés',
        status: CandidacyStatus.REJECTED,
    },
];
