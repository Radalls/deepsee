import { Candidacy } from '../candidacy';
import { Company } from '../recruiter';
import { User } from '../user';

export type Talent = {
    candidacies?: Candidacy[];
    createdAt?: Date;
    description?: string;
    educationExperiences?: TalentEducationExperience[];
    externalLinks?: string[];
    highestDiploma?: DiplomaTypes;
    openToWork?: boolean;
    recommandations?: TalentRecommandation[];
    skills?: Skill[];
    title?: string;
    updatedAt?: Date;
    user: User;
    workExperiences?: TalentWorkExperience[];
    yearsOfExperience?: number;
}

export type TalentRecommandation = {
    __id: number;
    _authorId: number;
    _experienceId?: number | null;
    _recipientId: number;
    authorAvatar?: User['avatar'];
    authorFirstName?: User['firstName'];
    authorLastName?: User['lastName'];
    createdAt?: Date;
    experienceCompanyName?: TalentWorkExperience['companyName'];
    experienceTitle?: TalentWorkExperience['title'];
    message?: string;
    skills?: Skill[];
}

export type TalentEducationExperience = {
    __id: number;
    _talentId?: number;
    createdAt?: Date;
    description?: string;
    diplomaType?: DiplomaTypes;
    endedAt?: Date | null;
    schoolName?: string;
    skills?: Skill[];
    startedAt: Date;
    title?: string;
    updatedAt?: Date;
}

export type TalentWorkExperience = {
    __id: number;
    _talentId?: number;
    companyName: Company['name'];
    contractType?: ContractTypes;
    createdAt?: Date;
    description?: string;
    endedAt?: Date | null;
    skills?: Skill[];
    startedAt: Date;
    title?: string;
    updatedAt?: Date;
}

export type TalentSearchConfig = {
    __id: number;
    _talentId: number;
    alert?: boolean,
    companyBusiness?: string;
    companyName?: string;
    contractType?: ContractTypes;
    location?: string;
    text?: string,
}

export type Skill = {
    __id: number;
    level?: SkillLevels;
    logo?: string;
    name: string;
}

export enum SkillLevels {
    EDUCATION = 'EDUCATION',
    PROFESSIONAL = 'PROFESSIONAL',
    SELF_TAUGHT = 'SELF_TAUGHT',
}

export enum ContractTypes {
    APPRENTICESHIP = 'APPRENTICESHIP',
    FIXED_TERM = 'FIXED_TERM', // CDD
    FREELANCE = 'FREELANCE',
    INTERNSHIP = 'INTERNSHIP',
    PERMANENT = 'PERMANENT', // CDI
}

export enum DiplomaTypes {
    BACHELOR = 'BACHELOR',
    MASTER = 'MASTER',
    NONE = 'NONE',
    OTHER = 'OTHER',
    PHD = 'PHD',
}
