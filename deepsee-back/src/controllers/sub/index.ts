import { Request, Response, NextFunction } from 'express';

import { StripeCheckoutSessionRequest, StripeCustomerPortalRequest } from '../../middlewares/sub';
import { getCompanyById } from '../../services/recruiter';
import {
    createStripeCheckoutSession,
    onWebhook,
    getStripeCheckoutSession,
    createStripePortalSession,
} from '../../services/sub';

export const getSubscriptionSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.query;
        if (!(sessionId && typeof sessionId === 'string')) {
            res.status(400).send('Missing Stripe Session ID');
            return;
        }

        const session = await getStripeCheckoutSession({ sessionId });
        res.send(session);
        return;
    } catch (error) {
        next(error);
    }
};

export const postSubscriptionSession = async (
    req: StripeCheckoutSessionRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const companyId = req.validatedData?.companyId;
        if (!companyId) {
            res.status(500).json({ error: 'Unexpected parse error' });
            return;
        }

        const company = await getCompanyById({ companyId });
        if (!company) {
            res.status(404).send('Company not found');
            return;
        }

        const session = await createStripeCheckoutSession({
            companyId: company.__id,
            url: `${process.env.DOMAIN}/recruiter/${company.name}`,
        });
        if (!(session)) {
            res.status(500).send('Failed to create session');
            return;
        }

        res.status(201).json(session);
    } catch (error) {
        next(error);
    }
};

export const postSubscriptionPortal = async (
    req: StripeCustomerPortalRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const sessionId = req.validatedData?.sessionId;
        if (!(sessionId)) {
            res.status(500).json({ error: 'Unexpected parse error' });
            return;
        }

        const session = await getStripeCheckoutSession({ sessionId });
        if (!(session.customer)) {
            res.status(400).send('Customer ID not found in session');
            return;
        }

        const companyId = req.validatedData?.companyId;
        if (!(companyId)) {
            res.status(500).json({ error: 'Unexpected parse error' });
            return;
        }

        const company = await getCompanyById({ companyId });
        if (!(company)) {
            res.status(404).send('Company not found');
            return;
        }

        const portalSession = await createStripePortalSession({
            customer: session.customer as string,
            url: `${process.env.DOMAIN}/recruiter/${company.name}`,
        });
        if (!(portalSession)) {
            res.status(500).send('Failed to create customer portal session');
            return;
        }

        res.status(201).json(portalSession);
        return;
    } catch (error) {
        next(error);
    }
};

export const subscriptionWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!(process.env.STRIPE_WEBHOOK_SECRET)) {
            res.status(400).send('No Stripe webhook secret provided');
            return;
        }

        const signature = req.headers['stripe-signature'] as string;
        if (!(signature)) {
            res.status(400).send('Missing Stripe signature');
            return;
        }

        const company = await onWebhook({
            payload: req.body,
            signature: signature,
            sk: process.env.STRIPE_WEBHOOK_SECRET,
        });
        if (!(company)) {
            res.status(500).send('Unknown error');
            return;
        }

        if (company.sub && company.subId) {
            res.status(200).send('Subscription created');
        }
        else if (!(company.sub) && !(company.subId)) {
            res.status(200).send('Subscription deleted');
        }
        else {
            res.status(500).send('Unknown error');
        }
    } catch (error) {
        next(error);
    }
};
