import { createHash } from 'crypto'
import { NextRequest } from 'next/server'
import { adminAuth, adminDb } from './firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { Platform } from '@/types'

export interface CreationLogEntry {
    userId: string | null
    ipHash: string | null
    action: 'carousel' | 'edit'
    platform: Platform
    slideCount: number
}

function hashIp(ip: string, userAgent: string): string {
    return createHash('sha256').update(`${ip}|${userAgent}`).digest('hex').slice(0, 32)
}

export async function extractIdentity(req: NextRequest): Promise<{ userId: string | null; ipHash: string }> {
    const authHeader = req.headers.get('authorization')
    let userId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
        try {
            const decoded = await adminAuth.verifyIdToken(authHeader.slice(7))
            userId = decoded.uid
        } catch {
            // invalid token — treat as anonymous
        }
    }

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '0.0.0.0'
    const ua = req.headers.get('user-agent') || ''
    const ipHash = hashIp(ip, ua)

    return { userId, ipHash }
}

export async function logCreation(entry: CreationLogEntry): Promise<void> {
    try {
        await adminDb.collection('creationLogs').add({
            ...entry,
            timestamp: FieldValue.serverTimestamp(),
        })
    } catch (err) {
        console.error('[creationLog] logCreation:', err)
    }
}
