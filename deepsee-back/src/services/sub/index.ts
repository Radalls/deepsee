import Stripe from 'stripe';

import { Company } from '../../models/recruiter';
import { updateCompanySubscription } from '../../repositories/recruiter';
import { getStripe } from '../../utils/sub';

let stripe: Stripe;

export const getStripeCheckoutSession = async ({ sessionId }: {
    sessionId: string,
}) => {
    if (!(stripe)) {
        stripe = getStripe();
    }

    return await stripe.checkout.sessions.retrieve(sessionId);
};

export const createStripeCheckoutSession = async ({ companyId, url }: {
    companyId: Company['__id'],
    url: string,
}) => {
    if (!(stripe)) {
        stripe = getStripe();
    }

    const session = await stripe.checkout.sessions.create({
        cancel_url: url,
        line_items: [
            {
                price: process.env.STRIPE_PRICE_ID,
                quantity: 1,
            },
        ],
        metadata: {
            companyId,
        },
        mode: 'subscription',
        success_url: url,
    });

    return session;
};

export const createStripePortalSession = async ({ customer, url }: {
    customer: string,
    url: string,
}) => {
    if (!(stripe)) {
        stripe = getStripe();
    }

    const session = await stripe.billingPortal.sessions.create({
        customer,
        return_url: url,
    });

    return session;
};

export const onWebhook = async ({ payload, signature, sk }: {
    payload: string | Buffer,
    signature: string,
    sk: string,
}) => {
    if (!(stripe)) {
        stripe = getStripe();
    }

    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        sk,
    );

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId = Number.parseInt(session.metadata?.companyId as string);
        if (!(companyId)) {
            return;
        }

        const updatedCompany = await updateCompanySubscription({
            companyId,
            sub: true,
            subId: session.id,
        });

        return updatedCompany;
    }
    else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = Number.parseInt(subscription.metadata?.companyId as string);
        if (!(companyId)) {
            return;
        }

        const updatedCompany = await updateCompanySubscription({
            companyId,
            sub: false,
            subId: null,
        });

        return updatedCompany;
    }
    else {
        throw new Error(`Unhandled event type ${event.type}`);
    }
};
