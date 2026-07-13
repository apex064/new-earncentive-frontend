import { usePiecePosition } from '../hooks/usePiecePosition'
import { ChessFile } from '../types/chess-file'
import { ChessRank } from '../types/chess-rank'
import { useMemo, useState } from 'react'
import { pieceUtils } from '../../utils/pieceUtils'
import { Rival } from '../types/rival'
import { PieceModelProps } from '../types/piece-model-props'
import { King } from './pieces/King'
import { Queen } from './pieces/Queen'
import { Bishop } from './pieces/Bishop'
import { Knight } from './pieces/Knight'
import { Rook } from './pieces/Rook'
import { Pawn } from './pieces/Pawn'
import * as THREE from 'three'
import { PieceStatus } from '../types/piece-status'
import { PieceData } from '../types/piece-data'
import { useAddToY } from '../hooks/useAddToY'

export type PieceProps = {
    onPieceClick: (piece: PieceData) => void
    isSelected: boolean
} & PieceData

export function Piece({
    rank,
    file,
    type: piece,
    rival,
    isMoved,
    id,
    isSelected,
    onPieceClick,
}: PieceProps) {
    const [isHovered, setIsHovered] = useState(false)
    
    const chessPosition = useMemo(() => {
        return {
            rank,
            file,
        }
    }, [rank, file])
    
    const { x, z } = usePiecePosition(chessPosition, true)
    const addToY = useAddToY(isSelected)
    
    const props: PieceModelProps = useMemo(() => {
        const { positionY, scale } = pieceUtils.getPieceStats(piece)
        
        // Special pieces (King and Queen) get extra glow
        const isSpecialPiece = piece === 'king' || piece === 'queen'
        
        // Create premium materials with metallic finish and emissive glow
        const material = rival === 'black' 
            ? new THREE.MeshStandardMaterial({
                color: '#374151',        // Dark gray instead of purple
                metalness: 0.85,         // High metallic shine
                roughness: 0.25,         // Slightly polished
                emissive: '#4c1d95',     // Deep purple glow
                emissiveIntensity: isSelected ? 0.35 : (isHovered ? 0.25 : (isSpecialPiece ? 0.15 : 0.1)),
              })
            : new THREE.MeshStandardMaterial({
                color: '#f3f4f6',        // Light gray/off-white
                metalness: 0.9,          // Very metallic
                roughness: 0.2,          // Smooth finish
                emissive: '#8b5cf6',     // Purple glow
                emissiveIntensity: isSelected ? 0.45 : (isHovered ? 0.35 : (isSpecialPiece ? 0.2 : 0.15)),
              })
        
        return {
            'position-x': x,
            'position-y': positionY + addToY,
            'position-z': z,
            'rotation-y': rival === 'black' ? Math.PI : 0,
            scale,
            material,
            onClick: () => {
                onPieceClick({ rank, file, type: piece, rival, isMoved, id })
            },
            onPointerOver: () => setIsHovered(true),
            onPointerOut: () => setIsHovered(false),
        }
    }, [piece, x, z, rival, rank, file, isMoved, onPieceClick, id, addToY, isSelected, isHovered])

    switch (piece) {
        case 'king':
            return <King {...props} />
        case 'queen':
            return <Queen {...props} />
        case 'bishop':
            return <Bishop {...props} />
        case 'knight':
            return <Knight {...props} />
        case 'rook':
            return <Rook {...props} />
        case 'pawn':
            return <Pawn {...props} />
        default:
            return null
    }
}