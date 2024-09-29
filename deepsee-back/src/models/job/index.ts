import { Candidacy } from '../candidacy';
import { Company } from '../recruiter';
import { ContractTypes, DiplomaTypes, Skill } from '../talent';

export type JobOffer = {
    __id: number;
    _companyId: number;
    _jobOfferTestId?: number;
    archivedAt?: Date;
    candidacies?: Candidacy[];
    closedAt?: Date;
    companyAvatar?: Company['avatar'];
    companyBusiness?: Company['business'];
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
