import Image from 'next/image'
import Link from 'next/link'

export function Header() {
    return (
        <header className="w-full py-4 px-6 bg-background">
            <div className="max-w-6xl mx-auto flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/appIcon.png" alt="OllO Logo" width={60} height={60} />
                    <span className="text-xl font-bold">Web 0.1.0</span>
                </Link>
            </div>
        </header>
    )
}