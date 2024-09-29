import { JobOffer } from './job-model';
import { User } from './user-model';

export type Recruiter = {
    _companyId?: number;
    companyAvatar?: Company['avatar'];
    companyName?: Company['name'];
    user: User;
}

export type Company = {
    __id: number;
    _ownerId: number;
    avatar?: string;
    business?: string;
    createdAt?: Date;
    description?: string;
    jobOffers?: JobOffer[];
    name?: string;
    recruiters?: Recruiter[];
    sub?: boolean | null;
    subId?: string | null;
    updatedAt?: Date;
}

export type CompanyInvite = {
    __id: number;
    _companyId: number;
    code?: string;
    guestEmail?: string;
}
