import express from 'express';

import {
    getJobOffer,
    getJobOfferTest,
    getJobOffersByCompany,
    postJobOffer,
    postJobOfferTestRunCode,
    searchJobOffers,
    patchJobOfferStatus,
    patchJobOffer,
    patchJobOfferTestRun,
    getJobOfferSuggestions,
} from '../../controllers/job';
import { async } from '../../middlewares/async';
import {
    validateJobOffer,
    validateJobOfferEdit,
    validateJobOfferStatusEdit,
    validateJobOfferTestRunCode,
    validateJobOfferTestRunEdit,
} from '../../middlewares/job';

const jobRouter = express.Router();

jobRouter.get('/search', async(searchJobOffers));
jobRouter.get('/search/:talentId', async(getJobOfferSuggestions));
jobRouter.get('/company/:companyId', async(getJobOffersByCompany));
jobRouter.get('/test/:jobOfferTestId', async(getJobOfferTest));
jobRouter.get('/:jobOfferId', async(getJobOffer));
jobRouter.post('/draft', validateJobOffer, async(postJobOffer));
jobRouter.post('/test/:jobOfferTestId/:talentId/run', validateJobOfferTestRunCode, async(postJobOfferTestRunCode));
jobRouter.patch('/draft', validateJobOfferEdit, async(patchJobOffer));
jobRouter.patch('/status', validateJobOfferStatusEdit, async(patchJobOfferStatus));
jobRouter.patch('/run', validateJobOfferTestRunEdit, async(patchJobOfferTestRun));

export default jobRouter;
