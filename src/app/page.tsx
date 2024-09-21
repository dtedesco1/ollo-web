'use client'

import { SearchComponent } from '@/components/search-component'

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <SearchComponent />
      </main>
    </div>
  )
}
