import { NextFunction, Request, Response } from 'express';

import { JobOffer, JobOfferStatus, JobOfferTest, JobOfferTestRun, JobOfferTestUnit } from '../../models/job';
import { ContractTypes, DiplomaTypes, Skill, SkillLevels } from '../../models/talent';
import { validateDate, validateEnum, validateNumber, validateString } from '../../utils/validation';

export interface JobOfferRequest extends Request {
    validatedData?: {
        jobOffer: Omit<JobOffer, '__id' | 'createdAt' | 'state' | 'status'>;
        jobOfferTest?: Omit<JobOfferTest, '__id' | 'createdAt' | 'updatedAt'>;
    };
}

export interface JobOfferEditRequest extends Request {
    validatedData?: {
        jobOffer: Omit<JobOffer, '_companyId'>;
        jobOfferTest?: JobOfferTest;
    };
}

export interface JobOfferStatusEditRequest extends Request {
    validatedData?: {
        jobOffer: Pick<JobOffer, '__id' | 'status'>;
    };
}

export interface JobOfferTestRunEditRequest extends Request {
    validatedData?: {
        jobOfferTestRun: Omit<JobOfferTestRun, 'startableUntil' | 'validatedAt'>;
    };
}

export interface JobOfferTestRunCodeRequest extends Request {
    validatedData?: {
        testCode: string;
    };
}

export const validateJobOffer = (
    req: JobOfferRequest,
    res: Response,
    next: NextFunction,
): void => {
    const {
        companyId,
        contractType,
        location,
        mainDescription,
        requiredDiploma,
        requiredSkills,
        requiredYearsOfExperience,
        requirementDescription,
        test,
        title,
        workDescription,
    } = req.body;

    const validatedCompanyId = validateNumber(companyId);
    if (!(validatedCompanyId)) {
        throw new Error(`Invalid company id ${companyId}`);
    }

    const validatedContractType = validateEnum(contractType, ContractTypes);
    if (!(validatedContractType)) {
        throw new Error(`Invalid contract type ${contractType}`);
    }

    const validatedWorkDescription = validateString(workDescription);
    if (!(validatedWorkDescription)) {
        throw new Error(`Invalid work description ${workDescription}`);
    }

    const validatedTitle = validateString(title);
    if (!(validatedTitle)) {
        throw new Error(`Invalid title ${title}`);
    }

    const validatedLocation = validateString(location);
    if (!(validatedLocation)) {
        throw new Error(`Invalid location ${location}`);
    }

    const validatedMainDescription = validateString(mainDescription);
    if (!(validatedMainDescription)) {
        throw new Error(`Invalid main description ${mainDescription}`);
    }

    const validatedRequiredDiploma = validateEnum(requiredDiploma, DiplomaTypes);
    if (!(validatedRequiredDiploma)) {
        throw new Error(`Invalid required diploma ${requiredDiploma}`);
    }

    const validatedRequiredSkills: Skill[] = requiredSkills.map((requiredSkill: any) => {
        const skillLevel = validateEnum(requiredSkill.level, SkillLevels);

        if (skillLevel) {
            const skill: Skill = {
                __id: requiredSkill.__id,
                level: skillLevel,
                name: requiredSkill.name,
            };

            return skill;
        }

        return null;
    });
    if (validatedRequiredSkills.length === 0) {
        throw new Error(`Invalid required skills ${requiredSkills}`);
    }

    const validatedRequiredYearsOfExperience = validateNumber(requiredYearsOfExperience);
    if (validatedRequiredYearsOfExperience === null) {
        throw new Error(`Invalid required years of experience ${requiredYearsOfExperience}`);
    }

    const validatedRequirementDescription = validateString(requirementDescription);
    if (!(validatedRequirementDescription)) {
        throw new Error(`Invalid requirement description ${requirementDescription}`);
    }

    const validatedTestInstructions = (test && test.instructions)
        ? validateString(test.instructions)
        : undefined;
    if (validatedTestInstructions === null) {
        throw new Error(`Invalid test instructions ${test?.instructions}`);
    }

    const validatedTestDuration = (test && test.duration)
        ? validateNumber(test.duration * 60) // provided in minutes, convert to seconds
        : undefined;
    if (validatedTestDuration === null) {
        throw new Error(`Invalid test duration ${test?.duration}`);
    }

    const validatedTestUnitName = (test && test.unitName)
        ? validateString(test.unitName)
        : undefined;
    if (validatedTestUnitName === null) {
        throw new Error(`Invalid test unit name ${test?.unitName}`);
    }

    const validatedTestUnits: JobOfferTestUnit[] | undefined = (test && test.units)
        ? test.units.map((unit: { expected: string, params: string }) => {
            const validatedParams: JobOfferTestUnit['params'] = JSON.parse(
                '[' + unit.params.split(';').join(',') + ']',
            );
            const validatedExpected: JobOfferTestUnit['expected'] = JSON.parse(unit.expected);

            if (validatedParams && validatedExpected !== undefined && validatedExpected !== null) {
                return {
                    expected: validatedExpected,
                    params: validatedParams,
                };
            }

            return null;
        })
        : undefined;

    const jobOffer: Omit<JobOffer, '__id' | 'createdAt' | 'state' | 'status'> = {
        _companyId: validatedCompanyId,
        contractType: validatedContractType,
        location: validatedLocation,
        mainDescription: validatedMainDescription,
        requiredDiploma: validatedRequiredDiploma,
        requiredSkills: validatedRequiredSkills,
        requiredYearsOfExperience: validatedRequiredYearsOfExperience,
        requirementDescription: validatedRequirementDescription,
        title: validatedTitle,
        workDescription: validatedWorkDescription,
    };

    const jobOfferTest: Omit<JobOfferTest, '__id' | 'createdAt' | 'updatedAt'> | undefined
        = (validatedTestInstructions && validatedTestDuration && validatedTestUnitName && validatedTestUnits)
            ? {
                duration: validatedTestDuration,
                instructions: validatedTestInstructions,
                unitName: validatedTestUnitName,
                units: validatedTestUnits,
            }
            : undefined;

    req.validatedData = {
        jobOffer,
        jobOfferTest,
    };

    next();
};

export const validateJobOfferEdit = (
    req: JobOfferEditRequest,
    res: Response,
    next: NextFunction,
): void => {
    const {
        __id,
        contractType,
        location,
        mainDescription,
        requiredDiploma,
        requiredSkills,
        requiredYearsOfExperience,
        requirementDescription,
        test,
        title,
        workDescription,
    } = req.body;

    const validatedContractType = validateEnum(contractType, ContractTypes);
    if (!(validatedContractType)) {
        throw new Error(`Invalid contract type ${contractType}`);
    }

    const validatedWorkDescription = validateString(workDescription);
    if (!(validatedWorkDescription)) {
        throw new Error(`Invalid work description ${workDescription}`);
    }

    const validatedTitle = validateString(title);
    if (!(validatedTitle)) {
        throw new Error(`Invalid title ${title}`);
    }

    const validatedLocation = validateString(location);
    if (!(validatedLocation)) {
        throw new Error(`Invalid location ${location}`);
    }

    const validatedMainDescription = validateString(mainDescription);
    if (!(validatedMainDescription)) {
        throw new Error(`Invalid main description ${mainDescription}`);
    }

    const validatedRequiredDiploma = validateEnum(requiredDiploma, DiplomaTypes);
    if (!(validatedRequiredDiploma)) {
        throw new Error(`Invalid required diploma ${requiredDiploma}`);
    }

    const validatedRequiredSkills: Skill[] = requiredSkills.map((requiredSkill: any) => {
        const skillLevel = validateEnum(requiredSkill.level, SkillLevels);

        if (skillLevel) {
            const skill: Skill = {
                __id: requiredSkill.__id,
                level: skillLevel,
                name: requiredSkill.name,
            };

            return skill;
        }

        return null;
    });
    if (validatedRequiredSkills.length === 0) {
        throw new Error(`Invalid required skills ${requiredSkills}`);
    }

    const validatedRequiredYearsOfExperience = validateNumber(requiredYearsOfExperience);
    if (validatedRequiredYearsOfExperience === null) {
        throw new Error(`Invalid required years of experience ${requiredYearsOfExperience}`);
    }

    const validatedRequirementDescription = validateString(requirementDescription);
    if (!(validatedRequirementDescription)) {
        throw new Error(`Invalid requirement description ${requirementDescription}`);
    }

    const validatedTestInstructions = (test && test.instructions)
        ? validateString(test.instructions)
        : undefined;
    if (validatedTestInstructions === null) {
        throw new Error(`Invalid test instructions ${test?.instructions}`);
    }

    const validatedTestDuration = (test && test.duration)
        ? validateNumber(test.duration * 60) // provided in minutes, convert to seconds
        : undefined;
    if (validatedTestDuration === null) {
        throw new Error(`Invalid test duration ${test?.duration}`);
    }

    const validatedTestUnitName = (test && test.unitName)
        ? validateString(test.unitName)
        : undefined;
    if (validatedTestUnitName === null) {
        throw new Error(`Invalid test unit name ${test?.unitName}`);
    }

    const validatedTestUnits: JobOfferTestUnit[] | undefined = (test && test.units)
        ? test.units.map((unit: { expected: string, params: string }) => {
            const validatedParams: JobOfferTestUnit['params'] = JSON.parse(
                '[' + unit.params.split(';').join(',') + ']',
            );
            const validatedExpected: JobOfferTestUnit['expected'] = JSON.parse(unit.expected);

            if (validatedParams && validatedExpected !== undefined && validatedExpected !== null) {
                return {
                    expected: validatedExpected,
                    params: validatedParams,
                };
            }

            return null;
        })
        : undefined;

    const jobOffer: Omit<JobOffer, '_companyId'> = {
        __id,
        contractType: validatedContractType,
        location: validatedLocation,
        mainDescription: validatedMainDescription,
        requiredDiploma: validatedRequiredDiploma,
        requiredSkills: validatedRequiredSkills,
        requiredYearsOfExperience: validatedRequiredYearsOfExperience,
        requirementDescription: validatedRequirementDescription,
        title: validatedTitle,
        workDescription: validatedWorkDescription,
    };

    const jobOfferTest: JobOfferTest | undefined
        = (validatedTestInstructions && validatedTestDuration && validatedTestUnitName && validatedTestUnits)
            ? {
                __id: test?.__id,
                duration: validatedTestDuration,
                instructions: validatedTestInstructions,
                unitName: validatedTestUnitName,
                units: validatedTestUnits,
            }
            : undefined;

    req.validatedData = {
        jobOffer,
        jobOfferTest,
    };

    next();
};

export const validateJobOfferStatusEdit = (
    req: JobOfferStatusEditRequest,
    res: Response,
    next: NextFunction,
): void => {
    const {
        jobOfferId,
        status,
    } = req.body;

    const validatedJobOfferId = validateNumber(jobOfferId);
    if (!(validatedJobOfferId)) {
        throw new Error(`Invalid candidacy id ${jobOfferId}`);
    }

    const validatedStatus = validateEnum(status, JobOfferStatus);
    if (!(validatedStatus)) {
        throw new Error(`Invalid status ${status}`);
    }

    req.validatedData = {
        jobOffer: {
            __id: validatedJobOfferId,
            status: validatedStatus,
        },
    };

    next();
};

export const validateJobOfferTestRunEdit = (
    req: JobOfferTestRunEditRequest,
    res: Response,
    next: NextFunction,
): void => {
    const {
        _jobOfferTestId,
        _talentId,
        startedAt,
        endedAt,
    } = req.body;

    const validatedJobOfferTestId = validateNumber(_jobOfferTestId);
    if (!(validatedJobOfferTestId)) {
        throw new Error(`Invalid job offer test id ${_jobOfferTestId}`);
    }

    const validatedTalentId = validateNumber(_talentId);
    if (!(validatedTalentId)) {
        throw new Error(`Invalid talent id ${_talentId}`);
    }

    const validatedStartedAt = (startedAt)
        ? validateDate(startedAt)
        : undefined;
    if (validatedStartedAt === null) {
        throw new Error(`Invalid started at ${startedAt}`);
    }

    const validatedEndedAt = (endedAt)
        ? validateDate(endedAt)
        : undefined;
    if (validatedEndedAt === null) {
        throw new Error(`Invalid ended at ${endedAt}`);
    }

    req.validatedData = {
        jobOfferTestRun: {
            _jobOfferTestId: validatedJobOfferTestId,
            _talentId: validatedTalentId,
            endedAt: validatedEndedAt,
            startedAt: validatedStartedAt,
        },
    };

    next();
};

export const validateJobOfferTestRunCode = (
    req: JobOfferTestRunCodeRequest,
    res: Response,
    next: NextFunction,
): void => {
    const { testCode } = req.body;

    const validatedTestCode = validateString(testCode);
    if (!(validatedTestCode)) {
        throw new Error(`Invalid job offer test ${testCode}`);
    }

    req.validatedData = {
        testCode: validatedTestCode,
    };

    next();
};
