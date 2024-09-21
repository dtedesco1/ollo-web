import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const headers = new Headers(response.headers);
        headers.set('Content-Disposition', `attachment; filename="audio.mp3"`);

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers: headers,
        });
    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Failed to download file', { status: 500 });
    }
}