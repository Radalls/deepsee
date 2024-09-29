import { DiplomaTypes, SkillLevels } from '../models/talent-model';

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

export const getSkillLevelValue = (skillLevel: SkillLevels): number => {
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
