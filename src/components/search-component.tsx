/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/L8ztNhgGFZH
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { IBM_Plex_Sans } from 'next/font/google'
import { Tenor_Sans } from 'next/font/google'

ibm_plex_sans({
  subsets: ['latin'],
  display: 'swap',
})

tenor_sans({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Digest } from "@/types/digest"
import { fetchClips } from "@/utils/fetchClips"
import { saveAs } from 'file-saver';

export function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Digest[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Digest | null>(null)
  const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    setAudioElement(new Audio())
  }, [])

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
      const clips = await fetchClips(searchTerm)
      setResults(clips)
      setSelectedTags([]) // Reset selected tags on new search
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

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleDownload = async () => {
    if (currentlyPlaying) {
      try {
        const response = await fetch(`/api/download?url=${encodeURIComponent(currentlyPlaying.firebaseAudioTokenUrl)}`);
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        const fileName = `${currentlyPlaying.clipTitle}.mp3`;
        saveAs(blob, fileName);
      } catch (error) {
        console.error('Download error:', error);
        setError('Failed to download the audio file.');
      }
    }
  }

  const uniquePodcastShows = useMemo(() => {
    const shows = new Set(results.map(clip => clip.podcastShowTitle))
    return Array.from(shows)
  }, [results])

  const filteredResults = useMemo(() => {
    return selectedTags.length === 0
      ? results
      : results.filter(clip => selectedTags.includes(clip.podcastShowTitle))
  }, [results, selectedTags])

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 pb-28">

      <form onSubmit={handleSearch} className="mb-6 flex items-center gap-2">
        <Input
          type="search"
          placeholder="Search podcasts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow rounded-md px-4 py-2 bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>
      <div className="mb-6 flex flex-wrap gap-2">
        {uniquePodcastShows.map((show) => (
          <button
            key={show}
            onClick={() => handleTagClick(show)}
            className={`px-4 py-2 text-base font-medium rounded-full transition-colors duration-200 ease-in-out ${selectedTags.includes(show)
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
          >
            {show}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid gap-4">
        {filteredResults.map((clip) => (
          <div
            key={clip.clipId}
            className="flex items-start gap-4 bg-muted rounded-lg p-4 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            onClick={() => handlePlay(clip)}
          >
            <img
              src={clip.podcastShowThumbnailFirebaseUrl || "/placeholder.svg"}
              alt={clip.clipTitle}
              width={80}
              height={80}
              className="rounded-md object-cover"
              style={{ aspectRatio: "1", objectFit: "cover" }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{clip.clipTitle}</h3>
              <p className="text-sm text-muted-foreground">{clip.podcastShowTitle}</p>
              <p className="text-sm mt-2 line-clamp-2">{clip.clipSummary}</p>
            </div>
          </div>
        ))}
      </div>
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 w-full bg-muted p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={currentlyPlaying.podcastShowThumbnailFirebaseUrl || "/placeholder.svg"}
              alt={currentlyPlaying.clipTitle}
              width={50}
              height={50}
              className="rounded-lg object-cover"
              style={{ aspectRatio: "50/50", objectFit: "cover" }}
            />
            <div>
              <h4 className="text-lg font-semibold">{currentlyPlaying.clipTitle}</h4>
              <p className="text-sm text-muted-foreground">{currentlyPlaying.podcastShowTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" onClick={togglePlayPause}>
              {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <DownloadIcon className="w-5 h-5" />
            </Button>
            <div className="w-full">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentPlaybackPosition}
                onChange={handleProgressChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}
