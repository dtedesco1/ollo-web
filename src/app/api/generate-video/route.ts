import { NextRequest, NextResponse } from 'next/server';
import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import '../../../utils/firebase-admin'; // Initialize Firebase Admin

const CLOUD_RUN_URL = 'https://video-generator-58271045053.us-central1.run.app';

export async function POST(request: NextRequest) {
    try {
        const app = getApp();
        const auth = getAuth(app);
        const token = await auth.createCustomToken('video-service');

        const formData = await request.formData();
        
        const response = await fetch(`${CLOUD_RUN_URL}?token=${token}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to generate video');
        }

        const videoBuffer = await response.arrayBuffer();

        return new NextResponse(videoBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': 'attachment; filename="generated-video.mp4"'
            }
        });
    } catch (error: any) {
        console.error('Error generating video:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
