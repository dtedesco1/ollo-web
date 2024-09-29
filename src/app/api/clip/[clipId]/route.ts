import { NextResponse } from 'next/server';
import { FirebaseError } from 'firebase/app';
import { getClipById } from '@/utils/clipUtils';

export async function GET(
    request: Request,
    { params }: { params: { clipId: string } }
) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const clipId = params.clipId;

    // If no userId is provided, log a warning for now and continue
    if (!userId) {
        console.warn('No userId provided. Continuing without user context.');
    }

    try {
        console.log('Fetching clip from Firestore');
        const clip = await getClipById(clipId);
        console.log('Fetched clip:', clip);

        if (!clip) {
            return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
        }

        return NextResponse.json(clip);
    } catch (error) {
        console.error('Error in clip API:', error);

        if (error instanceof FirebaseError) {
            return NextResponse.json({ error: 'Firestore query failed.' }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
        }
    }
}