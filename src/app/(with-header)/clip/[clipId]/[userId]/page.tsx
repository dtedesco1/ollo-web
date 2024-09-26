import { fetchClipsFromFirestore } from '@/utils/clipUtils';
import Image from 'next/image';

interface ClipPageProps {
    params: {
        clipId: string;
        userId: string;
    };
}

export default async function ClipPage({ params }: ClipPageProps) {
    const { clipId } = params;

    console.log('ClipPage: Attempting to fetch clip with ID:', clipId);

    try {
        console.log('ClipPage: Calling fetchClipsFromFirestore');
        const clips = await fetchClipsFromFirestore([clipId]);
        console.log('ClipPage: Received clips:', clips);

        const clipData = clips.length > 0 ? clips[0] : null;
        console.log('ClipPage: Extracted clipData:', clipData);

        if (!clipData) {
            console.log('ClipPage: Clip not found');
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-xl">Clip not found</p>
                </div>
            );
        }

        console.log('ClipPage: Rendering clip data');
        return (
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-4">{clipData.clipTitle}</h1>
                <p className="text-lg mb-6">{clipData.clipSummary}</p>
                <Image
                    src={clipData.podcastShowThumbnailFirebaseUrl || '/placeholder.svg'}
                    alt={clipData.podcastShowTitle}
                    width={400}
                    height={400}
                    className="rounded-lg mb-6"
                />
                <audio controls src={clipData.firebaseAudioTokenUrl} className="w-full">
                    Your browser does not support the audio element.
                </audio>
                {/* Display additional metadata as needed */}
            </div>
        );
    } catch (error) {
        console.error('ClipPage: Error fetching clip data:', error);
        if (error instanceof Error) {
            console.error('ClipPage: Error message:', error.message);
            console.error('ClipPage: Error stack:', error.stack);
        }
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Error loading clip</p>
            </div>
        );
    }
}