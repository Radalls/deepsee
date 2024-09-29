import { Candidacy } from './candidacy-model';
import { Company } from './recruiter-model';
import { User } from './user-model';

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
    endedAt?: Date;
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
    endedAt?: Date;
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

export const diplomaTypesOptions = [
    { label: 'Aucun', value: 'NONE' },
    { label: 'Licence', value: 'BACHELOR' },
    { label: 'Master', value: 'MASTER' },
    { label: 'Doctorat', value: 'PHD' },
    { label: 'Autre', value: 'OTHER' },
];

export const diplomaTypesTrads = {
    BACHELOR: 'Bac +3',
    MASTER: 'Bac +5',
    NONE: 'Bac +0',
    OTHER: 'Bac +0',
    PHD: 'Bac +8',
};

export const levelsTrads = {
    EDUCATION: 'Formation',
    PROFESSIONAL: 'Travail',
    SELF_TAUGHT: 'Personnel',
};

export const levelsOptions = [
    { label: 'Personnel', value: 'SELF_TAUGHT' },
    { label: 'Formation', value: 'EDUCATION' },
    { label: 'Travail', value: 'PROFESSIONAL' },
];

export const contractTypesTrads = {
    APPRENTICESHIP: 'Alternance',
    FIXED_TERM: 'CDD',
    FREELANCE: 'Freelance',
    INTERNSHIP: 'Stage',
    PERMANENT: 'CDI',
};

export const contractTypesOptions = [
    { label: 'CDD', value: 'FIXED_TERM' },
    { label: 'CDI', value: 'PERMANENT' },
    { label: 'Alternance', value: 'APPRENTICESHIP' },
    { label: 'Stage', value: 'INTERNSHIP' },
    { label: 'Freelance', value: 'FREELANCE' },
];
