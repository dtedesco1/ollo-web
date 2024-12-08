import { NextResponse } from 'next/server';
import { FirebaseError } from 'firebase/app';
import { fetchClipsFromFirestore } from '@/utils/clipUtils';
import { db } from '@/utils/firebase-admin';

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Query the podcast_shows_index collection for matching show titles
        const showsRef = db.collection('podcast_shows_index');
        const showsSnapshot = await showsRef
            .where('title', '>=', query)
            .where('title', '<=', query + '\uf8ff')
            .get();

        if (showsSnapshot.empty) {
            return NextResponse.json([]);
        }

        // Get all episode subcollections and their clips
        const clipIds: string[] = [];
        for (const showDoc of showsSnapshot.docs) {
            const episodesRef = showDoc.ref.collection('episodes');
            const episodesSnapshot = await episodesRef.get();

            for (const episodeDoc of episodesSnapshot.docs) {
                const episodeData = episodeDoc.data();
                if (episodeData.clips && Array.isArray(episodeData.clips)) {
                    clipIds.push(...episodeData.clips);
                }
            }
        }

        if (clipIds.length === 0) {
            return NextResponse.json([]);
        }

        // Fetch the actual clip data
        const clips = await fetchClipsFromFirestore(clipIds);

        return NextResponse.json(clips);
    } catch (error) {
        console.error('Error in podcast show search API:', error);

        if (error instanceof FirebaseError) {
            return NextResponse.json({ error: 'Firestore query failed.' }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
        }
    }
}
