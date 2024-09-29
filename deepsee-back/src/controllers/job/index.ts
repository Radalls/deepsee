import { Request, Response } from 'express';

import {
    JobOfferEditRequest,
    JobOfferRequest,
    JobOfferStatusEditRequest,
    JobOfferTestRunCodeRequest,
    JobOfferTestRunEditRequest,
} from '../../middlewares/job';
import {
    createJobOffer,
    getJobOfferById,
    getJobOfferTestById,
    getJobOffersByCompanyId,
    runJobOfferTestRunCode,
    getJobOffersBySearchParams,
    editJobOffer,
    editJobOfferStatus,
    editJobOfferTestRun,
    getJobOfferSuggestionsByTalentId,
} from '../../services/job';
import { getCompanyById } from '../../services/recruiter';

export const getJobOffer = async (req: Request, res: Response): Promise<void> => {
    const jobOfferId = Number.parseInt(req.params.jobOfferId);
    if (!(jobOfferId)) {
        res.status(500).json({ error: `Invalid job offer id ${jobOfferId}` });
        return;
    }

    const jobOffer = await getJobOfferById({ jobOfferId });
    if (!(jobOffer)) {
        res.status(404).json({ error: `Job offer ${jobOfferId} not found` });
        return;
    }

    res.status(200).json(jobOffer);
};

export const getJobOffersByCompany = async (req: Request, res: Response): Promise<void> => {
    const companyId = Number.parseInt(req.params.companyId);
    if (!(companyId)) {
        res.status(500).json({ error: `Invalid company id ${companyId}` });
        return;
    }

    const jobOffers = await getJobOffersByCompanyId({ companyId });

    res.status(200).json(jobOffers);
};

export const searchJobOffers = async (req: Request, res: Response): Promise<void> => {
    const jobOffers = await getJobOffersBySearchParams({ params: req.query });

    res.json(jobOffers);
};

export const getJobOfferSuggestions = async (req: Request, res: Response): Promise<void> => {
    const talentId = Number.parseInt(req.params.talentId);
    if (!(talentId)) {
        res.status(500).json({ error: `Invalid talent id ${talentId}` });
        return;
    }

    const jobOffers = await getJobOfferSuggestionsByTalentId({ talentId });

    res.json(jobOffers);
};

export const postJobOffer = async (req: JobOfferRequest, res: Response): Promise<void> => {
    const jobOffer = req.validatedData?.jobOffer;
    if (!(jobOffer)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const jobOfferTest = req.validatedData?.jobOfferTest;

    //TODO: only check if company exists
    const company = await getCompanyById({ companyId: jobOffer._companyId });
    if (!(company)) {
        res.status(404).json({ error: `Company ${jobOffer._companyId} not found` });
        return;
    }

    const {
        jobOffer: registeredJobOffer,
        jobOfferTest: registeredJobOfferTest,
    } = await createJobOffer({
        jobOffer,
        jobOfferTest,
    });

    res.status(201).json({
        jobOffer: registeredJobOffer,
        jobOfferTest: registeredJobOfferTest,
    });
};

export const patchJobOffer = async (req: JobOfferEditRequest, res: Response): Promise<void> => {
    const jobOffer = req.validatedData?.jobOffer;
    if (!(jobOffer)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const jobOfferTest = req.validatedData?.jobOfferTest;

    const {
        jobOffer: updatedJobOffer,
        jobOfferTest: updatedJobOfferTest,
    } = await editJobOffer({
        newJobOffer: jobOffer,
        newJobOfferTest: jobOfferTest,
    });

    res.status(200).json({
        updatedJobOffer,
        updatedJobOfferTest,
    });
};

export const patchJobOfferStatus = async (req: JobOfferStatusEditRequest, res: Response): Promise<void> => {
    const jobOffer = req.validatedData?.jobOffer;
    if (!(jobOffer)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const updatedJobOffer = await editJobOfferStatus({ jobOffer });
    if (!(updatedJobOffer)) {
        res.status(404).json({ error: `Job offer ${jobOffer.__id} not found` });
        return;
    }

    res.status(200).json(updatedJobOffer);
};

export const getJobOfferTest = async (req: Request, res: Response): Promise<void> => {
    const jobOfferTestId = Number.parseInt(req.params.jobOfferTestId);
    if (!(jobOfferTestId)) {
        res.status(500).json({ error: `Invalid job offer test id ${jobOfferTestId}` });
        return;
    }

    const jobOfferTest = await getJobOfferTestById({ jobOfferTestId });
    if (!(jobOfferTest)) {
        res.status(404).json({ error: `Job offer test ${jobOfferTestId} not found` });
        return;
    }

    res.status(200).json(jobOfferTest);
};

export const patchJobOfferTestRun = async (req: JobOfferTestRunEditRequest, res: Response): Promise<void> => {
    const jobOfferTestRun = req.validatedData?.jobOfferTestRun;
    if (!(jobOfferTestRun)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const updatedJobOfferTestRun = await editJobOfferTestRun({ jobOfferTestRun });
    if (!(updatedJobOfferTestRun)) {
        res.status(404).json({ error: 'Job offer test run not found' });
        return;
    }

    res.status(200).json(updatedJobOfferTestRun);
};

export const postJobOfferTestRunCode = async (req: JobOfferTestRunCodeRequest, res: Response): Promise<void> => {
    const jobOfferTestId = Number.parseInt(req.params.jobOfferTestId);
    if (!(jobOfferTestId)) {
        res.status(500).json({ error: `Invalid job offer test id ${jobOfferTestId}` });
        return;
    }

    const talentId = Number.parseInt(req.params.talentId);
    if (!(talentId)) {
        res.status(500).json({ error: `Invalid talent id ${talentId}` });
        return;
    }

    const testCode = req.validatedData?.testCode;
    if (!(testCode)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const testResult = await runJobOfferTestRunCode({
        jobOfferTestId,
        talentId,
        testCode,
    });

    res.status(200).json(testResult);
};
