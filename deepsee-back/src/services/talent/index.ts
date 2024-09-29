import {
    Skill,
    SkillLevels,
    Talent,
    TalentEducationExperience,
    TalentRecommandation,
    TalentSearchConfig,
    TalentWorkExperience,
} from '../../models/talent';
import { User } from '../../models/user';
import {
    deleteTalentSkill,
    dropEducationExperienceById,
    dropRecommandationById,
    dropTalentSearchConfigById,
    dropWorkExperienceById,
    fetchAllTalents,
    fetchTalentById,
    fetchTalentEducationExperienceById,
    fetchTalentEducationExperiences,
    fetchTalentEducationExperienceSkills,
    fetchTalentRecommandationById,
    fetchTalentRecommandations,
    fetchTalentRecommandationsSkills,
    fetchTalentSearchConfigsByTalentId,
    fetchTalentSkills,
    fetchTalentWorkExperienceById,
    fetchTalentWorkExperiences,
    fetchTalentWorkExperienceSkills,
    saveEducationExperience,
    saveRecommandation,
    saveTalent,
    saveTalentSearchConfig,
    saveTalentSkill,
    saveWorkExperience,
    updateEducationExperience,
    updateRecommandation,
    updateTalent,
    updateTalentSearchConfigAlert,
    updateWorkExperience,
} from '../../repositories/talent';
import { fetchUserById, updateUser } from '../../repositories/user';
import { getHighestSkills, getHighestDiploma, getYearsOfExperience, getSkillLevelValue } from '../../utils/talent';
import { createUser } from '../user';

export const getTalentById = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<Talent | undefined> => {
    const talentUser = await fetchUserById({ userId: talentId });
    if (!(talentUser)) {
        return;
    }

    const talent = await fetchTalentById({ talentId });
    if (!(talent)) {
        return;
    }

    const talentSkills = await fetchTalentSkills({ talentId });
    const talentHighestSkills = getHighestSkills(talentSkills)
        .sort((a, b) => getSkillLevelValue(b.level) - getSkillLevelValue(a.level));

    const talentEducationExperiences = await fetchTalentEducationExperiences({ talentId });
    const talentHighestDiploma = getHighestDiploma(talentEducationExperiences);

    const talentWorkExperiences = await fetchTalentWorkExperiences({ talentId });

    const yearsOfExperience = getYearsOfExperience(talentWorkExperiences);

    const talentRecommandations = (await Promise.all(await fetchTalentRecommandations({ talentId }))).map(
        (recommandation) => {
            const talentExperienceLinked = talentWorkExperiences
                .find((workExperience) => workExperience.__id === recommandation._experienceId);

            if (!(talentExperienceLinked)) {
                return recommandation;
            }

            return {
                ...recommandation,
                experienceCompanyName: talentExperienceLinked.companyName,
                experienceTitle: talentExperienceLinked.title,
            };
        }
    );

    return {
        ...talent,
        educationExperiences: talentEducationExperiences,
        highestDiploma: talentHighestDiploma,
        recommandations: talentRecommandations,
        skills: talentHighestSkills,
        user: talentUser,
        workExperiences: talentWorkExperiences,
        yearsOfExperience: yearsOfExperience,
    };
};

export const getAllTalents = async (): Promise<Talent[]> => {
    return await Promise.all((await fetchAllTalents()).map(async (t) => {
        const talent = await getTalentById({ talentId: t.user.__id });
        if (!(talent)) {
            return null!;
        }

        return talent;
    }));
};

export const createTalent = async ({ userCredentials }: {
    userCredentials: Required<Pick<User, 'email' | 'firstName' | 'lastName' | 'password' | 'role'>>,
}): Promise<Talent> => {
    const user = await createUser({ userCredentials });

    const statedTalent: Talent = {
        createdAt: new Date(),
        externalLinks: [],
        openToWork: true,
        user,
    };

    return await saveTalent({ talent: statedTalent });
};

export const editTalent = async ({ talent, talentId, talentUser }: {
    talent: Omit<Talent, 'user'>,
    talentId: number,
    talentUser?: Omit<Talent['user'], '__id'>
}): Promise<Talent> => {

    if (talentUser) {
        const statedUser = {
            ...talentUser,
            __id: talentId,
        };

        await updateUser({ user: statedUser });
    }

    const statedTalent = {
        ...talent,
        user: {
            __id: talentId,
        },
    };

    const updatedTalent = await updateTalent({ talent: statedTalent });
    if (!(updatedTalent)) {
        throw new Error('Update talent failed');
    }

    return updatedTalent;
};

export const createWorkExperience = async ({ talentId, workExperience }: {
    talentId: number,
    workExperience: Omit<TalentWorkExperience, '__id'>
}): Promise<TalentWorkExperience> => {
    const savedWorkExperience = await saveWorkExperience({ talentId, workExperience });

    const oldWorkExperienceSkill = await fetchTalentWorkExperienceSkills({
        experienceId: savedWorkExperience.__id,
        talentId,
    });

    workExperience.skills?.forEach(async (newSkill) => {
        const existingSkill = oldWorkExperienceSkill.find((oldSkill) => oldSkill.__id === newSkill.__id);
        if (!(existingSkill)) {
            await saveTalentSkill({
                skill: newSkill,
                talentId,
                workExperienceId: savedWorkExperience.__id,
            });
        }
    });
    const oldSkillsToRemove = oldWorkExperienceSkill.filter(
        (oldSkill) => !(workExperience.skills?.find((newSkill) => newSkill.__id === oldSkill.__id)),
    );
    if (oldSkillsToRemove.length) {
        oldSkillsToRemove.forEach(async (skill) => {
            await deleteTalentSkill({ skill, talentId });
        });
    }

    return savedWorkExperience;
};

export const editWorkExperience = async ({ workExperience, workExperienceId }: {
    workExperience: Partial<TalentWorkExperience>
    workExperienceId: number,
}): Promise<TalentWorkExperience> => {
    const statedWorkExperience = {
        ...workExperience,
        __id: workExperienceId,
    };

    const editedWorkExperience = await updateWorkExperience({ workExperience: statedWorkExperience });
    if (!(editedWorkExperience._talentId)) {
        throw new Error(`talent id is missing on ${editedWorkExperience}`);
    }

    const oldWorkExperienceSkill = await fetchTalentWorkExperienceSkills({
        experienceId: editedWorkExperience.__id,
        talentId: editedWorkExperience._talentId,
    });

    workExperience.skills?.forEach(async (newSkill) => {
        const existingSkill = oldWorkExperienceSkill.find((oldSkill) => oldSkill.__id === newSkill.__id);
        if (!(existingSkill)) {
            await saveTalentSkill({
                skill: newSkill,
                talentId: editedWorkExperience._talentId!, // j'ai fait la verif au dessus mais le linter est bete
                workExperienceId: workExperienceId,
            });
        }
    });
    const oldSkillsToRemove = oldWorkExperienceSkill.filter(
        (oldSkill) => !(workExperience.skills?.find((newSkill) => newSkill.__id === oldSkill.__id)),
    );
    if (oldSkillsToRemove.length) {
        oldSkillsToRemove.forEach(async (skill) => {
            await deleteTalentSkill({ skill, talentId: editedWorkExperience._talentId! });
        });
    }

    return editedWorkExperience;
};

export const deleteWorkExperienceById = async ({ workExperienceId }: { workExperienceId: number }) => {
    const workExperience = await fetchTalentWorkExperienceById({
        workExperienceId: workExperienceId,
    });

    if (!(workExperience) || !(workExperience?._talentId)) {
        throw new Error(`Could not find work experience with id ${workExperienceId}`);
    }

    workExperience.skills?.forEach(async (skill) => {
        await deleteTalentSkill({ skill, talentId: workExperience._talentId! });
    });

    await dropWorkExperienceById({ workExperienceId });
};

export const createEducationExperience = async ({ talentId, educationExperience }: {
    educationExperience: Omit<TalentEducationExperience, '__id'>,
    talentId: number,
}): Promise<TalentEducationExperience> => {
    const savedEducationExperience = await saveEducationExperience({ educationExperience, talentId });

    const oldEducationExperienceSkill = await fetchTalentEducationExperienceSkills({
        experienceId: savedEducationExperience.__id,
        talentId,
    });

    educationExperience.skills?.forEach(async (newSkill) => {
        const existingSkill = oldEducationExperienceSkill.find((oldSkill) => oldSkill.__id === newSkill.__id);
        if (!(existingSkill)) {
            await saveTalentSkill({
                educationExperienceId: savedEducationExperience.__id,
                skill: newSkill,
                talentId,
            });
        }
    });

    return savedEducationExperience;
};

export const editEducationExperience = async ({ educationExperience, educationExperienceId }: {
    educationExperience: Partial<TalentEducationExperience>
    educationExperienceId: number,
}): Promise<TalentEducationExperience> => {
    const statedEducationExperience = {
        ...educationExperience,
        __id: educationExperienceId,
    };

    const editedEducationExperience =
        await updateEducationExperience({ educationExperience: statedEducationExperience });
    if (!(editedEducationExperience._talentId)) {
        throw new Error(`talent id is missing on ${editedEducationExperience}`);
    }

    const oldWorkExperienceSkill = await fetchTalentEducationExperienceSkills({
        experienceId: editedEducationExperience.__id,
        talentId: editedEducationExperience._talentId,
    });

    educationExperience.skills?.forEach(async (newSkill) => {
        const existingSkill = oldWorkExperienceSkill.find((oldSkill) => oldSkill.__id === newSkill.__id);
        if (!(existingSkill)) {
            await saveTalentSkill({
                educationExperienceId: educationExperienceId,
                skill: newSkill,
                talentId: editedEducationExperience._talentId!, // j'ai fait la verif au dessus mais le linter est bete
            });
        }
    });
    const oldSkillsToRemove = oldWorkExperienceSkill.filter(
        (oldSkill) => !(educationExperience.skills?.find((newSkill) => newSkill.__id === oldSkill.__id)),
    );
    if (oldSkillsToRemove.length) {
        oldSkillsToRemove.forEach(async (skill) => {
            await deleteTalentSkill({ skill, talentId: editedEducationExperience._talentId! });
        });
    }

    return editedEducationExperience;
};

export const deleteEducationExperienceById = async ({ educationExperienceId }: {
    educationExperienceId: number
}) => {
    const educationExperience = await fetchTalentEducationExperienceById({
        educationExperienceId: educationExperienceId,
    });

    if (!(educationExperience) || !(educationExperience?._talentId)) {
        throw new Error(`Could not find education experience with id ${educationExperienceId}`);
    }

    educationExperience.skills?.forEach(async (skill) => {
        await deleteTalentSkill({ skill, talentId: educationExperience._talentId! });
    });

    await dropEducationExperienceById({ educationExperienceId });
};

export const createPersonnalSkills = async ({ talentId, skills }: {
    skills: Skill[],
    talentId: number,
}) => {
    const oldPersonnalSkills =
        (await fetchTalentSkills({ talentId })).filter((skill) => skill.level === SkillLevels.SELF_TAUGHT);

    for (const skill of skills) {
        const existingSkill = oldPersonnalSkills.find((oldSkill) => oldSkill.__id === skill.__id);
        if (existingSkill) {
            continue;
        }
        await saveTalentSkill({ skill, talentId });
    }

    const skillsToRemove =
        oldPersonnalSkills.filter((oldSkill) => !(skills.find((skill) => skill.__id === oldSkill.__id)));
    for (const skill of skillsToRemove) {
        await deleteTalentSkill({ skill, talentId });
    }
};

export const createRecommandation = async ({ recommandation }: {
    recommandation: Omit<TalentRecommandation, '__id'>
}): Promise<TalentRecommandation> => {
    const statedRecommandation = {
        ...recommandation,
        createdAt: new Date(),
    };

    const recommandationSaved = await saveRecommandation({ recommandation: statedRecommandation });

    const oldRecommandationSkill = await fetchTalentRecommandationsSkills({
        recommandationId: recommandationSaved.__id,
        talentId: recommandationSaved._recipientId,
    });

    recommandation.skills?.forEach(async (newSkill) => {
        const existingSkill = oldRecommandationSkill.find((oldSkill) => oldSkill.__id === newSkill.__id);
        if (!(existingSkill)) {
            await saveTalentSkill({
                recommandationId: recommandationSaved.__id,
                skill: newSkill,
                talentId: recommandationSaved._recipientId,
            });
        }
    });

    return recommandationSaved;
};

export const editRecommandation = async ({ recommandation, recommandationId }: {
    recommandation: Partial<TalentRecommandation>
    recommandationId: number,
}): Promise<TalentRecommandation> => {
    const statedRecommandation = {
        ...recommandation,
        __id: recommandationId,
    };

    const editedRecommandation =
        await updateRecommandation({ recommandation: statedRecommandation });

    const oldWorkExperienceSkill = await fetchTalentRecommandationsSkills({
        recommandationId: editedRecommandation.__id,
        talentId: editedRecommandation._recipientId,
    });

    recommandation.skills?.forEach(async (newSkill) => {
        const existingSkill = oldWorkExperienceSkill.find((oldSkill) => oldSkill.__id === newSkill.__id);
        if (!(existingSkill)) {
            await saveTalentSkill({
                recommandationId: recommandationId,
                skill: newSkill,
                talentId: editedRecommandation._recipientId,
            });
        }
    });
    const oldSkillsToRemove = oldWorkExperienceSkill.filter(
        (oldSkill) => !(recommandation.skills?.find((newSkill) => newSkill.__id === oldSkill.__id)),
    );
    if (oldSkillsToRemove.length) {
        oldSkillsToRemove.forEach(async (skill) => {
            await deleteTalentSkill({ skill, talentId: editedRecommandation._recipientId });
        });
    }

    return editedRecommandation;
};

export const deleteRecommandationById = async ({ recommandationId }: {
    recommandationId: number
}) => {
    const recommandation = await fetchTalentRecommandationById({ recommandationId });

    if (!(recommandation)) {
        throw new Error(`Could not find recommandation with id ${recommandationId}`);
    }

    recommandation.skills?.forEach(async (skill) => {
        await deleteTalentSkill({ skill, talentId: recommandation._recipientId });
    });

    await dropRecommandationById({ recommandationId });
};

export const getTalentSearchConfigsByTalentId = async ({ talentId }: {
    talentId: Talent['user']['__id']
}): Promise<TalentSearchConfig[]> => {
    return await fetchTalentSearchConfigsByTalentId({ talentId });
};

export const createTalentSearchConfig = async ({ talentSearchConfig }: {
    talentSearchConfig: Omit<TalentSearchConfig, '__id'>
}): Promise<TalentSearchConfig> => {
    return await saveTalentSearchConfig({ talentSearchConfig });
};

export const editTalentSearchConfigAlert = async ({ talentSearchConfig }: {
    talentSearchConfig: Required<Pick<TalentSearchConfig,
        '__id' | 'alert'
    >>
}): Promise<TalentSearchConfig> => {
    return await updateTalentSearchConfigAlert({ talentSearchConfig });
};

export const deleteTalentSearchConfigById = async ({ searchId }: {
    searchId: TalentSearchConfig['__id']
}): Promise<void> => {
    await dropTalentSearchConfigById({ searchId });
};
