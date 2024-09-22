import { NextResponse } from 'next/server';
import { Digest } from '@/types/digest';
import { FirebaseError } from 'firebase/app';

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

async function fetchClipsFromFirestore(clipIds: string[]): Promise<Digest[]> {
    try {
        console.log('Initializing Firebase Admin SDK');
        const { db } = await import('@/utils/firebase-admin');
        console.log('Firebase Admin SDK initialized successfully');

        const clipsRef = db.collection('clips_dev_0612');
        console.log('Firestore collection reference created');

        const clipPromises = clipIds.map(async (id) => {
            try {
                console.log(`Fetching document with ID: ${id}`);
                const doc = await clipsRef.doc(id).get();
                console.log(`Document fetched successfully: ${id}`);
                return doc;
            } catch (error) {
                console.error(`Error fetching document with ID: ${id}`, error);
                throw error;
            }
        });

        console.log('Waiting for all document fetch promises to resolve');
        const clipDocs = await Promise.all(clipPromises);
        console.log('All documents fetched successfully');

        return clipDocs
            .filter(doc => doc.exists)
            .map(doc => {
                const data = doc.data();
                return {
                    clipId: doc.id,
                    clipSummary: data?.clipSummary,
                    clipTitle: data?.clipTitle,
                    clipTranscript: data?.clipTranscript,
                    episodeAudioGsUrl: data?.episodeAudioGsUrl,
                    episodeId: data?.episodeId,
                    episodeTitle: data?.episodeTitle,
                    episodeStartIndex: data?.episodeStartIndex,
                    firebaseAudioStoragePath: data?.firebaseAudioStoragePath,
                    firebaseAudioTokenUrl: data?.firebaseAudioTokenUrl,
                    indexed: data?.indexed,
                    podcastShowThumbnailColors: data?.podcastShowThumbnailColors,
                    podcastShowThumbnailFirebaseUrl: data?.podcastShowThumbnailFirebaseUrl,
                    podcastShowTitle: data?.podcastShowTitle,
                    podcastShowId: data?.podcastShowId,
                    indexed_timestamp: data?.productionDetails?.clipProductionDetails?.clipping_timestamp?.toDate?.()?.toISOString(),
                };
            });
    } catch (error) {
        console.error('Error in fetchClipsFromFirestore:', error);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        console.error('Clip IDs:', clipIds);
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const { query, top_k = "10", alpha = "0.6" } = await request.json();

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