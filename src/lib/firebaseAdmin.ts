import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
        app = initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
    } else {
        // Fallback: initialize without credentials (works in Firebase-hosted environments)
        app = initializeApp({ projectId });
    }
} else {
    app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
