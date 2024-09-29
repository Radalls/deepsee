import { Request, Response } from 'express';

import {
    CompanyInviteCodeRequest,
    CompanyInviteRequest,
    CompanyPatchRequest,
    CompanyRequest,
} from '../../middlewares/recruiter';
import {
    createCompany,
    createCompanyInvite,
    deleteCompanyById,
    editCompany,
    getCompanyByName,
    getCompanyInviteByCode,
    getRecruiterById,
} from '../../services/recruiter';

export const getRecruiter = async (req: Request, res: Response): Promise<void> => {
    const recruiterId = Number.parseInt(req.params.recruiterId);
    if (!(recruiterId)) {
        res.status(500).json({ error: `Invalid recruiter id ${recruiterId}` });
        return;
    }

    const recruiter = await getRecruiterById({ recruiterId });
    if (!(recruiter)) {
        res.status(404).json({ error: `Recruiter ${recruiterId} not found` });
        return;
    }

    res.status(200).json(recruiter);
};

export const getCompany = async (req: Request, res: Response): Promise<void> => {
    const companyName = req.params.companyName;
    if (!(companyName)) {
        res.status(500).json({ error: `Invalid company name ${companyName}` });
        return;
    }

    const company = await getCompanyByName({ companyName });
    if (!(company)) {
        res.status(404).json({ error: `Company ${companyName} not found` });
        return;
    }

    res.status(200).json(company);
};

export const postCompany = async (req: CompanyRequest, res: Response): Promise<void> => {
    const company = req.validatedData?.company;
    if (!(company)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const registeredCompany = await createCompany({ company });

    res.status(201).json(registeredCompany);
};

export const patchCompany = async (req: CompanyPatchRequest, res: Response): Promise<void> => {
    const companyId = Number.parseInt(req.params.companyId);
    if (!(companyId)) {
        res.status(500).json({ error: `Invalid company id ${companyId}` });
        return;
    }

    const company = req.validatedData?.company;
    if (!(company)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const registeredCompany = await editCompany({ company, companyId });

    res.status(200).json(registeredCompany);
};

export const postCompanyInvite = async (req: CompanyInviteRequest, res: Response): Promise<void> => {
    const companyInvite = req.validatedData?.companyInvite;
    if (!(companyInvite)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const registeredCompanyInvite = await createCompanyInvite({ companyInvite });

    res.status(201).json(registeredCompanyInvite);
};

export const postCompanyInviteCode = async (req: CompanyInviteCodeRequest, res: Response): Promise<void> => {
    const code = req.validatedData?.code;
    if (!(code)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const companyInvite = await getCompanyInviteByCode({ code });
    if (!(companyInvite)) {
        res.status(400).json({ error: `Company invite ${code} not found` });
        return;
    }

    res.status(200).json(companyInvite);
};

export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
    const companyId = Number.parseInt(req.params.companyId);
    if (!(companyId)) {
        res.status(500).json({ error: `Invalid company id ${companyId}` });
        return;
    }

    await deleteCompanyById({ companyId });

    res.status(200).json();
};
