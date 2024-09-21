import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { ServiceAccount } from 'firebase-admin/app';

let serviceAccount: Partial<ServiceAccount> & { project_id?: string };
let db: FirebaseFirestore.Firestore;

const serviceAccountPath = path.join(process.cwd(), 'firebase-cred.json');

try {
    if (fs.existsSync(serviceAccountPath)) {
        console.log('Loading Firebase credentials from file');
        const rawData = fs.readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(rawData);

        // Ensure projectId is correctly assigned
        if (serviceAccount.project_id && !serviceAccount.projectId) {
            serviceAccount.projectId = serviceAccount.project_id;
        }
    } else {
        console.log('Loading Firebase credentials from environment variables');
        // Check for minimum required environment variables
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error('Missing required Firebase environment variables');
        }

        serviceAccount = {
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        };
    }

    console.log('Firebase credentials loaded from: ', serviceAccountPath);
    console.log('Project ID:', serviceAccount.projectId || serviceAccount.project_id);

    if (!serviceAccount.projectId && !serviceAccount.project_id) {
        throw new Error('Invalid Firebase credentials: projectId is missing');
    }

    if (getApps().length === 0) {
        console.log('Initializing Firebase app');
        initializeApp({
            credential: cert(serviceAccount as ServiceAccount)
        });
    }

    db = getFirestore();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
}

export { db };