import { NextRequest, NextResponse } from 'next/server';
import { checkUsageLimit } from '@/lib/usageLimits';

export async function GET(req: NextRequest) {
    try {
        const [carousel, edit] = await Promise.all([
            checkUsageLimit(req, 'carousel'),
            checkUsageLimit(req, 'edit'),
        ]);

        return NextResponse.json({
            tier: carousel.tier,
            carousel: {
                used: carousel.used,
                limit: carousel.limit === Infinity ? -1 : carousel.limit,
                remaining: carousel.remaining,
            },
            edit: {
                used: edit.used,
                limit: edit.limit === Infinity ? -1 : edit.limit,
                remaining: edit.remaining,
            },
        });
    } catch (error) {
        console.error('[usage] Error:', error);
        return NextResponse.json(
            { error: 'Falha ao verificar limites de uso' },
            { status: 500 },
        );
    }
}
