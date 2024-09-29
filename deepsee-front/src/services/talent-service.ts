import { Skill, Talent, TalentEducationExperience, TalentRecommandation, TalentSearchConfig, TalentWorkExperience } from '../models/talent-model';
import api from '../utils/api-utils';

const API_URL = 'talents';

export const getTalent = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<Talent> => {
    return (await api.get(`${API_URL}/${talentId}`)).data as Talent;
};

export const updateTalent = async ({ talentId, talent, talentUser }: {
    talent: Partial<Talent>,
    talentId: number,
    talentUser?: Partial<Talent['user']>
}) => {
    return (await api.patch(`${API_URL}/${talentId}`, {
        talent,
        talentUser,
    }));
};

// Work Experience
export const createWorkExperience = async ({ talentId, workExperience }: {
    talentId: number,
    workExperience: TalentWorkExperience,
}) => {
    return (await api.post(`${API_URL}/work-experience`, {
        talentId,
        workExperience,
    }));
};

export const updateWorkExperience = async ({ workExperience }: {
    workExperience: TalentWorkExperience,
}) => {
    return (await api.patch(`${API_URL}/work-experience/${workExperience.__id}`, {
        workExperience,
    }));
};

export const deleteWorkExperience = async ({ workExperienceId }: {
    workExperienceId: number,
}) => {
    return (await api.delete(`${API_URL}/work-experience/${workExperienceId}`));
};

// Education Experience
export const createEducationExperience = async ({ talentId, educationExperience }: {
    educationExperience: TalentEducationExperience,
    talentId: number,
}) => {
    return (await api.post(`${API_URL}/education-experience`, {
        educationExperience,
        talentId,
    }));
};

export const updateEducationExperience = async ({ educationExperience }: {
    educationExperience: TalentEducationExperience,
}) => {
    return (await api.patch(`${API_URL}/education-experience/${educationExperience.__id}`, {
        educationExperience,
    }));
};

export const deleteEducationExperience = async ({ educationExperienceId }: {
    educationExperienceId: number,
}) => {
    return (await api.delete(`${API_URL}/education-experience/${educationExperienceId}`));
};

// Skills
export const updatePersonnalSkills = async ({ skills, talentId }: {
    skills: Skill[],
    talentId: number,
}) => {
    return (await api.patch(`${API_URL}/personnal-skills/${talentId}`, {
        skills,
    }));
};

// Recommandation
export const createRecommandation = async ({ recommandation }: {
    recommandation: Omit<TalentRecommandation, '__id'>
}) => {
    return (await api.post(`${API_URL}/recommandation`, {
        recommandation,
    }));
};

export const updateRecommandation = async ({ recommandation }: {
    recommandation: Partial<TalentRecommandation>
}) => {
    return (await api.patch(`${API_URL}/recommandation/${recommandation.__id}`, {
        recommandation,
    }));
};

export const deleteRecommandation = async ({ recommandationId }: {
    recommandationId: number
}) => {
    return (await api.delete(`${API_URL}/recommandation/${recommandationId}`));
};

export const getTalentSearchConfigs = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<TalentSearchConfig[]> => {
    return (await api.get(`${API_URL}/search/${talentId}`)).data as TalentSearchConfig[];
};

export const createTalentSearchConfig = async ({ talentId, searchConfig }: {
    searchConfig: {
        companyBusiness: string,
        companyName: string,
        contractType: string,
        location: string,
        text: string,
    },
    talentId: Talent['user']['__id'],
}): Promise<TalentSearchConfig> => {
    return (await api.post(`${API_URL}/search`, {
        talentId,
        ...searchConfig,
    })).data as TalentSearchConfig;
};

export const updateTalentSearchConfigAlert = async ({ searchId, alert }: {
    alert: boolean,
    searchId: TalentSearchConfig['__id'],
}): Promise<TalentSearchConfig> => {
    return (await api.patch(`${API_URL}/search/alert`, {
        alert,
        searchId,
    })).data as TalentSearchConfig;
};

export const deleteTalentSearchConfig = async ({ searchId }: {
    searchId: TalentSearchConfig['__id']
}) => {
    return (await api.delete(`${API_URL}/search/${searchId}`));
};

