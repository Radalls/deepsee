import { Script, createContext } from 'vm';

import { JobOffer, JobOfferTestUnit } from '../../models/job';
import { Skill, Talent } from '../../models/talent';
import { getDiplomaYear, getSkillLevelValue } from '../talent';

export const match = ({ jobOffer, talent }: {
    jobOffer: JobOffer,
    talent: Talent,
}): number => {
    let matchScore = 0;

    if (talent.yearsOfExperience !== undefined && jobOffer.requiredYearsOfExperience !== undefined) {
        if (talent.yearsOfExperience >= jobOffer.requiredYearsOfExperience) {
            matchScore += 40;
        }
    }

    if (talent.highestDiploma !== undefined && jobOffer.requiredDiploma !== undefined) {
        if (getDiplomaYear(talent.highestDiploma) >= getDiplomaYear(jobOffer.requiredDiploma)) {
            matchScore += 30;
        }
    }

    if (talent.skills?.length && jobOffer.requiredSkills?.length) {
        for (const skill of jobOffer.requiredSkills) {
            if (!(skill.level)) {
                break;
            }

            const talentSkill = talent.skills.find((talentSkill: Skill) => talentSkill.__id === skill.__id);
            if (!(talentSkill && talentSkill.level)) {
                break;
            }
            else if (getSkillLevelValue(talentSkill.level) >= getSkillLevelValue(skill.level)) {
                matchScore += 30 / jobOffer.requiredSkills.length;
            }
        }
    }

    return matchScore;
};

export const runTestCode = async (
    testCode: string,
    unitName: string,
    units: JobOfferTestUnit[],
) => {
    if (!(units)) {
        return false;
    }

    const logs: string[] = [];
    const context = {
        clearInterval,
        clearTimeout,
        console: {
            log: (...args: any[]) => {
                logs.push(args.join(' '));
            },
        },
        setInterval,
        setTimeout,
    };

    const sandbox = createContext(context);
    const script = new Script(testCode);

    script.runInContext(sandbox, { timeout: 10000 });

    if (typeof sandbox[unitName] !== 'function') {
        throw new Error(`Unit ${unitName} not found`);
    }

    let allUnitsPassed = true;

    for (const unit of units) {
        const result = sandbox[unitName](...unit.params);
        if (!(compare(result, unit.expected))) {
            allUnitsPassed = false;
        }
    }

    return allUnitsPassed;
};

export const compare = (x: any, y: any): boolean => {
    if (x === y) {
        return true;
    } else if (typeof x == 'object' && x != null && typeof y == 'object' && y != null) {
        if (Object.keys(x).length != Object.keys(y).length) {
            return false;
        }

        for (const prop in x) {
            // eslint-disable-next-line no-prototype-builtins
            if (y.hasOwnProperty(prop)) {
                if (!(compare(x[prop], y[prop]))) {
                    return false;
                }
            } else {
                return false;
            }
        }

        return true;
    } else {
        return false;
    }
};
