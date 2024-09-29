import Stripe from 'stripe';

export const getStripe = (): Stripe => {
    const sk = process.env.STRIPE_SECRET_KEY ?? 'STRIPE_SECRET_KEY';

    return new Stripe(sk, {
        apiVersion: '2024-06-20',
        appInfo: {
            name: 'stripe-samples/checkout-single-subscription',
            url: 'https://github.com/stripe-samples/checkout-single-subscription',
            version: '0.0.1',
        },
    });
};
