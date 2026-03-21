'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

interface UsageBucket {
    used: number;
    limit: number;   // -1 = unlimited
    remaining: number;
}

export interface UsageLimits {
    tier: 'anonymous' | 'free' | 'paid';
    carousel: UsageBucket;
    edit: UsageBucket;
    isLoading: boolean;
    refetch: () => Promise<void>;
}

const UNLIMITED: UsageBucket = { used: 0, limit: -1, remaining: Infinity };

export function useUsageLimits(): UsageLimits {
    const { user } = useAuth();
    const [tier, setTier] = useState<UsageLimits['tier']>('anonymous');
    const [carousel, setCarousel] = useState<UsageBucket>({ used: 0, limit: 1, remaining: 1 });
    const [edit, setEdit] = useState<UsageBucket>({ used: 0, limit: 0, remaining: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsage = useCallback(async () => {
        try {
            const headers: Record<string, string> = {};
            const currentUser = auth.currentUser;
            if (currentUser) {
                const token = await currentUser.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch('/api/usage', { headers });
            if (!res.ok) throw new Error('Failed to fetch usage');
            const data = await res.json();

            setTier(data.tier);
            setCarousel(data.carousel.limit === -1
                ? UNLIMITED
                : data.carousel
            );
            setEdit(data.edit.limit === -1
                ? UNLIMITED
                : data.edit
            );
        } catch (e) {
            console.error('[useUsageLimits] Error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage, user]);

    return { tier, carousel, edit, isLoading, refetch: fetchUsage };
}
