// app/chess/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '3D Chess Game | Earncentive',
    description: 'Play 3D chess against AI or real opponents and earn rewards',
}

export default function ChessLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" style={{ height: '100%', margin: 0, padding: 0 }}>
            <body style={{ 
                height: '100%', 
                margin: 0, 
                padding: 0, 
                overflow: 'hidden',
                background: '#1a1a1a'
            }}>
                {/* Remove all site wrappers - just the chess game */}
                {children}
            </body>
        </html>
    )
}
