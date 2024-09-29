import express from 'express';

import {
    deleteCompany,
    getCompany,
    getRecruiter,
    patchCompany,
    postCompanyInvite,
} from '../../controllers/recruiter';
import { async } from '../../middlewares/async';
import { validateCompanyInvite, validateCompanyPatch } from '../../middlewares/recruiter';

const recruiterRouter = express.Router();

recruiterRouter.get('/:recruiterId', async(getRecruiter));
recruiterRouter.get('/company/:companyName', async(getCompany));
recruiterRouter.post('/company/invite', validateCompanyInvite, async(postCompanyInvite));
recruiterRouter.patch('/company/:companyId', validateCompanyPatch, async(patchCompany));
recruiterRouter.delete('/company/:companyId', async(deleteCompany));

export default recruiterRouter;
