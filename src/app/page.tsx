'use client'

import Image from 'next/image';
import { Button } from "@/components/ui/button";


export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center mt-8">
        <Image src="/appIcon.png" alt="Logo" width={200} height={200} />
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button asChild>
            <a href="/search">
              Search Clips
            </a>
          </Button>
          <Button asChild>
            <a href="/podcast-shows">
              Search Shows
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/render-video">
              Generate Video
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
