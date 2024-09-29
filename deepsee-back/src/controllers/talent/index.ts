import { Request, Response } from 'express';

import {
    EducationExperiencePatchRequest,
    EducationExperiencePostRequest,
    PersonnalSkillPatchRequest,
    RecommandationPatchRequest,
    RecommandationPostRequest,
    TalentPatchRequest,
    TalentSearchConfigAlertRequest,
    TalentSearchConfigRequest,
    WorkExperiencePatchRequest,
    WorkExperiencePostRequest,
} from '../../middlewares/talent';
import {
    createEducationExperience,
    createWorkExperience,
    deleteEducationExperienceById,
    deleteWorkExperienceById,
    editEducationExperience,
    editTalent,
    editWorkExperience,
    getTalentById,
    createPersonnalSkills,
    createRecommandation,
    editRecommandation,
    deleteRecommandationById,
    getTalentSearchConfigsByTalentId,
    createTalentSearchConfig,
    deleteTalentSearchConfigById,
    editTalentSearchConfigAlert,
} from '../../services/talent';

export const getTalent = async (req: Request, res: Response): Promise<void> => {
    const talentId = Number.parseInt(req.params.talentId);
    if (!(talentId)) {
        res.status(500).json({ error: `Invalid talent id ${talentId}` });
        return;
    }

    const talent = await getTalentById({ talentId });
    if (!(talent)) {
        res.status(404).json({ error: `Talent ${talentId} not found` });
        return;
    }

    res.status(200).json(talent);
};

export const patchTalent = async (req: TalentPatchRequest, res: Response): Promise<void> => {
    const talentId = Number.parseInt(req.params.talentId);
    if (!(talentId)) {
        res.status(500).json({ error: `Invalid talent id ${talentId}` });
        return;
    }

    const talent = req.validatedData?.talent;
    const talentUser = req.validatedData?.talentUser;
    if (!(talent)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    await editTalent({ talent, talentId, talentUser });

    res.status(200).json();
};

export const postWorkExperience = async (req: WorkExperiencePostRequest, res: Response): Promise<void> => {
    const workExperience = req.validatedData?.workExperience;
    const talentId = req.validatedData?.talentId;
    if (!(workExperience) || !(talentId)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const workExperienceSaved = await createWorkExperience({ talentId, workExperience });

    res.status(200).json(workExperienceSaved);
};

export const patchWorkExperience = async (req: WorkExperiencePatchRequest, res: Response): Promise<void> => {
    const workExperienceId = Number.parseInt(req.params.workExperienceId);
    if (!(workExperienceId)) {
        res.status(500).json({ error: `Invalid work experience id ${workExperienceId}` });
        return;
    }

    const workExperience = req.validatedData?.workExperience;
    if (!(workExperience)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const workExperienceEdited = await editWorkExperience({ workExperience, workExperienceId });

    res.status(200).json(workExperienceEdited);
};

export const deleteWorkExperience = async (req: Request, res: Response): Promise<void> => {
    const workExperienceId = Number.parseInt(req.params.workExperienceId);
    if (!(workExperienceId)) {
        res.status(500).json({ error: `Invalid work experience id ${workExperienceId}` });
        return;
    }

    await deleteWorkExperienceById({ workExperienceId });

    res.status(200).json();
};

export const postEducationExperience = async (req: EducationExperiencePostRequest, res: Response): Promise<void> => {
    const educationExperience = req.validatedData?.educationExperience;
    const talentId = req.validatedData?.talentId;
    if (!(educationExperience) || !(talentId)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const educationExperienceSaved = await createEducationExperience({ educationExperience, talentId });

    res.status(200).json(educationExperienceSaved);
};

export const patchEducationExperience = async (req: EducationExperiencePatchRequest, res: Response): Promise<void> => {
    const educationExperienceId = Number.parseInt(req.params.educationExperienceId);
    if (!(educationExperienceId)) {
        res.status(500).json({ error: `Invalid education experience id ${educationExperienceId}` });
        return;
    }

    const educationExperience = req.validatedData?.educationExperience;
    if (!(educationExperience)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const educationExperienceEdited = await editEducationExperience({ educationExperience, educationExperienceId });

    res.status(200).json(educationExperienceEdited);
};

export const deleteEducationExperience = async (req: Request, res: Response): Promise<void> => {
    const educationExperienceId = Number.parseInt(req.params.educationExperienceId);
    if (!(educationExperienceId)) {
        res.status(500).json({ error: `Invalid education experience id ${educationExperienceId}` });
        return;
    }

    await deleteEducationExperienceById({ educationExperienceId });

    res.status(200).json();
};

export const patchPersonnalSkills = async (req: PersonnalSkillPatchRequest, res: Response): Promise<void> => {
    const talentId = Number.parseInt(req.params.talentId);
    if (!(talentId)) {
        res.status(500).json({ error: `Invalid talent id ${talentId}` });
        return;
    }

    const skills = req.validatedData?.skills;
    if (!(skills)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    await createPersonnalSkills({ skills, talentId });

    res.status(200).json();
};

export const postRecommandation = async (req: RecommandationPostRequest, res: Response): Promise<void> => {
    const recommandation = req.validatedData?.recommandation;
    if (!(recommandation)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const recommandationSaved = await createRecommandation({ recommandation });

    res.status(200).json(recommandationSaved);
};

export const patchRecommandation = async (req: RecommandationPatchRequest, res: Response): Promise<void> => {
    const recommandationId = Number.parseInt(req.params.recommandationId);
    if (!(recommandationId)) {
        res.status(500).json({ error: `Invalid recommandation id ${recommandationId}` });
        return;
    }

    const recommandation = req.validatedData?.recommandation;
    if (!(recommandation)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const recommandationSaved = await editRecommandation({ recommandation, recommandationId });

    res.status(200).json(recommandationSaved);
};

export const deleteRecommandation = async (req: Request, res: Response): Promise<void> => {
    const recommandationId = Number.parseInt(req.params.recommandationId);
    if (!(recommandationId)) {
        res.status(500).json({ error: `Invalid recommandation id ${recommandationId}` });
        return;
    }

    await deleteRecommandationById({ recommandationId });

    res.status(200).json();
};

export const getTalentSearchConfigs = async (req: Request, res: Response): Promise<void> => {
    const talentId = Number.parseInt(req.params.talentId);
    if (!(talentId)) {
        res.status(500).json({ error: `Invalid talent id ${talentId}` });
        return;
    }

    const talentSearchConfigs = await getTalentSearchConfigsByTalentId({ talentId });

    res.status(200).json(talentSearchConfigs);
};

export const postTalentSearchConfig = async (req: TalentSearchConfigRequest, res: Response): Promise<void> => {
    const talentSearchConfig = req.validatedData?.talentSearchConfig;
    if (!(talentSearchConfig)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const registeredTalentSearchConfig = await createTalentSearchConfig({ talentSearchConfig });

    res.status(201).json(registeredTalentSearchConfig);
};

export const patchTalentSearchConfigAlert = async (
    req: TalentSearchConfigAlertRequest,
    res: Response,
): Promise<void> => {
    const talentSearchConfig = req.validatedData?.talentSearchConfig;
    if (!(talentSearchConfig)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const updatedTalentSearchConfig = await editTalentSearchConfigAlert({ talentSearchConfig });

    res.status(200).json(updatedTalentSearchConfig);
};

export const deleteTalentSearchConfig = async (req: Request, res: Response): Promise<void> => {
    const searchId = Number.parseInt(req.params.searchId);
    if (!(searchId)) {
        res.status(500).json({ error: `Invalid search id ${searchId}` });
        return;
    }

    await deleteTalentSearchConfigById({ searchId });

    res.status(200).json();
};
