'use client'

import { useState } from 'react'
import { fetchClips } from '../utils/fetchClips'
import { Digest } from '../types/digest'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Digest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const clips = await fetchClips(searchQuery)
      setResults(clips)
    } catch (err) {
      setError(err instanceof Error ? `Error: ${err.message}` : 'An unknown error occurred')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Podcast Clip Search</h1>
        <form onSubmit={handleSearch} className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Search for podcast clips..."
          />
          <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {results.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Search Results</h2>
            {results.map((clip) => (
              <div key={clip.clipId} className="mb-4 p-4 border border-gray-200 rounded">
                <h3 className="font-bold">{clip.clipTitle}</h3>
                <p className="text-sm text-gray-600">{clip.podcastShowTitle}</p>
                <p className="mt-2">{clip.clipSummary}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
