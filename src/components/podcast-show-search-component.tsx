'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Digest } from "@/types/digest"
import { fetchPodcastShowClips } from "@/utils/fetchPodcastShowClips"

export function PodcastShowSearchComponent() {
    const [searchTerm, setSearchTerm] = useState("")
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
            const clips = await fetchPodcastShowClips(searchTerm)
            setResults(clips)
        } catch (err) {
            setError(err instanceof Error ? `Error: ${err.message}` : 'An unknown error occurred')
            console.error('Search error:', err)
        } finally {
            setIsLoading(false)
        }
    }

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

            <div className="space-y-4">
                {results.map((clip) => (
                    <div
                        key={clip.clipId}
                        className="bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            {clip.podcastShowThumbnailFirebaseUrl && (
                                <img
                                    src={clip.podcastShowThumbnailFirebaseUrl}
                                    alt={clip.podcastShowTitle}
                                    className="w-16 h-16 rounded-md object-cover"
                                />
                            )}
                            <div className="flex-grow">
                                <h3 className="text-lg font-semibold">{clip.podcastShowTitle}</h3>
                                <p className="text-sm text-muted-foreground">{clip.episodeTitle}</p>
                                <p className="mt-2">{clip.clipTitle}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => currentlyPlaying?.clipId === clip.clipId ? togglePlayPause() : handlePlay(clip)}
                                    >
                                        {currentlyPlaying?.clipId === clip.clipId && isPlaying ? 'Pause' : 'Play'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
