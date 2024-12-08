'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Digest } from "@/types/digest"
import { fetchPodcastShowClips } from "@/utils/fetchPodcastShowClips"
import Link from "next/link"
import { formatDistanceToNow } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'

export function PodcastShowSearchComponent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get('q') || ""
    
    const [searchTerm, setSearchTerm] = useState(initialQuery)
    const [results, setResults] = useState<Digest[]>([])
    const [currentlyPlaying, setCurrentlyPlaying] = useState<Digest | null>(null)
    const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    // Initialize audio element
    useEffect(() => {
        setAudioElement(new Audio())
    }, [])

    // Set up audio event listeners
    useEffect(() => {
        if (audioElement) {
            const updateProgress = () => {
                setCurrentPlaybackPosition(audioElement.currentTime)
            }
            audioElement.addEventListener('timeupdate', updateProgress)
            audioElement.addEventListener('loadedmetadata', () => {
                setDuration(audioElement.duration)
            })
            return () => {
                audioElement.removeEventListener('timeupdate', updateProgress)
                audioElement.removeEventListener('loadedmetadata', () => { })
            }
        }
    }, [audioElement])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            // Update URL with search query
            router.push(`/podcast-shows?q=${encodeURIComponent(searchTerm)}`)
            const clips = await fetchPodcastShowClips(searchTerm)
            setResults(clips)
        } catch (err) {
            setError(err instanceof Error ? `Error: ${err.message}` : 'An unknown error occurred')
            console.error('Search error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    // Initial search if query is in URL
    useEffect(() => {
        if (initialQuery) {
            handleSearch(new Event('submit') as any)
        }
    }, [])

    // Group results by episode
    const groupedResults = results.reduce((groups, clip) => {
        const episodeId = clip.episodeId
        if (!groups[episodeId]) {
            groups[episodeId] = {
                episodeTitle: clip.episodeTitle,
                podcastShowTitle: clip.podcastShowTitle,
                podcastShowThumbnailFirebaseUrl: clip.podcastShowThumbnailFirebaseUrl,
                clips: []
            }
        }
        groups[episodeId].clips.push(clip)
        return groups
    }, {} as Record<string, { 
        episodeTitle: string, 
        podcastShowTitle: string, 
        podcastShowThumbnailFirebaseUrl: string | undefined,
        clips: Digest[] 
    }>)

    const handlePlay = (clip: Digest) => {
        if (audioElement) {
            if (currentlyPlaying?.clipId !== clip.clipId) {
                audioElement.src = clip.firebaseAudioTokenUrl
                audioElement.load()
            }
            audioElement.play()
            setCurrentlyPlaying(clip)
            setIsPlaying(true)
        }
    }

    const handlePause = () => {
        if (audioElement) {
            audioElement.pause()
            setIsPlaying(false)
        }
    }

    const togglePlayPause = () => {
        if (audioElement) {
            if (isPlaying) {
                handlePause()
            } else {
                audioElement.play()
                setIsPlaying(true)
            }
        }
    }

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPosition = Number(e.target.value)
        setCurrentPlaybackPosition(newPosition)
        if (audioElement) {
            audioElement.currentTime = newPosition
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-4 pb-28">
            <form onSubmit={handleSearch} className="mb-6">
                <Input
                    type="search"
                    placeholder="Search podcast shows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow rounded-md px-4 py-2 bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </form>

            {isLoading && (
                <div className="text-center py-4">Loading...</div>
            )}

            {error && (
                <div className="text-red-500 py-4">{error}</div>
            )}

            <div className="space-y-8">
                {Object.entries(groupedResults).map(([episodeId, group]) => (
                    <div key={episodeId} className="bg-card rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            {group.podcastShowThumbnailFirebaseUrl && (
                                <img
                                    src={group.podcastShowThumbnailFirebaseUrl}
                                    alt={group.podcastShowTitle}
                                    className="w-16 h-16 rounded-md object-cover"
                                />
                            )}
                            <div>
                                <h3 className="text-lg font-semibold">{group.podcastShowTitle}</h3>
                                <p className="text-sm text-muted-foreground">{group.episodeTitle}</p>
                            </div>
                        </div>
                        <div className="space-y-4 ml-20">
                            {group.clips.map((clip) => (
                                <div key={clip.clipId} className="border-l-2 border-muted pl-4">
                                    <Link 
                                        href={`/clip/${clip.clipId}`}
                                        className="block text-primary hover:underline"
                                    >
                                        {clip.clipTitle}
                                    </Link>
                                    {clip.clipSummary && (
                                        <p className="mt-2 text-sm text-muted-foreground">{clip.clipSummary}</p>
                                    )}
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        {clip.indexed_timestamp && (
                                            <span>Transcribed {formatDistanceToNow(new Date(clip.indexed_timestamp), { addSuffix: true })}</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => currentlyPlaying?.clipId === clip.clipId ? togglePlayPause() : handlePlay(clip)}
                                        >
                                            {currentlyPlaying?.clipId === clip.clipId && isPlaying ? 'Pause' : 'Play'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
