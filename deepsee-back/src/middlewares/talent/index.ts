import { NextFunction, Request, Response } from 'express';

import {
    ContractTypes,
    DiplomaTypes,
    Skill,
    SkillLevels,
    Talent,
    TalentEducationExperience,
    TalentRecommandation,
    TalentSearchConfig,
    TalentWorkExperience,
} from '../../models/talent';
import { validateBoolean, validateDate, validateEnum, validateNumber, validateString } from '../../utils/validation';

export interface TalentPatchRequest extends Request {
    validatedData?: {
        talent: Omit<Talent, 'user'>;
        talentUser?: Omit<Talent['user'], '__id'>;
    };
}

export const validateTalentPatch = (
    req: TalentPatchRequest,
    res: Response,
    next: NextFunction,
): void => {
    const { talent, talentUser } = req.body;

    req.validatedData = {
        talent: {},
        talentUser: {},
    };

    if (talentUser?.firstName) {
        const validatedFirstName = validateString(talentUser.firstName);
        if (!(validatedFirstName)) {
            throw new Error(`Invalid firstname ${talentUser.firstName}`);
        }

        req.validatedData.talentUser = {
            ...req.validatedData?.talentUser,
            firstName: validatedFirstName,
        };
    }

    if (talentUser?.lastName) {
        const validatedLastName = validateString(talentUser.lastName);
        if (!(validatedLastName)) {
            throw new Error(`Invalid lastname ${talentUser.lastName}`);
        }

        req.validatedData.talentUser = {
            ...req.validatedData?.talentUser,
            lastName: validatedLastName,
        };
    }

    if (req.validatedData.talentUser && Object.keys(req.validatedData.talentUser).length === 0) {
        delete req.validatedData.talentUser;
    }

    if (talent.openToWork !== undefined) {
        const validatedOpenToWork = validateBoolean(talent.openToWork);
        if (validatedOpenToWork === null) {
            throw new Error(`Invalid open to work ${talentUser.openToWork}`);
        }

        req.validatedData.talent = {
            ...req.validatedData?.talent,
            openToWork: validatedOpenToWork,
        };
    }

    if (talent.title) {
        const validatedTitle = validateString(talent.title);
        if (!(validatedTitle)) {
            throw new Error(`Invalid title ${talentUser.title}`);
        }

        req.validatedData.talent = {
            ...req.validatedData?.talent,
            title: validatedTitle,
        };
    }

    if (talent.title === '') {
        req.validatedData.talent = {
            ...req.validatedData?.talent,
            title: '',
        };
    }

    if (talent.description) {
        const validatedDescription = validateString(talent.description);
        if (!(validatedDescription)) {
            throw new Error(`Invalid description ${talentUser.description}`);
        }

        req.validatedData.talent = {
            ...req.validatedData?.talent,
            description: validatedDescription,
        };
    }

    if (talent.description === '') {
        req.validatedData.talent = {
            ...req.validatedData?.talent,
            description: '',
        };
    }

    if (talent.externalLinks) {
        const validatedExternalLinks = talent.externalLinks.map((link: any) => {
            return validateString(link);
        });
        if (!(validatedExternalLinks)) {
            throw new Error(`Invalid external links ${talentUser.externalLinks}`);
        }

        req.validatedData.talent = {
            ...req.validatedData?.talent,
            externalLinks: validatedExternalLinks,
        };
    }

    next();
};

export interface WorkExperiencePostRequest extends Request {
    validatedData?: {
        talentId: number,
        workExperience: Omit<TalentWorkExperience, '__id'>
    };
}

export const validateWorkExperiencePost = (
    req: WorkExperiencePostRequest,
    res: Response,
    next: NextFunction,
): void => {
    const { workExperience, talentId } = req.body;

    const validatedTalentId = validateNumber(talentId);
    if (!(validatedTalentId)) {
        throw new Error(`Invalid talent ${talentId}`);
    }

    const validatedTitle = validateString(workExperience.title);
    if (!(validatedTitle)) {
        throw new Error(`Invalid work experience ${workExperience.title}`);
    }

    const validatedCompanyName = validateString(workExperience.companyName);
    if (!(validatedCompanyName)) {
        throw new Error(`Invalid company name ${workExperience.companyName}`);
    }

    const validatedContractType = validateEnum(workExperience.contractType, ContractTypes);
    if (!(validatedContractType)) {
        throw new Error(`Invalid contract type ${workExperience.contractType}`);
    }

    const validatedStartedAt = validateDate(workExperience.startedAt);
    if (!(validatedStartedAt)) {
        throw new Error(`Invalid started at ${workExperience.startedAt}`);
    }

    req.validatedData = {
        talentId: validatedTalentId,
        workExperience: {
            companyName: validatedCompanyName,
            contractType: validatedContractType,
            startedAt: validatedStartedAt,
            title: validatedTitle,
        },
    };

    if (workExperience.endedAt) {
        const validatedEndedAt = validateDate(workExperience.endedAt);
        if (!(validatedEndedAt)) {
            throw new Error(`Invalid ended at ${workExperience.endedAt}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            endedAt: validatedEndedAt,
        };
    }

    if (workExperience.description) {
        const validatedDescription = validateString(workExperience.description);
        if (!(validatedDescription)) {
            throw new Error(`Invalid description ${workExperience.description}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            description: validatedDescription,
        };
    }

    if (workExperience.skills && workExperience.skills.length > 0) {
        const validatedRequiredSkills: Skill[] = workExperience.skills.map((requiredSkill: any) => {
            const skill: Skill = {
                __id: requiredSkill.__id,
                level: SkillLevels.PROFESSIONAL,
                name: requiredSkill.name,
            };

            return skill;
        });
        if (validatedRequiredSkills.length === 0) {
            throw new Error(`Invalid required skills ${workExperience.skills}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            skills: validatedRequiredSkills,
        };
    }

    next();
};

export interface WorkExperiencePatchRequest extends Request {
    validatedData?: {
        workExperience: Partial<TalentWorkExperience>
    };
}

export const validateWorkExperiencePatch = (
    req: WorkExperiencePatchRequest,
    res: Response,
    next: NextFunction,
): void => {
    const { workExperience } = req.body;

    req.validatedData = {
        workExperience: {},
    };

    if (workExperience.title) {
        const validatedTitle = validateString(workExperience.title);
        if (!(validatedTitle)) {
            throw new Error(`Invalid work experience ${workExperience.title}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            title: validatedTitle,
        };
    }

    if (workExperience.companyName) {
        const validatedCompanyName = validateString(workExperience.companyName);
        if (!(validatedCompanyName)) {
            throw new Error(`Invalid company name ${workExperience.companyName}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            companyName: validatedCompanyName,
        };
    }

    if (workExperience.contractType) {
        const validatedContractType = validateEnum(workExperience.contractType, ContractTypes);
        if (!(validatedContractType)) {
            throw new Error(`Invalid contract type ${workExperience.contractType}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            contractType: validatedContractType,
        };
    }

    if (workExperience.startedAt) {
        const validatedStartedAt = validateDate(workExperience.startedAt);
        if (!(validatedStartedAt)) {
            throw new Error(`Invalid started at ${workExperience.startedAt}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            startedAt: validatedStartedAt,
        };
    }

    if (workExperience.endedAt) {
        const validatedEndedAt = validateDate(workExperience.endedAt);
        if (!(validatedEndedAt)) {
            throw new Error(`Invalid ended at ${workExperience.endedAt}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            endedAt: validatedEndedAt,
        };
    }

    if (workExperience.endedAt === null) {
        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            endedAt: null,
        };
    }

    if (workExperience.description) {
        const validatedDescription = validateString(workExperience.description);
        if (!(validatedDescription)) {
            throw new Error(`Invalid description ${workExperience.description}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            description: validatedDescription,
        };
    }

    if (workExperience.description === '') {
        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            description: '',
        };
    }

    if (workExperience.skills && workExperience.skills.length > 0) {
        const validatedRequiredSkills: Skill[] = workExperience.skills.map((requiredSkill: any) => {
            const skill: Skill = {
                __id: requiredSkill.__id,
                level: SkillLevels.PROFESSIONAL,
                name: requiredSkill.name,
            };

            return skill;
        });
        if (validatedRequiredSkills.length === 0) {
            throw new Error(`Invalid required skills ${workExperience.skills}`);
        }

        req.validatedData.workExperience = {
            ...req.validatedData.workExperience,
            skills: validatedRequiredSkills,
        };
    }

    next();
};

export interface EducationExperiencePostRequest extends Request {
    validatedData?: {
        educationExperience: Omit<TalentEducationExperience, '__id'>
        talentId: number,
    };
}

export const validateEducationExperiencePost = (
    req: EducationExperiencePostRequest,
    res: Response,
    next: NextFunction,
): void => {
    const { educationExperience, talentId } = req.body;

    const validatedTalentId = validateNumber(talentId);
    if (!(validatedTalentId)) {
        throw new Error(`Invalid talent ${talentId}`);
    }

    const validatedTitle = validateString(educationExperience.title);
    if (!(validatedTitle)) {
        throw new Error(`Invalid title ${educationExperience.title}`);
    }

    const validatedSchoolName = validateString(educationExperience.schoolName);
    if (!(validatedSchoolName)) {
        throw new Error(`Invalid school name ${educationExperience.schoolName}`);
    }

    const validatedDiplomaType = validateEnum(educationExperience.diplomaType, DiplomaTypes);
    if (!(validatedDiplomaType)) {
        throw new Error(`Invalid diploma type ${educationExperience.diplomaType}`);
    }

    const validatedStartedAt = validateDate(educationExperience.startedAt);
    if (!(validatedStartedAt)) {
        throw new Error(`Invalid started at ${educationExperience.startedAt}`);
    }

    req.validatedData = {
        educationExperience: {
            diplomaType: validatedDiplomaType,
            schoolName: validatedSchoolName,
            startedAt: validatedStartedAt,
            title: validatedTitle,
        },
        talentId: validatedTalentId,
    };

    if (educationExperience.endedAt) {
        const validatedEndedAt = validateDate(educationExperience.endedAt);
        if (!(validatedEndedAt)) {
            throw new Error(`Invalid ended at ${educationExperience.endedAt}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            endedAt: validatedEndedAt,
        };
    }

    if (educationExperience.description) {
        const validatedDescription = validateString(educationExperience.description);
        if (!(validatedDescription)) {
            throw new Error(`Invalid description ${educationExperience.description}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            description: validatedDescription,
        };
    }

    if (educationExperience.skills && educationExperience.skills.length > 0) {
        const validatedRequiredSkills: Skill[] = educationExperience.skills.map((requiredSkill: any) => {
            const skill: Skill = {
                __id: requiredSkill.__id,
                level: SkillLevels.EDUCATION,
                name: requiredSkill.name,
            };

            return skill;
        });
        if (validatedRequiredSkills.length === 0) {
            throw new Error(`Invalid required skills ${educationExperience.skills}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            skills: validatedRequiredSkills,
        };
    }

    next();
};

export interface EducationExperiencePatchRequest extends Request {
    validatedData?: {
        educationExperience: Partial<TalentEducationExperience>
    };
}

export const validateEducationExperiencePatch = (
    req: EducationExperiencePatchRequest,
    res: Response,
    next: NextFunction,
): void => {
    const { educationExperience } = req.body;

    req.validatedData = {
        educationExperience: {},
    };

    if (educationExperience.title) {
        const validatedTitle = validateString(educationExperience.title);
        if (!(validatedTitle)) {
            throw new Error(`Invalid title ${educationExperience.title}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            title: validatedTitle,
        };
    }

    if (educationExperience.schoolName) {
        const validatedSchoolName = validateString(educationExperience.schoolName);
        if (!(validatedSchoolName)) {
            throw new Error(`Invalid school name ${educationExperience.schoolName}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            schoolName: validatedSchoolName,
        };
    }

    if (educationExperience.diplomaType) {
        const validatedDiplomaType = validateEnum(educationExperience.diplomaType, DiplomaTypes);
        if (!(validatedDiplomaType)) {
            throw new Error(`Invalid contract type ${educationExperience.diplomaType}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            diplomaType: validatedDiplomaType,
        };
    }

    if (educationExperience.startedAt) {
        const validatedStartedAt = validateDate(educationExperience.startedAt);
        if (!(validatedStartedAt)) {
            throw new Error(`Invalid started at ${educationExperience.startedAt}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            startedAt: validatedStartedAt,
        };
    }

    if (educationExperience.endedAt) {
        const validatedEndedAt = validateDate(educationExperience.endedAt);
        if (!(validatedEndedAt)) {
            throw new Error(`Invalid ended at ${educationExperience.endedAt}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            endedAt: validatedEndedAt,
        };
    }

    if (educationExperience.endedAt === null) {
        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            endedAt: null,
        };
    }

    if (educationExperience.description) {
        const validatedDescription = validateString(educationExperience.description);
        if (!(validatedDescription)) {
            throw new Error(`Invalid description ${educationExperience.description}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            description: validatedDescription,
        };
    }

    if (educationExperience.description === '') {
        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            description: '',
        };
    }

    if (educationExperience.skills && educationExperience.skills.length > 0) {
        const validatedRequiredSkills: Skill[] = educationExperience.skills.map((requiredSkill: any) => {
            const skill: Skill = {
                __id: requiredSkill.__id,
                level: SkillLevels.EDUCATION,
                name: requiredSkill.name,
            };

            return skill;
        });
        if (validatedRequiredSkills.length === 0) {
            throw new Error(`Invalid required skills ${educationExperience.skills}`);
        }

        req.validatedData.educationExperience = {
            ...req.validatedData.educationExperience,
            skills: validatedRequiredSkills,
        };
    }

    next();
};

export interface PersonnalSkillPatchRequest extends Request {
    validatedData?: {
        skills: Skill[]
    };
}

export const validatePatchPersonnalSkills = (
    req: PersonnalSkillPatchRequest,
    res: Response,
    next: NextFunction,
): void => {
    const { skills } = req.body;

    const validatedSkills: Skill[] = skills.map((skill: any) => {
        const validatedSkill: Skill = {
            __id: skill.__id,
            level: SkillLevels.SELF_TAUGHT,
            name: skill.name,
        };

        return validatedSkill;
    });

    req.validatedData = {
        skills: validatedSkills,
    };

    next();
};

export interface RecommandationPostRequest extends Request {
    validatedData?: {
        recommandation: Omit<TalentRecommandation, '__id'>
    };
}

export const validateRecommandationPost = (
    req: RecommandationPostRequest,
    res: Response,
    next: NextFunction,
): void => {
    const { recommandation } = req.body;

    const validatedAuthorId = validateNumber(recommandation._authorId);
    if (!(validatedAuthorId)) {
        throw new Error(`Invalid author id ${recommandation._authorId}`);
    }

    const validatedRecipientId = validateNumber(recommandation._recipientId);
    if (!(validatedRecipientId)) {
        throw new Error(`Invalid recipient id ${recommandation._recipientId}`);
    }

    const validatedMessage = validateString(recommandation.message);
    if (!(validatedMessage)) {
        throw new Error(`Invalid message ${recommandation.message}`);
    }

    req.validatedData = {
        recommandation: {
            _authorId: validatedAuthorId,
            _recipientId: validatedRecipientId,
            message: validatedMessage,
        },
    };

    if (recommandation._experienceId) {
        const validatedExperienceId = validateNumber(recommandation._experienceId);
        if (!(validatedExperienceId)) {
            throw new Error(`Invalid experience id ${recommandation._experienceId}`);
        }

        req.validatedData = {
            recommandation: {
                ...req.validatedData.recommandation,
                _experienceId: validatedExperienceId,
            },
        };
    }

    if (recommandation.skills && recommandation.skills.length > 0) {
        const validatedRequiredSkills: Skill[] = recommandation.skills.map((requiredSkill: any) => {
            const skill: Skill = {
                __id: requiredSkill.__id,
                level: SkillLevels.SELF_TAUGHT,
                name: requiredSkill.name,
            };

            return skill;
        });
        if (validatedRequiredSkills.length === 0) {
            throw new Error(`Invalid required skills ${recommandation.skills}`);
        }

        req.validatedData.recommandation = {
            ...req.validatedData.recommandation,
            skills: validatedRequiredSkills,
        };
    }

    next();
};

export interface RecommandationPatchRequest extends Request {
    validatedData?: {
        recommandation: Partial<TalentRecommandation>
    };
}

export const validateRecommandationPatch = (
    req: RecommandationPatchRequest,
    res: Response,
    next: NextFunction,
): void => {
    const { recommandation } = req.body;

    req.validatedData = {
        recommandation: {},
    };

    if (recommandation.message) {
        const validatedMessage = validateString(recommandation.message);
        if (!(validatedMessage)) {
            throw new Error(`Invalid message ${recommandation.message}`);
        }

        req.validatedData = {
            recommandation: {
                ...req.validatedData?.recommandation,
                message: validatedMessage,
            },
        };
    }

    if (recommandation._experienceId) {
        const validatedExperienceId = validateNumber(recommandation._experienceId);
        if (!(validatedExperienceId)) {
            throw new Error(`Invalid experience id ${recommandation._experienceId}`);
        }

        req.validatedData = {
            recommandation: {
                ...req.validatedData.recommandation,
                _experienceId: validatedExperienceId,
            },
        };
    }

    if (recommandation._experienceId === null) {
        req.validatedData = {
            recommandation: {
                ...req.validatedData.recommandation,
                _experienceId: null,
            },
        };
    }

    if (recommandation.skills && recommandation.skills.length > 0) {
        const validatedRequiredSkills: Skill[] = recommandation.skills.map((requiredSkill: any) => {
            const skill: Skill = {
                __id: requiredSkill.__id,
                level: SkillLevels.SELF_TAUGHT,
                name: requiredSkill.name,
            };

            return skill;
        });
        if (validatedRequiredSkills.length === 0) {
            throw new Error(`Invalid required skills ${recommandation.skills}`);
        }

        req.validatedData.recommandation = {
            ...req.validatedData.recommandation,
            skills: validatedRequiredSkills,
        };
    }

    next();
};

export interface TalentSearchConfigRequest extends Request {
    validatedData?: {
        talentSearchConfig: Omit<TalentSearchConfig, '__id'>,
    };
}

export const validateTalentSearchConfig = (
    req: TalentSearchConfigRequest,
    res: Response,
    next: NextFunction,
): void => {
    const {
        talentId,
        companyBusiness,
        companyName,
        contractType,
        location,
        text,
    } = req.body;

    const validatedTalentId = validateNumber(talentId);
    if (!(validatedTalentId)) {
        throw new Error(`Invalid talent id ${talentId}`);
    }

    const validatedCompanyBusiness = (companyBusiness)
        ? validateString(companyBusiness)
        : undefined;
    if (validatedCompanyBusiness === null) {
        throw new Error(`Invalid company business ${companyBusiness}`);
    }

    const validatedCompanyName = (companyName)
        ? validateString(companyName)
        : undefined;
    if (validatedCompanyName === null) {
        throw new Error(`Invalid company name ${companyName}`);
    }

    const validatedContractType = (contractType)
        ? validateEnum(contractType, ContractTypes)
        : undefined;
    if (validatedContractType === null) {
        throw new Error(`Invalid contract type ${contractType}`);
    }

    const validatedLocation = (location)
        ? validateString(location)
        : undefined;
    if (validatedLocation === null) {
        throw new Error(`Invalid location ${location}`);
    }

    const validatedText = (text)
        ? validateString(text)
        : undefined;
    if (validatedText === null) {
        throw new Error(`Invalid text ${text}`);
    }

    req.validatedData = {
        talentSearchConfig: {
            _talentId: validatedTalentId,
            companyBusiness: validatedCompanyBusiness,
            companyName: validatedCompanyName,
            contractType: validatedContractType,
            location: validatedLocation,
            text: validatedText,
        },
    };

    next();
};

export interface TalentSearchConfigAlertRequest extends Request {
    validatedData?: {
        talentSearchConfig: Required<Pick<TalentSearchConfig,
            '__id' | 'alert'
        >>,
    };
}

export const validateTalentSearchConfigAlert = (
    req: TalentSearchConfigAlertRequest,
    res: Response,
    next: NextFunction,
): void => {
    const {
        searchId,
        alert,
    } = req.body;

    const validatedSearchId = validateNumber(searchId);
    if (!(validatedSearchId)) {
        throw new Error(`Invalid search id ${searchId}`);
    }

    const validatedAlert = validateBoolean(alert);
    if (validatedAlert === null) {
        throw new Error(`Invalid alert ${alert}`);
    }

    req.validatedData = {
        talentSearchConfig: {
            __id: validatedSearchId,
            alert: validatedAlert,
        },
    };

    next();
};
