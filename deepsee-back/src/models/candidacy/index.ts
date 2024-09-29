import { JobOffer, JobOfferTestRun } from '../job';
import { Company } from '../recruiter';
import { Talent } from '../talent';
import { User } from '../user';

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
