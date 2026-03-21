import { createHash } from 'crypto';
import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// --- Limits per tier ---
const LIMITS = {
    anonymous: { carousel: 1, edit: 0 },
    free: { carousel: 6, edit: 3 },
    paid: { carousel: Infinity, edit: Infinity },
} as const;

type Tier = keyof typeof LIMITS;
type LimitType = 'carousel' | 'edit';

export interface UsageCheckResult {
    allowed: boolean;
    remaining: number;
    used: number;
    limit: number;
    tier: Tier;
    userId?: string;
    ipHash?: string;
}

function getTodayUTC(): string {
    return new Date().toISOString().slice(0, 10); // "2026-03-21"
}

function hashIdentifier(ip: string, userAgent: string): string {
    return createHash('sha256').update(`${ip}|${userAgent}`).digest('hex').slice(0, 32);
}

function extractIp(req: NextRequest): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '0.0.0.0'
    );
}

async function verifyToken(authHeader: string | null): Promise<string | null> {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    try {
        const decoded = await adminAuth.verifyIdToken(token);
        return decoded.uid;
    } catch {
        return null;
    }
}

export async function checkUsageLimit(
    req: NextRequest,
    limitType: LimitType,
): Promise<UsageCheckResult> {
    const today = getTodayUTC();
    const authHeader = req.headers.get('authorization');
    const userId = await verifyToken(authHeader);

    if (userId) {
        // --- Authenticated user ---
        try {
            const userRef = adminDb.collection('users').doc(userId);
            const snap = await userRef.get();
            const data = snap.data() || {};

            const isPaid = data.isPaid === true;
            const tier: Tier = isPaid ? 'paid' : 'free';
            const limit = LIMITS[tier][limitType];

            // Reset daily counters if date changed
            const countField = limitType === 'carousel' ? 'dailyCarouselCount' : 'dailyEditCount';
            let used: number = data[countField] || 0;

            if (data.lastUsageDate !== today) {
                // New day — reset counters
                await userRef.set(
                    { dailyCarouselCount: 0, dailyEditCount: 0, lastUsageDate: today },
                    { merge: true },
                );
                used = 0;
            }

            const remaining = Math.max(0, limit - used);
            return { allowed: remaining > 0, remaining, used, limit, tier, userId };
        } catch (error) {
            console.error('[usageLimits user auth fallback]', error);
            const limit = LIMITS.free[limitType];
            return { allowed: true, remaining: limit, used: 0, limit, tier: 'free', userId };
        }
    }

    // --- Anonymous user ---
    const ip = extractIp(req);
    const ua = req.headers.get('user-agent') || '';
    const ipHash = hashIdentifier(ip, ua);
    const tier: Tier = 'anonymous';
    const limit = LIMITS.anonymous[limitType];

    if (limit === 0) {
        return { allowed: false, remaining: 0, used: 0, limit: 0, tier, ipHash };
    }

    try {
        const anonRef = adminDb.collection('anonymousUsage').doc(ipHash);
        const snap = await anonRef.get();
        const data = snap.data() || {};

        let used: number = data.dailyCarouselCount || 0;

        if (data.lastUsageDate !== today) {
            await anonRef.set({ dailyCarouselCount: 0, lastUsageDate: today, ipHash }, { merge: true });
            used = 0;
        }

        const remaining = Math.max(0, limit - used);
        return { allowed: remaining > 0, remaining, used, limit, tier, ipHash };
    } catch (error) {
        console.error('[usageLimits anon fallback]', error);
        return { allowed: true, remaining: limit, used: 0, limit, tier, ipHash };
    }
}

export async function incrementUsage(
    identifier: string,
    limitType: LimitType,
    isAnonymous: boolean,
): Promise<void> {
    const today = getTodayUTC();
    const countField = limitType === 'carousel' ? 'dailyCarouselCount' : 'dailyEditCount';

    try {
        if (isAnonymous) {
            const ref = adminDb.collection('anonymousUsage').doc(identifier);
            await ref.set(
                { [countField]: FieldValue.increment(1), lastUsageDate: today },
                { merge: true },
            );
        } else {
            const ref = adminDb.collection('users').doc(identifier);
            await ref.set(
                { [countField]: FieldValue.increment(1), lastUsageDate: today },
                { merge: true },
            );
        }
    } catch (error) {
        console.error('[incrementUsage fallback error]', error);
    }
}
