import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-02-25.clover',
    })
}

// Plan configuration
const PLANS: Record<string, { name: string; priceInCents: number; description: string }> = {
    pro: {
        name: 'Plano Pro',
        priceInCents: 4990, // R$ 49,90
        description: 'EasyPost — Plano Pro Mensal',
    },
    starter: {
        name: 'Plano Starter',
        priceInCents: 1990, // R$ 19,90
        description: 'EasyPost — Plano Starter Mensal',
    },
    enterprise: {
        name: 'Plano Enterprise',
        priceInCents: 9990, // R$ 99,90
        description: 'EasyPost — Plano Enterprise Mensal',
    },
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { planId = 'pro', email } = body

        const plan = PLANS[planId]
        if (!plan) {
            return NextResponse.json(
                { error: 'Plano inválido' },
                { status: 400 }
            )
        }

        const paymentIntent = await getStripe().paymentIntents.create({
            amount: plan.priceInCents,
            currency: 'brl',
            description: plan.description,
            metadata: {
                planId,
                planName: plan.name,
                ...(email ? { email } : {}),
            },
            // Enables all payment methods configured in your Stripe Dashboard
            // (card, pix, boleto, etc.) — see https://dashboard.stripe.com/settings/payment_methods
            automatic_payment_methods: {
                enabled: true,
            },
            // Required for Boleto — customer email for sending payment instructions
            ...(email ? { receipt_email: email } : {}),
        })

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            amount: plan.priceInCents,
            planName: plan.name,
        })
    } catch (error) {
        console.error('Stripe PaymentIntent creation failed:', error)
        return NextResponse.json(
            { error: 'Erro ao processar o pagamento. Tente novamente.' },
            { status: 500 }
        )
    }
}
