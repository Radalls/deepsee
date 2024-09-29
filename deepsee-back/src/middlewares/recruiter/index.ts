import { NextFunction, Request, Response } from 'express';

import { Company, CompanyInvite } from '../../models/recruiter';
import { validateEmail, validateNumber, validateString } from '../../utils/validation';

export interface CompanyRequest extends Request {
    validatedData?: {
        company: Required<Pick<Company,
            '_ownerId' | 'business' | 'description' | 'name'
        >>,
    };
}

export interface CompanyInviteRequest extends Request {
    validatedData?: {
        companyInvite: Required<Pick<CompanyInvite,
            '_companyId' | 'guestEmail'
        >>,
    };
}

export interface CompanyInviteCodeRequest extends Request {
    validatedData?: {
        code: string,
    };
}

export const validateCompany = (req: CompanyRequest, res: Response, next: NextFunction): void => {
    const {
        _ownerId,
        business,
        description,
        name,
    } = req.body;

    const validateOwnerId = validateNumber(_ownerId);
    if (!(validateOwnerId)) {
        throw new Error(`Invalid owner id ${_ownerId}`);
    }

    const validateBusiness = validateString(business);
    if (!(validateBusiness)) {
        throw new Error(`Invalid business ${business}`);
    }

    const validateDescription = validateString(description);
    if (!(validateDescription)) {
        throw new Error(`Invalid description ${description}`);
    }

    const validateName = validateString(name);
    if (!(validateName)) {
        throw new Error(`Invalid name ${name}`);
    }

    req.validatedData = {
        company: {
            _ownerId: validateOwnerId,
            business: validateBusiness,
            description: validateDescription,
            name: validateName,
        },
    };

    next();
};

export const validateCompanyInvite = (req: CompanyInviteRequest, res: Response, next: NextFunction): void => {
    const {
        _companyId,
        guestEmail,
    } = req.body;

    const validateCompanyId = validateNumber(_companyId);
    if (!(validateCompanyId)) {
        throw new Error(`Invalid company id ${_companyId}`);
    }

    const validateGuestEmail = validateEmail(guestEmail);
    if (!(validateGuestEmail)) {
        throw new Error(`Invalid guest email ${guestEmail}`);
    }

    req.validatedData = {
        companyInvite: {
            _companyId: validateCompanyId,
            guestEmail: validateGuestEmail,
        },
    };

    next();
};

export const validateCompanyInviteCode = (req: CompanyInviteCodeRequest, res: Response, next: NextFunction): void => {
    const { code } = req.body;

    const validateCode = validateString(code);
    if (!(validateCode)) {
        throw new Error(`Invalid code ${code}`);
    }

    req.validatedData = {
        code: validateCode,
    };

    next();
};

export interface CompanyPatchRequest extends Request {
    validatedData?: {
        company: Partial<Company>,
    };
}

export const validateCompanyPatch = (req: CompanyPatchRequest, res: Response, next: NextFunction): void => {
    const { company } = req.body;

    const validateBusiness = validateString(company.business);
    if (!(validateBusiness)) {
        throw new Error(`Invalid business ${company.business}`);
    }

    const validateDescription = validateString(company.description);
    if (!(validateDescription)) {
        throw new Error(`Invalid description ${company.description}`);
    }

    req.validatedData = {
        company: {
            business: validateBusiness,
            description: validateDescription,
        },
    };

    next();
};

