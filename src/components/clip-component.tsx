'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, ChevronDown, Share, Download, Heart } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Digest } from '@/types/digest';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function ClipComponent({ clipId }: { clipId: string }) {
    const [clip, setClip] = useState<Digest | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const userId = searchParams.get('userId')

    const [isPlaying, setIsPlaying] = useState(false)
    const [showFullTranscript, setShowFullTranscript] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)

    const [isLiked, setIsLiked] = useState(false)
    const { toast } = useToast()

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const currentTimeRef = useRef(0)
    const durationRef = useRef(0)
    const [, forceUpdate] = useState({})

    const fetchClip = useCallback(async () => {
        try {
            const url = `/api/clip/${clipId}${userId ? `?userId=${userId}` : ''}`
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Failed to fetch clip')
            }
            const data = await response.json()
            setClip(data)
        } catch (err) {
            setError('Error fetching clip')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [clipId, userId])

    useEffect(() => {
        fetchClip()
    }, [fetchClip])

    useEffect(() => {
        if (!clip) return;

        if (!audioRef.current) {
            audioRef.current = new Audio(clip.firebaseAudioTokenUrl);
            audioRef.current.addEventListener('loadedmetadata', () => {
                if (audioRef.current) {
                    durationRef.current = audioRef.current.duration;
                    forceUpdate({});
                }
            });
            audioRef.current.addEventListener('timeupdate', () => {
                if (audioRef.current) {
                    currentTimeRef.current = audioRef.current.currentTime;
                    forceUpdate({});
                }
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current = null;
            }
        };
    }, [clip]);

    const togglePlay = useCallback(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    const handleSliderChange = useCallback((value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            currentTimeRef.current = value[0];
            forceUpdate({});
        }
    }, []);

    const handlePlaybackSpeedChange = useCallback((value: string) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = Number(value);
            setPlaybackSpeed(Number(value));
        }
    }, []);

    const toggleTranscript = () => setShowFullTranscript(!showFullTranscript)

    const toggleLike = () => {
        setIsLiked(!isLiked)
        toast({
            title: isLiked ? "New feature coming soon" : "New feature coming soon",
            // title: isLiked ? "Removed from favorites" : "Added to favorites",
            description: isLiked ? "This clip has been removed from your favorites." : "This clip has been added to your favorites.",
        })
    }

    const shareClip = () => {
        const clipUrl = `https://ollo.audio/clip/${clip?.clipId}`
        navigator.clipboard.writeText(clipUrl).then(() => {
            toast({
                title: "Link copied",
                description: "The clip link has been copied to your clipboard.",
            })
        }).catch(() => {
            toast({
                title: "Failed to copy link",
                description: "An error occurred while trying to copy the link.",
                variant: "destructive",
            })
        })
    }

    // Format the indexed_timestamp
    const formattedTimestamp = clip?.indexed_timestamp
        ? formatDistanceToNow(new Date(clip.indexed_timestamp), { addSuffix: true })
        : 'Unknown date';

    if (loading) return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-lg font-semibold text-gray-600">Loading...</div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-64 bg-red-100 rounded-lg">
            <div className="text-lg font-semibold text-red-600">Error: {error}</div>
        </div>
    );

    if (!clip) return (
        <div className="flex items-center justify-center h-64 bg-yellow-100 rounded-lg">
            <div className="text-lg font-semibold text-yellow-600">No clip found</div>
        </div>
    );

    const backgroundGradient = `linear-gradient(to bottom right, ${clip.podcastShowThumbnailColors[2]}, ${clip.podcastShowThumbnailColors[3]})`;

    // Extract the text from the transcript, removing the start time and other metadata
    const formattedTranscript = clip.clipTranscript
        .split('\n')
        .filter(line => line.startsWith('Text: '))
        .map(line => line.replace('Text: ', '').trim())
        // Add a new line after each segment
        .join('\n');

    return (
        <div className="min-h-screen flex flex-col" style={{ background: backgroundGradient }}>
            <Toaster />
            {/* Media player bar */}
            <div className="sticky top-0 z-10 bg-card/70 bg-background/95 dark:bg-background/95 backdrop-blur-md shadow-md p-4">
                <div className="flex flex-col space-y-4 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={togglePlay}>
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                            </Button>
                            <Select value={playbackSpeed.toString()} onValueChange={handlePlaybackSpeedChange}>
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue placeholder="Speed" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.5">0.5x</SelectItem>
                                    <SelectItem value="1">1x</SelectItem>
                                    <SelectItem value="1.5">1.5x</SelectItem>
                                    <SelectItem value="2">2x</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={toggleLike}>
                                <Heart className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={shareClip}>
                                <Share className="h-6 w-6" />
                            </Button>
                            <Button variant="secondary" className="hidden sm:flex items-center" asChild>
                                <a href="https://testflight.apple.com/join/zpuFDsrw" target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download OllO
                                </a>
                            </Button>
                            <Button variant="ghost" className="md:hidden">
                                <a href="https://testflight.apple.com/join/zpuFDsrw" target="_blank" rel="noopener noreferrer">
                                    Download OllO
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{formatTime(currentTimeRef.current)}</span>
                            <span className="text-sm font-medium">{formatTime(durationRef.current)}</span>
                        </div>
                        <Slider
                            value={[currentTimeRef.current]}
                            max={durationRef.current}
                            step={0.1}
                            className="w-full"
                            onValueChange={handleSliderChange}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-grow p-4 md:p-8">
                <div className="bg-card/95 dark:bg-background/95 rounded-lg shadow-lg p-4 md:p-6 max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center mb-6 space-y-4 lg:space-y-0 lg:space-x-6">
                        <div className="w-full lg:w-1/3 flex items-center justify-center">
                            <Image
                                src={clip.podcastShowThumbnailFirebaseUrl}
                                alt={clip.podcastShowTitle}
                                width={240}
                                height={240}
                                className="rounded-lg shadow-md"
                            />
                        </div>
                        <div className="flex-grow w-full lg:w-2/3">
                            <h1 className="text-4xl font-bold mb-2">{clip.clipTitle}</h1>
                            <p className="text-xl text-gray-600 mb-2">{clip.episodeTitle} - {clip.podcastShowTitle}</p>
                            <p className="text-sm text-gray-500">Clip created {formattedTimestamp}</p>
                            <div className="mt-4">
                                <h2 className="text-2xl font-semibold mb-2">Summary</h2>
                                <p className="text-gray-700">{clip.clipSummary}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Transcript</h2>
                        <div className="text-gray-700">
                            {showFullTranscript ? (
                                <p style={{ whiteSpace: 'pre-wrap' }}>{formattedTranscript}</p>
                            ) : (
                                <p>{formattedTranscript.split(' ').slice(0, 50).join(' ')}...</p>
                            )}
                            <Button
                                variant="link"
                                onClick={toggleTranscript}
                                className="mt-2 p-0 h-auto font-semibold"
                            >
                                {showFullTranscript ? 'Show Less' : 'Show Full Transcript'}
                                <ChevronDown className={`ml-1 h-4 w-4 transform ${showFullTranscript ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}