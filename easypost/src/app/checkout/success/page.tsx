'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { stripePromise } from '@/lib/stripe'
import { Logo } from '@/components/Logo'
import { CheckCircle, ArrowRight, Sparkles, Loader2, AlertCircle, Clock, FileText } from 'lucide-react'

type PaymentStatus = 'loading' | 'succeeded' | 'processing' | 'requires_action' | 'failed'

function SuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<PaymentStatus>('loading')

    useEffect(() => {
        const clientSecret = searchParams.get('payment_intent_client_secret')
        if (!clientSecret) {
            // No secret in URL — user navigated here directly
            setStatus('succeeded')
            return
        }

        stripePromise.then(async (stripe) => {
            if (!stripe) {
                setStatus('failed')
                return
            }
            const { error, paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
            if (error) {
                setStatus('failed')
            } else if (paymentIntent?.status === 'succeeded') {
                setStatus('succeeded')
            } else if (paymentIntent?.status === 'processing') {
                setStatus('processing')
            } else if (paymentIntent?.status === 'requires_action') {
                // Boleto: payment intent created, waiting for customer to pay
                setStatus('requires_action')
            } else {
                setStatus('failed')
            }
        })
    }, [searchParams])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin" style={{ color: '#A855F7' }} />
            </div>
        )
    }

    if (status === 'failed') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-md text-center animate-reveal">
                    <div className="flex justify-center mb-8">
                        <Logo className="text-2xl" />
                    </div>
                    <div
                        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                        style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '2px solid rgba(239, 68, 68, 0.3)',
                        }}
                    >
                        <AlertCircle size={36} style={{ color: '#ef4444' }} />
                    </div>
                    <h1
                        className="text-2xl lg:text-3xl font-bold mb-3"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
                    >
                        Pagamento não concluído
                    </h1>
                    <p
                        className="text-base mb-8"
                        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                    >
                        Houve um problema com seu pagamento. Por favor, tente novamente.
                    </p>
                    <button
                        onClick={() => router.push('/checkout?plan=pro')}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer"
                        style={{
                            fontFamily: 'var(--font-display)',
                            background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                            color: '#fff',
                            border: 'none',
                        }}
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'requires_action') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-md text-center animate-reveal">
                    <div className="flex justify-center mb-8">
                        <Logo className="text-2xl" />
                    </div>
                    <div
                        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                        style={{
                            background: 'rgba(251, 191, 36, 0.15)',
                            border: '2px solid rgba(251, 191, 36, 0.3)',
                        }}
                    >
                        <FileText size={36} style={{ color: '#fbbf24' }} />
                    </div>
                    <h1
                        className="text-2xl lg:text-3xl font-bold mb-3"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
                    >
                        Boleto Gerado!
                    </h1>
                    <p
                        className="text-base mb-6"
                        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                    >
                        Seu boleto foi gerado com sucesso. Realize o pagamento em até 3 dias úteis para ativar sua assinatura.
                    </p>

                    <div className="glass-card-static p-5 mb-8 text-left">
                        <div className="flex items-center gap-3 mb-3">
                            <Clock size={16} style={{ color: '#fbbf24' }} />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
                            >
                                Próximos passos
                            </span>
                        </div>
                        <ul className="flex flex-col gap-2">
                            {[
                                'Você receberá o boleto por e-mail',
                                'Pague via app do banco ou lotérica',
                                'A confirmação pode levar até 3 dias úteis',
                                'Sua assinatura será ativada automaticamente',
                            ].map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-2 text-sm"
                                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                                >
                                    <span
                                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                                        style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}
                                    >
                                        {i + 1}
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer"
                        style={{
                            fontFamily: 'var(--font-display)',
                            background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                            color: '#fff',
                            border: 'none',
                        }}
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md text-center animate-reveal">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Logo className="text-2xl" />
                </div>

                {/* Success Icon */}
                <div
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center animate-reveal animate-reveal-delay-1"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(168, 85, 247, 0.1))',
                        border: '2px solid rgba(34, 197, 94, 0.3)',
                    }}
                >
                    <CheckCircle size={36} style={{ color: '#22c55e' }} />
                </div>

                {/* Title */}
                <h1
                    className="text-2xl lg:text-3xl font-bold mb-3 animate-reveal animate-reveal-delay-2"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
                >
                    {status === 'processing' ? 'Pagamento em processamento' : 'Pagamento Confirmado!'}
                </h1>
                <p
                    className="text-base mb-8 animate-reveal animate-reveal-delay-3"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                >
                    {status === 'processing'
                        ? 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.'
                        : 'Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos premium do EasyPost.'}
                </p>

                {/* Info Card */}
                <div
                    className="glass-card-static p-5 mb-8 text-left animate-reveal animate-reveal-delay-3"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Sparkles size={16} style={{ color: '#A855F7' }} />
                        <span
                            className="text-sm font-semibold"
                            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
                        >
                            O que mudou?
                        </span>
                    </div>
                    <ul className="flex flex-col gap-2">
                        {[
                            'Geração ilimitada de carrosséis',
                            'Brand Kit com cores e fontes customizadas',
                            'Suporte prioritário 24/7',
                            'Acesso antecipado a novos recursos com IA',
                        ].map((item, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-2 text-sm"
                                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                            >
                                <CheckCircle size={14} style={{ color: '#22c55e' }} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <button
                    onClick={() => router.push('/create')}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer relative overflow-hidden group animate-reveal animate-reveal-delay-4"
                    style={{
                        fontFamily: 'var(--font-display)',
                        background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                        color: '#fff',
                        border: 'none',
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                            background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                            filter: 'blur(20px)',
                            zIndex: -1,
                        }}
                    />
                    <div className="flex items-center justify-center gap-2">
                        <span>Começar a Criar</span>
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </div>
                </button>

                <button
                    onClick={() => router.push('/')}
                    className="mt-4 text-sm transition-colors cursor-pointer"
                    style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)', background: 'none', border: 'none' }}
                >
                    Voltar ao início
                </button>
            </div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin" style={{ color: '#A855F7' }} />
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    )
}
