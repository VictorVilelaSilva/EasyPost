import { loadStripe } from '@stripe/stripe-js'

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

if (!stripePublicKey) {
    console.warn('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe will not work.')
}

export const stripePromise = loadStripe(stripePublicKey ?? '')
