import { NextResponse } from 'next/server';
import { Digest } from '@/types/digest';

const CLOUD_FUNCTION_URL = "https://us-central1-ai-app-mvp-project.cloudfunctions.net/search";

async function fetchClipIdsFromCloudFunction(query: string, top_k: string, alpha: string): Promise<string[]> {
    const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k, alpha })
    });

    if (!response.ok) {
        throw new Error(`Cloud Function Error: ${response.status}`);
    }

    const clipIds = await response.json();
    if (!Array.isArray(clipIds)) {
        throw new Error('Invalid response from Cloud Function');
    }

    return clipIds;
}

async function fetchClipsFromFirestore(clipIds: string[]): Promise<Digest[]> {
    const { db } = await import('@/utils/firebase-admin');
    const clipsRef = db.collection('clips_dev_0612');
    const clipPromises = clipIds.map(id => clipsRef.doc(id).get());
    const clipDocs = await Promise.all(clipPromises);

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
}

export async function POST(request: Request) {
    try {
        const { query, top_k = "10", alpha = "0.6" } = await request.json();

        console.log('Fetching clip IDs from Cloud Function');
        const clipIds = await fetchClipIdsFromCloudFunction(query, top_k, alpha);
        console.log('Received clip IDs:', clipIds);

        console.log('Fetching clips from Firestore');
        const clips = await fetchClipsFromFirestore(clipIds);
        console.log('Fetched clips:', clips.length);

        return NextResponse.json(clips);
    } catch (error) {
        console.error('Error in search API:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}