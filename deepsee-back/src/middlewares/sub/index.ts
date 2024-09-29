import { NextFunction, Request, Response } from 'express';

import { Company } from '../../models/recruiter';
import { validateNumber, validateString } from '../../utils/validation';

export interface StripeCheckoutSessionRequest extends Request {
    validatedData?: {
        companyId: Company['__id'];
    };
}

export interface StripeCustomerPortalRequest extends Request {
    validatedData?: {
        companyId: Company['__id'];
        sessionId: string;
    };
}

export const validateSubscriptionSession = (
    req: StripeCheckoutSessionRequest,
    res: Response,
    next: NextFunction,
): void => {
    const {
        companyId,
    } = req.body;

    const validatedCompanyId = validateNumber(companyId);
    if (!(validatedCompanyId)) {
        throw new Error(`Invalid candidacy id ${companyId}`);
    }

    req.validatedData = {
        companyId: validatedCompanyId,
    };

    next();
};

export const validateSubscriptionPortal = (
    req: StripeCustomerPortalRequest,
    res: Response,
    next: NextFunction,
): void => {
    const {
        companyId,
        sessionId,
    } = req.body;

    const validatedCompanyId = validateNumber(companyId);
    if (!(validatedCompanyId)) {
        throw new Error(`Invalid companyId ${companyId}`);
    }

    const validatedSessionId = validateString(sessionId);
    if (!(validatedSessionId)) {
        throw new Error(`Invalid sessionId ${sessionId}`);
    }

    req.validatedData = {
        companyId: validatedCompanyId,
        sessionId: validatedSessionId,
    };

    next();
};
