import express from 'express';

import {
    deleteCandidacy,
    getCandidaciesByJobOffer,
    getCandidaciesByTalent,
    getCandidacy,
    getTalentCandidacyForJobOffer,
    patchCandidacyStatus,
    postCandidacy,
    postMeeting,
} from '../../controllers/candidacy';
import { async } from '../../middlewares/async';
import { validateCandidacy, validateCandidacyStatus, validateMeeting } from '../../middlewares/candidacy';

const candidacyRouter = express.Router();

candidacyRouter.get('/talent/:talentId', async(getCandidaciesByTalent));
candidacyRouter.get('/job/:jobOfferId', async(getCandidaciesByJobOffer));
candidacyRouter.get('/candidacy/:candidacyId', async(getCandidacy));
candidacyRouter.get('/:talentId/:jobOfferId', async(getTalentCandidacyForJobOffer));
candidacyRouter.post('/create', validateCandidacy, async(postCandidacy));
candidacyRouter.post('/create-meeting', validateMeeting, async(postMeeting));
candidacyRouter.patch('/status', validateCandidacyStatus, async(patchCandidacyStatus));
candidacyRouter.delete('/:candidacyId', async(deleteCandidacy));

export default candidacyRouter;
