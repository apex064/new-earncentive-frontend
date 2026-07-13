import { usePiecePosition } from '@/hooks/usePiecePosition'
import { ChessFile } from '@/types/chess-file'
import { ChessPosition } from '@/types/chess-position'
import { ChessRank } from '@/types/chess-rank'
import { useMemo } from 'react'
import * as THREE from 'three'

type SquareCellProps = {
    isAvailableMove?: boolean
    isCaptureMove?: boolean
    isLastMoveFrom?: boolean
    isLastMoveTo?: boolean
    onClick: () => void
} & ChessPosition

export function SquareCell({
    rank,
    file,
    isAvailableMove,
    isCaptureMove,
    isLastMoveFrom,
    isLastMoveTo,
    onClick,
}: SquareCellProps) {
    const { x, z } = usePiecePosition({ rank, file })
    const { color, emissive, emissiveIntensity, metalness, roughness } = useMemo(() => {
        // Priority 1: Capture move - highest priority
        if (isCaptureMove) {
            return {
                color: '#ef4444',        // Red for capture
                emissive: '#7f1d1d',     // Dark red glow
                emissiveIntensity: 0.3,
                metalness: 0.3,
                roughness: 0.4,
            }
        }

        // Priority 2: Available move
        if (isAvailableMove) {
            return {
                color: '#10b981',        // Emerald green
                emissive: '#064e3b',     // Dark green glow
                emissiveIntensity: 0.25,
                metalness: 0.3,
                roughness: 0.4,
            }
        }

        // Priority 3: Last move highlights
        if (isLastMoveFrom || isLastMoveTo) {
            return {
                color: '#0e445a',        // Deep teal/blue
                emissive: '#0891b2',     // Cyan glow
                emissiveIntensity: 0.2,
                metalness: 0.5,
                roughness: 0.3,
            }
        }

        // Priority 4: Regular board squares
        // Standard chess rule: a1 is a dark square. That means a square is
        // dark when file-index and rank have the SAME parity (both even or
        // both odd), not when they differ.
        const isEvenFile = file.charCodeAt(0) % 2 === 0
        const isEvenRank = rank % 2 === 0
        const isDarkSquare = isEvenFile === isEvenRank

        if (isDarkSquare) {
            return {
                color: '#4a18a8',        // Purple (matching your original)
                emissive: '#2e1065',     // Deep purple glow
                emissiveIntensity: 0.08,
                metalness: 0.4,
                roughness: 0.5,
            }
        } else {
            return {
                color: '#f8fafc',        // Slightly off-white (slate 50)
                emissive: '#e2e8f0',     // Very subtle white glow
                emissiveIntensity: 0.05,
                metalness: 0.2,
                roughness: 0.6,
            }
        }
    }, [rank, file, isAvailableMove, isCaptureMove, isLastMoveFrom, isLastMoveTo])

    return (
        <mesh
            rotation-x={-Math.PI * 0.5}
            scale={1}
            position-y={-1}
            position-x={x}
            position-z={z}
            onClick={onClick}
            receiveShadow={true}
            castShadow={true}
        >
            <planeGeometry args={[0.95, 0.95]} /> {/* Slightly smaller for visual gap */}
            <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                metalness={metalness}
                roughness={roughness}
            />
        </mesh>
    )
}
