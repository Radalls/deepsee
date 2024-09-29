import { Candidacy } from './candidacy-model';
import { Company } from './recruiter-model';
import { ContractTypes, DiplomaTypes, Skill } from './talent-model';

export type JobOffer = {
    __id: number;
    _companyId: number;
    _jobOfferTestId?: number;
    archivedAt?: Date;
    candidacies?: Candidacy[];
    closedAt?: Date;
    companyAvatar?: Company['avatar'];
    companyDescription?: Company['description'];
    companyName?: Company['name'];
    contractType?: ContractTypes;
    createdAt?: Date;
    location?: string;
    mainDescription?: string;
    nbOfCandidacies?: number;
    publishedAt?: Date;
    requiredDiploma?: DiplomaTypes;
    requiredSkills?: Skill[];
    requiredYearsOfExperience?: number;
    requirementDescription?: string;
    status?: JobOfferStatus;
    title?: string;
    updatedAt?: Date;
    workDescription?: string;
}

export type JobOfferTest = {
    __id: number;
    createdAt?: Date;
    duration?: number;
    instructions?: string;
    unitName?: string;
    units?: JobOfferTestUnit[];
    updatedAt?: Date;
}

export type JobOfferTestUnit = {
    expected: any;
    params: any[];
}

export type JobOfferTestRun = {
    _jobOfferTestId: number;
    _talentId: number;
    endedAt?: Date;
    startableUntil?: Date;
    startedAt?: Date;
    validatedAt?: Date;
}

export enum JobOfferStatus {
    ARCHIVED = 'ARCHIVED',
    CLOSED = 'CLOSED',
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
}

export const JobOfferStatusTrad = {
    [JobOfferStatus.PUBLISHED]: 'Publiée',
    [JobOfferStatus.DRAFT]: 'Brouillon',
    [JobOfferStatus.ARCHIVED]: 'Archivée',
    [JobOfferStatus.CLOSED]: 'Fermée',
};
