import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'firebase-cred.json');
let serviceAccount;

try {
    const rawData = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(rawData);
} catch (error) {
    console.error('Error reading firebase-cred.json:', error);
    throw new Error('Failed to load Firebase credentials');
}

if (!serviceAccount.project_id) {
    throw new Error('Invalid Firebase credentials: project_id is missing');
}

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export const db = getFirestore();