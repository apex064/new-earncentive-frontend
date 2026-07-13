// CapturedPieces.tsx
import React from 'react'
import { PieceStatus } from '../types/piece-status'
import { 
  ChessKing, 
  ChessQueen, 
  ChessRook, 
  ChessBishop, 
  ChessKnight, 
  ChessPawn 
} from 'lucide-react'

type CapturedPiecesProps = {
    pieces: PieceStatus[]
    rival: 'white' | 'black'
    title: string
}

// Map piece types to Lucide components
const pieceIcons = {
    king: ChessKing,
    queen: ChessQueen,
    bishop: ChessBishop,
    knight: ChessKnight,
    rook: ChessRook,
    pawn: ChessPawn,
}

// Color mapping for pieces based on who captured them
const getPieceColor = (rival: 'white' | 'black') => {
    return rival === 'white' ? '#ef4444' : '#22c55e' // Red for captured white pieces, green for captured black pieces
}

export function CapturedPieces({ pieces, rival, title }: CapturedPiecesProps) {
    if (pieces.length === 0) return null

    // Group pieces by type
    const groupedPieces = pieces.reduce((acc, piece) => {
        acc[piece.type] = (acc[piece.type] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="captured-pieces">
            <h4>{title}</h4>
            <div className="pieces-list">
                {Object.entries(groupedPieces).map(([pieceType, count]) => {
                    const IconComponent = pieceIcons[pieceType as keyof typeof pieceIcons]
                    const pieceColor = getPieceColor(rival)
                    
                    return (
                        <div key={pieceType} className="captured-piece-item">
                            <IconComponent 
                                size={20} 
                                color={pieceColor}
                                strokeWidth={1.5}
                                style={{
                                    filter: `drop-shadow(0 0 4px ${pieceColor}80)`
                                }}
                            />
                            {count > 1 && <span className="piece-count">×{count}</span>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
