import express from 'express';

import {
    deleteEducationExperience,
    deleteRecommandation,
    deleteTalentSearchConfig,
    deleteWorkExperience,
    getTalent,
    getTalentSearchConfigs,
    patchEducationExperience,
    patchPersonnalSkills,
    patchRecommandation,
    patchTalent,
    patchTalentSearchConfigAlert,
    patchWorkExperience,
    postEducationExperience,
    postRecommandation,
    postTalentSearchConfig,
    postWorkExperience,
} from '../../controllers/talent';
import { async } from '../../middlewares/async';
import {
    validateEducationExperiencePatch,
    validateEducationExperiencePost,
    validatePatchPersonnalSkills,
    validateRecommandationPatch,
    validateRecommandationPost,
    validateTalentPatch,
    validateTalentSearchConfig,
    validateTalentSearchConfigAlert,
    validateWorkExperiencePatch,
    validateWorkExperiencePost,
} from '../../middlewares/talent';

const talentRouter = express.Router();

talentRouter.get('/search/:talentId', async(getTalentSearchConfigs));
talentRouter.get('/:talentId', async(getTalent));
talentRouter.post('/work-experience', validateWorkExperiencePost, async(postWorkExperience));
talentRouter.post('/education-experience', validateEducationExperiencePost, async(postEducationExperience));
talentRouter.post('/recommandation', validateRecommandationPost, async(postRecommandation));
talentRouter.post('/search', validateTalentSearchConfig, async(postTalentSearchConfig));
talentRouter.patch('/work-experience/:workExperienceId', validateWorkExperiencePatch, async(patchWorkExperience));
talentRouter.patch(
    '/education-experience/:educationExperienceId',
    validateEducationExperiencePatch,
    async(patchEducationExperience)
);
talentRouter.patch('/recommandation/:recommandationId', validateRecommandationPatch, async(patchRecommandation));
talentRouter.patch('/personnal-skills/:talentId', validatePatchPersonnalSkills, async(patchPersonnalSkills));
talentRouter.patch('/search/alert', validateTalentSearchConfigAlert, async(patchTalentSearchConfigAlert));
talentRouter.patch('/:talentId', validateTalentPatch, async(patchTalent));
talentRouter.delete('/work-experience/:workExperienceId', async(deleteWorkExperience));
talentRouter.delete('/education-experience/:educationExperienceId', async(deleteEducationExperience));
talentRouter.delete('/recommandation/:recommandationId', async(deleteRecommandation));
talentRouter.delete('/search/:searchId', async(deleteTalentSearchConfig));

export default talentRouter;
