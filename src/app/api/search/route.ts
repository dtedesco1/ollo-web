import { NextResponse } from 'next/server';
import { FirebaseError } from 'firebase/app';
import { fetchClipsFromFirestore } from '@/utils/clipUtils';

const CLOUD_FUNCTION_URL = "https://us-central1-ai-app-mvp-project.cloudfunctions.net/search";

class CloudFunctionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CloudFunctionError";
    }
}

async function fetchClipIdsFromCloudFunction(query: string, top_k: string, alpha: string): Promise<string[]> {
    try {
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, top_k, alpha })
        });

        if (!response.ok) {
            throw new CloudFunctionError(`HTTP error! status: ${response.status}`);
        }

        const clipIds = await response.json();
        if (!Array.isArray(clipIds)) {
            throw new CloudFunctionError('Invalid response from Cloud Function');
        }

        return clipIds;
    } catch (error) {
        console.error('Error in fetchClipIdsFromCloudFunction:', error);
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const { query, top_k = "10", alpha = "0.2" } = await request.json();

        console.log('Fetching clip IDs from Cloud Function');
        const clipIds = await fetchClipIdsFromCloudFunction(query, top_k, alpha);
        console.log('Received clip IDs:', clipIds);

        if (!clipIds || clipIds.length === 0) {
            throw new Error('No clip IDs received from Cloud Function.');
        }

        console.log('Fetching clips from Firestore');
        const clips = await fetchClipsFromFirestore(clipIds);
        console.log('Fetched clips:', clips.length);

        return NextResponse.json(clips);
    } catch (error) {
        console.error('Error in search API:', error);

        if (error instanceof CloudFunctionError) {
            return NextResponse.json({ error: 'Cloud Function execution failed.' }, { status: 500 });
        } else if (error instanceof FirebaseError) {
            return NextResponse.json({ error: 'Firestore query failed.' }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
        }
    }
}