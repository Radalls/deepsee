import { DiplomaTypes, Skill, SkillLevels, TalentEducationExperience, TalentWorkExperience } from '../../models/talent';

export const getDiplomaYear = (diplomaType: DiplomaTypes): number => {
    switch (diplomaType) {
        case DiplomaTypes.BACHELOR:
            return 3;
        case DiplomaTypes.MASTER:
            return 5;
        case DiplomaTypes.PHD:
            return 8;
        default:
            return 0;
    }
};

export const getSkillLevelValue = (skillLevel?: SkillLevels): number => {
    switch (skillLevel) {
        case SkillLevels.SELF_TAUGHT:
            return 1;
        case SkillLevels.EDUCATION:
            return 2;
        case SkillLevels.PROFESSIONAL:
            return 3;
        default:
            return 0;
    }
};

export const formatSkillsByLevel = (skills: Skill[]): { [level in SkillLevels]: Skill[] } => {
    return skills.reduce((acc, skill) => {
        if (!(acc[skill.level!])) {
            acc[skill.level!] = [];
        }
        acc[skill.level!].push(skill);
        return acc;
    }, {} as { [level in SkillLevels]: Skill[] });
};

export const getHighestSkills = (skills: Skill[]): Skill[] => {
    const skillsByName: { [skillName: string]: Skill } = {};

    const levelPrecedence: { [key in SkillLevels]: number } = {
        [SkillLevels.PROFESSIONAL]: 3,
        [SkillLevels.EDUCATION]: 2,
        [SkillLevels.SELF_TAUGHT]: 1,
    };

    skills.forEach(skill => {
        if (!(skill.level)) {
            return null!;
        }

        const existingSkill = skillsByName[skill.name];

        if (!(existingSkill) || levelPrecedence[skill.level] > levelPrecedence[existingSkill.level!]) {
            skillsByName[skill.name] = skill;
        }
    });

    return Object.values(skillsByName);
};

export const getHighestDiploma = (educationExperiences: TalentEducationExperience[]): DiplomaTypes => {
    const highestDiploma = educationExperiences.reduce((acc, experience) => {
        if (experience.diplomaType && getDiplomaYear(acc) < getDiplomaYear(experience.diplomaType)) {
            return experience.diplomaType;
        }
        return acc;
    }, DiplomaTypes.NONE);

    return highestDiploma;
};

export const getYearsOfExperience = (workExperiences: TalentWorkExperience[]): number => {
    return workExperiences.reduce((acc, experience) => {
        const end = experience.endedAt ? experience.endedAt : new Date();
        return acc + (end.getFullYear() - experience.startedAt.getFullYear());
    }, 0);
};
