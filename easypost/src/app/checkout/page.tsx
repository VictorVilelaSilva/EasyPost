'use client'

import { useState, useEffect, useCallback, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import { ArrowLeft, Check, Shield, Lock, CreditCard, Loader2 } from 'lucide-react'

/* ─────────────────────────────────────────────
   Plan Definitions
   ───────────────────────────────────────────── */
const PLANS = {
    starter: {
        id: 'starter',
        name: 'Plano Starter',
        price: 'R$ 19,90',
        priceValue: 1990,
        period: '/mês',
        features: [
            'Até 30 posts automatizados',
            'Templates básicos de design',
            'Suporte por e-mail',
            'Exportação em alta qualidade',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Plano Pro',
        price: 'R$ 49,90',
        priceValue: 4990,
        period: '/mês',
        popular: true,
        features: [
            'Geração Ilimitada de Posts',
            'Brand Kit Customizado',
            'Suporte Prioritário 24/7',
            'Acesso antecipado a novos recursos',
        ],
    },
    enterprise: {
        id: 'enterprise',
        name: 'Plano Enterprise',
        price: 'R$ 99,90',
        priceValue: 9990,
        period: '/mês',
        features: [
            'Tudo do Plano Pro',
            'Integrações com API customizadas',
            'Painel de analytics avançado',
            'Gerente de conta dedicado',
        ],
    },
} as const

type PlanId = keyof typeof PLANS

/* ─────────────────────────────────────────────
   Checkout Form (inside Elements context)
   ───────────────────────────────────────────── */
function CheckoutForm({ planId }: { planId: PlanId }) {
    const stripe = useStripe()
    const elements = useElements()
    const router = useRouter()

    const plan = PLANS[planId]

    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setIsProcessing(true)
        setMessage(null)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
            // For redirect-based methods (Pix, Boleto), Stripe redirects automatically.
            // For card, if no redirect is needed, handle inline.
            redirect: 'if_required',
        })

        if (error) {
            // This point is only reached if there's an immediate error.
            if (error.type === 'card_error' || error.type === 'validation_error') {
                setMessage(error.message ?? 'Erro na validação do pagamento.')
            } else {
                setMessage('Ocorreu um erro inesperado. Tente novamente.')
            }
        } else {
            // Payment succeeded without redirect (e.g. card with no 3DS)
            router.push('/checkout/success')
        }

        setIsProcessing(false)
    }, [stripe, elements])

    return (
        <form onSubmit={handleSubmit} className="animate-reveal">
            <div
                className="grid gap-6 lg:gap-8"
                style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}
            >
                {/* ─── LEFT COLUMN: Plan Summary ─── */}
                <div className="flex flex-col gap-6">
                    {/* Plan Card */}
                    <div
                        className="glass-card-static p-6 lg:p-8"
                        style={{
                            background: 'linear-gradient(135deg, rgba(88, 88, 88, 0.12), rgba(168, 85, 247, 0.06))',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span
                                className="text-[0.7rem] font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                                style={{
                                    color: '#A855F7',
                                    background: 'rgba(168, 85, 247, 0.12)',
                                    border: '1px solid rgba(168, 85, 247, 0.2)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                Resumo da Assinatura
                            </span>
                        </div>

                        <h2
                            className="text-2xl lg:text-3xl font-bold mb-1"
                            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
                        >
                            {plan.name}
                        </h2>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span
                                className="text-3xl lg:text-4xl font-bold"
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {plan.price}
                            </span>
                            <span
                                className="text-sm"
                                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                            >
                                {plan.period}
                            </span>
                        </div>

                        {/* Features list */}
                        <div className="flex flex-col gap-3">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: 'rgba(168, 85, 247, 0.15)' }}
                                    >
                                        <Check size={12} style={{ color: '#A855F7' }} strokeWidth={3} />
                                    </div>
                                    <span
                                        className="text-sm"
                                        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                                    >
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div
                            className="my-6"
                            style={{ height: '1px', background: 'var(--color-border)' }}
                        />

                        {/* Price Summary */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                                <span style={{ color: 'var(--color-text)' }}>{plan.price}</span>
                            </div>
                            <div className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Desconto</span>
                                <span style={{ color: '#22c55e' }}>R$ 0,00</span>
                            </div>
                            <div
                                className="my-2"
                                style={{ height: '1px', background: 'var(--color-border)' }}
                            />
                            <div className="flex justify-between" style={{ fontFamily: 'var(--font-display)' }}>
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    Total a pagar
                                </span>
                                <span
                                    className="text-xl font-bold"
                                    style={{
                                        background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {plan.price}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Plan toggle pills */}
                    <div className="flex items-center gap-2 justify-center">
                        {Object.values(PLANS).map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => router.push(`/checkout?plan=${p.id}`)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                                style={{
                                    fontFamily: 'var(--font-body)',
                                    background: p.id === planId ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                                    color: p.id === planId ? '#A855F7' : 'var(--color-text-subtle)',
                                    border: `1px solid ${p.id === planId ? 'rgba(168, 85, 247, 0.3)' : 'var(--color-border)'}`,
                                }}
                            >
                                {p.name.replace('Plano ', '')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── RIGHT COLUMN: Payment Form ─── */}
                <div className="flex flex-col gap-6">
                    <div className="glass-card-static p-6 lg:p-8">
                        <h3
                            className="text-lg font-semibold mb-6"
                            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
                        >
                            Detalhes do Pagamento
                        </h3>

                        {/* Stripe PaymentElement — renders card, Pix, boleto, wallets, etc. */}
                        <div className="mb-6">
                            <PaymentElement
                                options={{
                                    layout: 'tabs',
                                }}
                            />
                        </div>

                        {/* Error */}
                        {message && (
                            <div
                                className="mb-4 p-3 rounded-lg text-sm"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                {message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!stripe || isProcessing}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer relative overflow-hidden group"
                            style={{
                                fontFamily: 'var(--font-display)',
                                background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                                color: '#fff',
                                border: 'none',
                                opacity: isProcessing ? 0.7 : 1,
                            }}
                        >
                            {/* Glow effect */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                                    filter: 'blur(20px)',
                                    zIndex: -1,
                                }}
                            />
                            <div className="flex items-center justify-center gap-2">
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Processando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={14} />
                                        <span>Finalizar Pagamento — {plan.price}</span>
                                    </>
                                )}
                            </div>
                        </button>

                        {/* Security Note */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Shield size={12} style={{ color: 'var(--color-text-subtle)' }} />
                            <span
                                className="text-xs"
                                style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)' }}
                            >
                                Pagamento processado de forma segura pelo Stripe
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── FOOTER ─── */}
            <footer className="mt-12 text-center">
                <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                        <Lock size={14} style={{ color: 'var(--color-text-subtle)' }} />
                        <span
                            className="text-xs"
                            style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)' }}
                        >
                            SSL Seguro
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard size={14} style={{ color: 'var(--color-text-subtle)' }} />
                        <span
                            className="text-xs"
                            style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)' }}
                        >
                            Stripe Powered
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={14} style={{ color: 'var(--color-text-subtle)' }} />
                        <span
                            className="text-xs"
                            style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)' }}
                        >
                            PCI Compliant
                        </span>
                    </div>
                </div>
                <p
                    className="text-xs mb-2"
                    style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)' }}
                >
                    © {new Date().getFullYear()} EasyPost IA. Todos os direitos reservados.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <a
                        href="#"
                        className="text-xs transition-colors hover:underline"
                        style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)' }}
                    >
                        Termos de Uso
                    </a>
                    <a
                        href="#"
                        className="text-xs transition-colors hover:underline"
                        style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)' }}
                    >
                        Privacidade
                    </a>
                    <a
                        href="#"
                        className="text-xs transition-colors hover:underline"
                        style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)' }}
                    >
                        Ajuda
                    </a>
                </div>
            </footer>
        </form>
    )
}

/* ─────────────────────────────────────────────
   Main Checkout Page Wrapper
   Creates PaymentIntent on load, then renders
   Elements with clientSecret (required for PaymentElement)
   ───────────────────────────────────────────── */
function CheckoutPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const planId = (searchParams.get('plan') || 'pro') as PlanId

    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Validate plan
    useEffect(() => {
        if (!PLANS[planId]) {
            router.replace('/checkout?plan=pro')
        }
    }, [planId, router])

    // Create PaymentIntent on page load
    useEffect(() => {
        if (!PLANS[planId]) return

        setClientSecret(null)
        setError(null)

        fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                planId,
                email: user?.email,
            }),
        })
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Erro ao iniciar pagamento.')
                setClientSecret(data.clientSecret)
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : 'Erro inesperado.')
            })
    }, [planId, user?.email])

    if (!PLANS[planId]) return null

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="glass-card-static p-8 max-w-md text-center">
                    <p className="text-sm mb-4" style={{ color: '#ef4444', fontFamily: 'var(--font-body)' }}>
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm underline cursor-pointer"
                        style={{ color: '#A855F7', fontFamily: 'var(--font-body)', background: 'none', border: 'none' }}
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header
                className="sticky top-0 z-40 w-full"
                style={{
                    background: 'rgba(10, 12, 20, 0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--color-border)',
                }}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm transition-colors cursor-pointer group"
                        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                    >
                        <ArrowLeft
                            size={16}
                            className="transition-transform group-hover:-translate-x-1"
                        />
                        <span className="group-hover:underline">Voltar aos Planos</span>
                    </button>
                    <Logo className="text-xl" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-start justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-5xl">
                    {clientSecret ? (
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: 'night',
                                    variables: {
                                        colorPrimary: '#A855F7',
                                        colorBackground: '#0a0a0a',
                                        colorText: '#f5f5f5',
                                        colorDanger: '#ef4444',
                                        fontFamily: "'Space Grotesk', system-ui, sans-serif",
                                        borderRadius: '0.75rem',
                                    },
                                },
                            }}
                        >
                            <CheckoutForm planId={planId} />
                        </Elements>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin" style={{ color: '#A855F7' }} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

/* ─────────────────────────────────────────────
   Suspense Wrapper (for useSearchParams)
   ───────────────────────────────────────────── */
export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin" style={{ color: '#A855F7' }} />
                </div>
            }
        >
            <CheckoutPageContent />
        </Suspense>
    )
}
