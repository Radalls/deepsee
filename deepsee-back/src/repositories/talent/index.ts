import { client } from '../../middlewares/database';
import { JobOffer } from '../../models/job';
import {
    Skill,
    Talent,
    TalentEducationExperience,
    TalentRecommandation,
    TalentSearchConfig,
    TalentWorkExperience,
} from '../../models/talent';
import { fetchUserById } from '../user';

export const fetchTalentById = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<Talent | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM talent WHERE user_id = $1;',
        [talentId],
    )).rows[0];

    return (queryResult)
        ? parseTalent({ queryResult })
        : undefined;
};

export const fetchAllTalents = async (): Promise<Talent[]> => {
    return await Promise.all((await client.query(
        `SELECT * FROM talent
        WHERE open_to_work = TRUE;`,
    )).rows.map((queryResult) => parseTalent({ queryResult })));
};

export const fetchTalentSkills = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<Skill[]> => {
    return await Promise.all((await client.query(
        `SELECT skill.*, t.level FROM skill
        JOIN talent_skill t ON skill.id = t.skill_id
        WHERE t.talent_id = $1;`,
        [talentId],
    )).rows.map((queryResult) => parseTalentSkill({ queryResult })));
};

export const fetchTalentEducationExperiences = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<TalentEducationExperience[]> => {
    const queryResults = (await client.query(
        'SELECT * FROM talent_education_experience WHERE talent_id = $1 order by started_at desc;',
        [talentId],
    )).rows;

    return await Promise.all(queryResults.map(async (queryResult: any) => {
        const educationExperience = parseTalentEducationExperience({ queryResult });
        const educationExperienceSkills = await fetchTalentEducationExperienceSkills({
            experienceId: educationExperience.__id,
            talentId,
        });

        return { ...educationExperience, skills: educationExperienceSkills };
    }));
};

export const fetchTalentEducationExperienceById = async ({ educationExperienceId }: {
    educationExperienceId: number,
}): Promise<TalentEducationExperience> => {
    const queryResult = (await client.query(
        'SELECT * FROM talent_education_experience WHERE id = $1;',
        [educationExperienceId],
    )).rows[0];

    const educationExperience = parseTalentEducationExperience({ queryResult });
    if (!(educationExperience) || !(educationExperience?._talentId)) {
        throw new Error(`Could not find education experience with id ${educationExperienceId}`);
    }

    const educationExperienceSkills = await fetchTalentEducationExperienceSkills({
        experienceId: educationExperience.__id,
        talentId: educationExperience._talentId,
    });

    return { ...educationExperience, skills: educationExperienceSkills };
};

export const fetchTalentEducationExperienceSkills = async ({ talentId, experienceId }: {
    experienceId: TalentEducationExperience['__id'],
    talentId: Talent['user']['__id'],
}): Promise<Skill[]> => {
    return await Promise.all((await client.query(
        `SELECT skill.*, t.level FROM skill
        JOIN talent_skill t ON skill.id = t.skill_id
        WHERE t.talent_education_experience_id = $1 AND t.talent_id = $2;`,
        [experienceId, talentId],
    )).rows.map((queryResult) => parseTalentSkill({ queryResult })));
};

export const fetchTalentWorkExperiences = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<TalentWorkExperience[]> => {
    const queryResults = (await client.query(
        'SELECT * FROM talent_work_experience WHERE talent_id = $1 order by started_at desc;',
        [talentId],
    )).rows;

    return await Promise.all(queryResults.map(async (queryResult: any) => {
        const workExperience = parseTalentWorkExperience({ queryResult });
        const workExperienceSkills = await fetchTalentWorkExperienceSkills({
            experienceId: workExperience.__id,
            talentId,
        });

        return { ...workExperience, skills: workExperienceSkills };
    }));
};

export const fetchTalentWorkExperienceById = async ({ workExperienceId }: {
    workExperienceId: number,
}): Promise<TalentWorkExperience> => {
    const queryResult = (await client.query(
        'SELECT * FROM talent_work_experience WHERE id = $1;',
        [workExperienceId],
    )).rows[0];

    const workExperience = parseTalentWorkExperience({ queryResult });
    if (!(workExperience) || !(workExperience?._talentId)) {
        throw new Error(`Could not find work experience with id ${workExperienceId}`);
    }

    const workExperienceSkills = await fetchTalentWorkExperienceSkills({
        experienceId: workExperience.__id,
        talentId: workExperience._talentId,
    });

    return { ...workExperience, skills: workExperienceSkills };
};

export const fetchTalentWorkExperienceSkills = async ({ talentId, experienceId }: {
    experienceId: TalentWorkExperience['__id'],
    talentId: Talent['user']['__id'],
}): Promise<Skill[]> => {
    return await Promise.all((await client.query(
        `SELECT skill.*, t.level FROM skill
        JOIN talent_skill t ON skill.id = t.skill_id
        WHERE t.talent_work_experience_id = $1 AND t.talent_id = $2;`,
        [experienceId, talentId],
    )).rows.map((queryResult) => parseTalentSkill({ queryResult })));
};

export const fetchTalentRecommandations = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<TalentRecommandation[]> => {
    const queryResults = (await client.query(
        'SELECT * FROM talent_recommandation WHERE recipient_id = $1;',
        [talentId],
    )).rows;

    return await Promise.all(queryResults.map(async (queryResult: any) => {
        const talentRecommandation = parseTalentRecommandation({ queryResult });
        const authorRecommandation = await fetchUserById({ userId: talentRecommandation._authorId });
        const talentRecommandationSkills = await fetchTalentRecommandationsSkills({
            recommandationId: talentRecommandation.__id,
            talentId,
        });

        return {
            ...talentRecommandation,
            authorAvatar: authorRecommandation?.avatar,
            authorFirstName: authorRecommandation?.firstName,
            authorLastName: authorRecommandation?.lastName,
            skills: talentRecommandationSkills,
        };
    }));
};

export const fetchTalentRecommandationById = async ({ recommandationId }: {
    recommandationId: number,
}): Promise<TalentRecommandation> => {
    const queryResult = (await client.query(
        'SELECT * FROM talent_recommandation WHERE id = $1;',
        [recommandationId],
    )).rows[0];

    const talentRecommandation = parseTalentRecommandation({ queryResult });
    const authorRecommandation = await fetchUserById({ userId: talentRecommandation._authorId });
    const talentRecommandationSkills = await fetchTalentRecommandationsSkills({
        recommandationId: talentRecommandation.__id,
        talentId: talentRecommandation._recipientId,
    });

    return {
        ...talentRecommandation,
        authorAvatar: authorRecommandation?.avatar,
        authorFirstName: authorRecommandation?.firstName,
        authorLastName: authorRecommandation?.lastName,
        skills: talentRecommandationSkills,
    };
};

export const fetchTalentRecommandationsSkills = async ({ talentId, recommandationId }: {
    recommandationId: TalentRecommandation['__id'],
    talentId: Talent['user']['__id'],
}): Promise<Skill[]> => {
    return await Promise.all((await client.query(
        `SELECT skill.*, t.level FROM skill
        JOIN talent_skill t ON skill.id = t.skill_id
        WHERE t.talent_id = $1 AND t.talent_recommandation_id = $2;`,
        [talentId, recommandationId],
    )).rows.map((queryResult) => parseTalentSkill({ queryResult })));
};

export const saveTalent = async ({ talent }: {
    talent: Talent,
}): Promise<Talent> => {
    const registeredTalent = (await client.query(
        `INSERT INTO "talent" (
            user_id,
            open_to_work,
            title,
            external_links,
            description
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [
            talent.user.__id,
            talent.openToWork,
            talent.title,
            talent.externalLinks?.join(','),
            talent.description,
        ],
    )).rows[0];

    if (!(registeredTalent)) {
        throw new Error(`Could not save talent: ${talent}`);
    }

    return parseTalent({ queryResult: registeredTalent });
};

export const updateTalent = async ({ talent }: {
    talent: Talent,
}): Promise<Talent> => {
    let registeredTalent;

    if (talent.openToWork !== undefined) {
        registeredTalent = (await client.query(
            'UPDATE "talent" SET open_to_work = $1 WHERE user_id = $2 RETURNING *;',
            [talent.openToWork, talent.user.__id],
        )).rows[0];
    }

    if (talent.title || talent.title === '') {
        registeredTalent = (await client.query(
            'UPDATE "talent" SET title = $1 WHERE user_id = $2 RETURNING *;',
            [talent.title, talent.user.__id],
        )).rows[0];
    }

    if (talent.externalLinks) {
        registeredTalent = (await client.query(
            'UPDATE "talent" SET external_links = $1 WHERE user_id = $2 RETURNING *;',
            [talent.externalLinks.join(','), talent.user.__id],
        )).rows[0];
    }

    if (talent.description || talent.description === '') {
        registeredTalent = (await client.query(
            'UPDATE "talent" SET description = $1 WHERE user_id = $2 RETURNING *;',
            [talent.description, talent.user.__id],
        )).rows[0];
    }

    if (!(registeredTalent)) {
        throw new Error(`Could not update talent: ${talent}`);
    }

    return parseTalent({ queryResult: registeredTalent });
};

export const saveWorkExperience = async ({ talentId, workExperience }: {
    talentId: number,
    workExperience: Omit<TalentWorkExperience, '__id'>,
}) => {
    const registeredWorkExperience = (await client.query(
        `INSERT INTO "talent_work_experience" (
            talent_id,
            title,
            contract_type,
            company_name,
            started_at,
            ended_at,
            description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
        [
            talentId,
            workExperience.title,
            workExperience.contractType,
            workExperience.companyName,
            workExperience.startedAt,
            workExperience.endedAt,
            workExperience.description,
        ],
    )).rows[0];

    if (!(registeredWorkExperience)) {
        throw new Error(`Could not save work experience: ${workExperience}`);
    }

    return parseTalentWorkExperience({ queryResult: registeredWorkExperience });
};

export const updateWorkExperience = async ({ workExperience }: { workExperience: Partial<TalentWorkExperience> }) => {
    let registeredWorkExperience;

    if (workExperience.title) {
        registeredWorkExperience = (await client.query(
            'UPDATE "talent_work_experience" SET title = $1 WHERE id = $2 RETURNING *;',
            [workExperience.title, workExperience.__id],
        )).rows[0];
    }

    if (workExperience.contractType) {
        registeredWorkExperience = (await client.query(
            'UPDATE "talent_work_experience" SET contract_type = $1 WHERE id = $2 RETURNING *;',
            [workExperience.contractType, workExperience.__id],
        )).rows[0];
    }

    if (workExperience.companyName) {
        registeredWorkExperience = (await client.query(
            'UPDATE "talent_work_experience" SET company_name = $1 WHERE id = $2 RETURNING *;',
            [workExperience.companyName, workExperience.__id],
        )).rows[0];
    }

    if (workExperience.startedAt) {
        registeredWorkExperience = (await client.query(
            'UPDATE "talent_work_experience" SET started_at = $1 WHERE id = $2 RETURNING *;',
            [workExperience.startedAt, workExperience.__id],
        )).rows[0];
    }

    if (workExperience.endedAt || workExperience.endedAt === null) {
        registeredWorkExperience = (await client.query(
            'UPDATE "talent_work_experience" SET ended_at = $1 WHERE id = $2 RETURNING *;',
            [workExperience.endedAt, workExperience.__id],
        )).rows[0];
    }

    if (workExperience.description || workExperience.description === '') {
        registeredWorkExperience = (await client.query(
            'UPDATE "talent_work_experience" SET description = $1 WHERE id = $2 RETURNING *;',
            [workExperience.description, workExperience.__id],
        )).rows[0];
    }

    if (!(registeredWorkExperience)) {
        throw new Error(`Could not edit work experience: ${workExperience}`);
    }

    return parseTalentWorkExperience({ queryResult: registeredWorkExperience });
};

export const dropWorkExperienceById = async ({ workExperienceId }: { workExperienceId: number }) => {
    await client.query(
        'DELETE FROM "talent_work_experience" WHERE id = $1', [workExperienceId],
    );
};

export const saveEducationExperience = async ({ talentId, educationExperience }: {
    educationExperience: Omit<TalentEducationExperience, '__id'>,
    talentId: number,
}) => {
    const registeredEducationExperience = (await client.query(
        `INSERT INTO "talent_education_experience" (
            talent_id,
            title,
            diploma_type,
            school_name,
            started_at,
            ended_at,
            description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
        [
            talentId,
            educationExperience.title,
            educationExperience.diplomaType,
            educationExperience.schoolName,
            educationExperience.startedAt,
            educationExperience.endedAt,
            educationExperience.description,
        ],
    )).rows[0];

    if (!(registeredEducationExperience)) {
        throw new Error(`Could not save work experience: ${educationExperience}`);
    }

    return parseTalentEducationExperience({ queryResult: registeredEducationExperience });
};

export const updateEducationExperience = async ({ educationExperience }: {
    educationExperience: Partial<TalentEducationExperience>
}) => {
    let registeredEducationExperience;

    if (educationExperience.title) {
        registeredEducationExperience = (await client.query(
            'UPDATE "talent_education_experience" SET title = $1 WHERE id = $2 RETURNING *;',
            [educationExperience.title, educationExperience.__id],
        )).rows[0];
    }

    if (educationExperience.diplomaType) {
        registeredEducationExperience = (await client.query(
            'UPDATE "talent_education_experience" SET diploma_type = $1 WHERE id = $2 RETURNING *;',
            [educationExperience.diplomaType, educationExperience.__id],
        )).rows[0];
    }

    if (educationExperience.schoolName) {
        registeredEducationExperience = (await client.query(
            'UPDATE "talent_education_experience" SET school_name = $1 WHERE id = $2 RETURNING *;',
            [educationExperience.schoolName, educationExperience.__id],
        )).rows[0];
    }

    if (educationExperience.startedAt) {
        registeredEducationExperience = (await client.query(
            'UPDATE "talent_education_experience" SET started_at = $1 WHERE id = $2 RETURNING *;',
            [educationExperience.startedAt, educationExperience.__id],
        )).rows[0];
    }

    if (educationExperience.endedAt || educationExperience.endedAt === null) {
        registeredEducationExperience = (await client.query(
            'UPDATE "talent_education_experience" SET ended_at = $1 WHERE id = $2 RETURNING *;',
            [educationExperience.endedAt, educationExperience.__id],
        )).rows[0];
    }

    if (educationExperience.description || educationExperience.description === '') {
        registeredEducationExperience = (await client.query(
            'UPDATE "talent_education_experience" SET description = $1 WHERE id = $2 RETURNING *;',
            [educationExperience.description, educationExperience.__id],
        )).rows[0];
    }

    if (!(registeredEducationExperience)) {
        throw new Error(`Could not edit education experience: ${educationExperience}`);
    }

    return parseTalentEducationExperience({ queryResult: registeredEducationExperience });
};

export const dropEducationExperienceById = async ({ educationExperienceId }: { educationExperienceId: number }) => {
    await client.query(
        'DELETE FROM "talent_education_experience" WHERE id = $1', [educationExperienceId],
    );
};

export const saveTalentSkill = async ({ talentId, skill, workExperienceId, educationExperienceId, recommandationId }: {
    educationExperienceId?: number,
    recommandationId?: number
    skill: Skill,
    talentId: number,
    workExperienceId?: number,
}) => {
    const registeredTalentSkill = (await client.query(
        `INSERT INTO "talent_skill" (
            talent_id,
            skill_id,
            level,
            talent_work_experience_id,
            talent_education_experience_id,
            talent_recommandation_id
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
        [
            talentId,
            skill.__id,
            skill.level,
            workExperienceId,
            educationExperienceId,
            recommandationId,
        ],
    )).rows[0];

    if (!(registeredTalentSkill)) {
        throw new Error(`Could not save talent skill: ${registeredTalentSkill}`);
    }

    return parseTalentSkill({ queryResult: registeredTalentSkill });
};

export const deleteTalentSkill = async ({ talentId, skill }: {
    skill: Skill,
    talentId: number,
}) => {
    await client.query(
        `DELETE FROM "talent_skill" 
        WHERE talent_id = $1
        AND skill_id = $2
        AND level = $3
        RETURNING *;`,
        [
            talentId,
            skill.__id,
            skill.level,
        ],
    );
};

export const saveRecommandation = async ({ recommandation }: {
    recommandation: Omit<TalentRecommandation, '__id'>,
}) => {
    const registeredRecommandation = (await client.query(
        `INSERT INTO "talent_recommandation" (
            author_id,
            recipient_id,
            experience_id,
            message,
            created_at
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [
            recommandation._authorId,
            recommandation._recipientId,
            recommandation._experienceId,
            recommandation.message,
            recommandation.createdAt,
        ],
    )).rows[0];

    if (!(registeredRecommandation)) {
        throw new Error(`Could not save recommandation: ${registeredRecommandation}`);
    }

    return parseTalentRecommandation({ queryResult: registeredRecommandation });
};

export const updateRecommandation = async ({ recommandation }: {
    recommandation: Partial<TalentRecommandation>
}) => {
    let registeredRecommandation;

    if (recommandation.message) {
        registeredRecommandation = (await client.query(
            'UPDATE "talent_recommandation" SET message = $1 WHERE id = $2 RETURNING *;',
            [recommandation.message, recommandation.__id],
        )).rows[0];
    }

    if (recommandation._experienceId !== undefined) {
        registeredRecommandation = (await client.query(
            'UPDATE "talent_recommandation" SET experience_id = $1 WHERE id = $2 RETURNING *;',
            [recommandation._experienceId, recommandation.__id],
        )).rows[0];
    }

    return parseTalentRecommandation({ queryResult: registeredRecommandation });
};

export const dropRecommandationById = async ({ recommandationId }: { recommandationId: number }) => {
    await client.query(
        'DELETE FROM "talent_recommandation" WHERE id = $1', [recommandationId],
    );
};

export const fetchTalentSearchConfigsByTalentId = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<TalentSearchConfig[]> => {
    return (await client.query(
        'SELECT * FROM "talent_search_config" WHERE talent_id = $1',
        [talentId],
    )).rows.map((queryResult) => parseTalentSearchConfig({ queryResult }));
};

export const fetchTalentSearchConfigsByJobOfferParams = async ({ jobOffer }: {
    jobOffer: JobOffer
}): Promise<TalentSearchConfig[]> => {
    return (await client.query(
        `SELECT * FROM "talent_search_config"
        WHERE alert = TRUE
        AND contract_type IS NULL OR contract_type = $1
        AND location IS NULL OR location ILIKE $2
        AND company_name IS NULL OR company_name ILIKE $3
        AND company_business IS NULL OR company_business ILIKE $4
        AND text IS NULL OR text ILIKE $5`,
        [
            jobOffer.contractType,
            jobOffer.location,
            jobOffer.companyName,
            jobOffer.companyBusiness,
            jobOffer.title,
        ],
    )).rows.map((queryResult) => parseTalentSearchConfig({ queryResult }));
};

export const saveTalentSearchConfig = async ({ talentSearchConfig }: {
    talentSearchConfig: Omit<TalentSearchConfig, '__id'>
}): Promise<TalentSearchConfig> => {
    const registeredTalentSearchConfig = (await client.query(
        `INSERT INTO "talent_search_config" (
            talent_id,
            alert,
            company_business,
            company_name,
            contract_type,
            location,
            text
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
        [
            talentSearchConfig._talentId,
            talentSearchConfig.alert,
            talentSearchConfig.companyBusiness,
            talentSearchConfig.companyName,
            talentSearchConfig.contractType,
            talentSearchConfig.location,
            talentSearchConfig.text,
        ],
    )).rows[0];

    if (!(registeredTalentSearchConfig)) {
        throw new Error(`Could not save talent search config: ${registeredTalentSearchConfig}`);
    }

    return parseTalentSearchConfig({ queryResult: registeredTalentSearchConfig });
};

export const updateTalentSearchConfigAlert = async ({ talentSearchConfig }: {
    talentSearchConfig: Required<Pick<TalentSearchConfig,
        '__id' | 'alert'
    >>
}): Promise<TalentSearchConfig> => {
    const registeredTalentSearchConfig = (await client.query(
        'UPDATE "talent_search_config" SET alert = $1 WHERE id = $2 RETURNING *;',
        [talentSearchConfig.alert, talentSearchConfig.__id],
    )).rows[0];

    if (!(registeredTalentSearchConfig)) {
        throw new Error(`Could not update talent search config: ${registeredTalentSearchConfig}`);
    }

    return parseTalentSearchConfig({ queryResult: registeredTalentSearchConfig });
};

export const dropTalentSearchConfigById = async ({ searchId }: {
    searchId: TalentSearchConfig['__id']
}): Promise<void> => {
    await client.query(
        'DELETE FROM "talent_search_config" WHERE id = $1', [searchId],
    );
};

const parseTalent = ({ queryResult }: { queryResult: any }): Talent => ({
    createdAt: queryResult.created_at,
    description: queryResult.description,
    externalLinks: queryResult.external_links?.split(','),
    openToWork: queryResult.open_to_work,
    title: queryResult.title,
    updatedAt: queryResult.updated_at,
    user: { __id: queryResult.user_id },
});

const parseTalentSkill = ({ queryResult }: { queryResult: any }): Skill => ({
    __id: queryResult.id,
    level: queryResult.level,
    logo: queryResult.logo,
    name: queryResult.name,
});

const parseTalentEducationExperience = ({ queryResult }: { queryResult: any }): TalentEducationExperience => ({
    __id: queryResult.id,
    _talentId: queryResult.talent_id,
    createdAt: queryResult.created_at,
    description: queryResult.description,
    diplomaType: queryResult.diploma_type,
    endedAt: queryResult.ended_at,
    schoolName: queryResult.school_name,
    startedAt: queryResult.started_at,
    title: queryResult.title,
    updatedAt: queryResult.updated_at,
});

const parseTalentWorkExperience = ({ queryResult }: { queryResult: any }): TalentWorkExperience => ({
    __id: queryResult.id,
    _talentId: queryResult.talent_id,
    companyName: queryResult.company_name,
    contractType: queryResult.contract_type,
    createdAt: queryResult.created_at,
    description: queryResult.description,
    endedAt: queryResult.ended_at,
    startedAt: queryResult.started_at,
    title: queryResult.title,
    updatedAt: queryResult.updated_at,
});

const parseTalentRecommandation = ({ queryResult }: { queryResult: any }): TalentRecommandation => ({
    __id: queryResult.id,
    _authorId: queryResult.author_id,
    _experienceId: queryResult.experience_id,
    _recipientId: queryResult.recipient_id,
    createdAt: queryResult.created_at,
    experienceCompanyName: queryResult.experience_company_name,
    experienceTitle: queryResult.experience_title,
    message: queryResult.message,
});

const parseTalentSearchConfig = ({ queryResult }: { queryResult: any }): TalentSearchConfig => ({
    __id: queryResult.id,
    _talentId: queryResult.talent_id,
    alert: queryResult.alert,
    companyBusiness: queryResult.company_business,
    companyName: queryResult.company_name,
    contractType: queryResult.contract_type,
    location: queryResult.location,
    text: queryResult.text,
});
