// experience/Experience.tsx
import { Html, OrbitControls } from '@react-three/drei'
import { Lights } from './Lights'
import { GameBoard } from './meshes/board/GameBoard'
import { Game } from './meshes/Game'
import { pieceUtils } from '../utils/pieceUtils'
import { ChessPosition } from '../types/chess-position'
import { GameStatus } from '../types/game-status'
import { PieceData } from '../types/piece-data'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Moves } from '../types/moves'
import { GameActions } from '../hooks/useGame'
import type { PromotionPiece } from '../hooks/useMoveHandler'

type ExperienceProps = {
    game: GameStatus
    gameActions: GameActions
    onMove: (
        selectedPiece: PieceData,
        position: ChessPosition,
        promotion?: PromotionPiece
    ) => void
    myColor?: 'white' | 'black' | 'spectator'
    isSpectator?: boolean
}

function isPawnPromotionMove(piece: PieceData, to: ChessPosition): boolean {
    if (piece.type !== 'pawn') return false
    if (piece.rival === 'white' && to.rank === 8) return true
    if (piece.rival === 'black' && to.rank === 1) return true
    return false
}

export function Experience({ 
    game, 
    gameActions, 
    onMove, 
    myColor = 'white', 
    isSpectator = false 
}: ExperienceProps) {
    const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null)
    const [promotionPick, setPromotionPick] = useState<{
        piece: PieceData
        position: ChessPosition
    } | null>(null)

    // Memoize moves - only calculate if not spectator and piece is selected
    const moves: Moves | undefined = useMemo(() => {
        if (isSpectator) return undefined
        if (!selectedPiece) return undefined
        return pieceUtils.getMoves(selectedPiece, game)
    }, [selectedPiece, game, isSpectator])

    // Reset selection when game changes (e.g., new turn)
    useEffect(() => {
        setSelectedPiece(null)
        setPromotionPick(null)
    }, [game.fen, game.turn]) // Reset when FEN or turn changes

    const toggleSelectedPiece = useCallback((pieceData: PieceData) => {
        // Spectators cannot select pieces
        if (isSpectator) return
        
        // Only allow selecting your own pieces
        if (myColor !== 'spectator' && pieceData.rival !== myColor) {
            // Optional: Add a visual feedback that you can't select opponent's pieces
            return
        }
        
        if (
            selectedPiece &&
            selectedPiece.file === pieceData.file &&
            selectedPiece.rank === pieceData.rank
        ) {
            setSelectedPiece(null)
        } else {
            setSelectedPiece(pieceData)
        }
    }, [selectedPiece, isSpectator, myColor])

    const confirmPromotion = useCallback(
        (choice: PromotionPiece) => {
            if (!promotionPick || isSpectator) return
            onMove(promotionPick.piece, promotionPick.position, choice)
            setPromotionPick(null)
            setSelectedPiece(null)
        },
        [promotionPick, onMove, isSpectator]
    )

    const cancelPromotion = useCallback(() => {
        setPromotionPick(null)
    }, [])

    const movePiece = useCallback(
        (position: ChessPosition) => {
            if (!selectedPiece || isSpectator) return
            
            // Additional check: make sure it's your turn
            const isMyTurn = (myColor !== 'spectator' && game.turn === myColor)
            if (!isMyTurn) {
                // Optional: Add visual feedback that it's not your turn
                return
            }
            
            if (isPawnPromotionMove(selectedPiece, position)) {
                setPromotionPick({ piece: selectedPiece, position })
                return
            }
            onMove(selectedPiece, position)
            setSelectedPiece(null)
        },
        [selectedPiece, onMove, isSpectator, myColor, game.turn]
    )

    return (
        <>
            <OrbitControls
                enablePan={!isSpectator} // Allow spectators to pan freely
                enableZoom={true}
                maxPolarAngle={Math.PI / 2}
                enableDamping={false}
            />
            <Lights />
            
            <GameBoard 
                movePiece={movePiece} 
                moves={moves} 
                lastMove={game.lastMove} 
                isSpectator={isSpectator} 
            />
            
            <Game
                selectedPiece={selectedPiece}
                status={game}
                onPieceClick={toggleSelectedPiece}
                isSpectator={isSpectator}
            />
            
            {/* Promotion modal - only for non-spectators */}
            {promotionPick && !isSpectator && (
                <Html position={[0, 3.4, 0]} center zIndexRange={[200, 0]}>
                    <div
                        style={{
                            background: 'rgba(15,15,20,0.92)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff',
                            padding: '10px 12px',
                            borderRadius: 10,
                            minWidth: 200,
                            fontFamily: 'system-ui, sans-serif',
                            fontSize: 13,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Promote pawn</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {(
                                [
                                    ['q', '♕ Queen'],
                                    ['r', '♖ Rook'],
                                    ['b', '♗ Bishop'],
                                    ['n', '♘ Knight'],
                                ] as const
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => confirmPromotion(key)}
                                    style={{
                                        flex: 1,
                                        minWidth: 72,
                                        padding: '8px 6px',
                                        borderRadius: 6,
                                        border: '1px solid #444',
                                        background: '#2a2a33',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: 12,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#3a3a44'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#2a2a33'
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={cancelPromotion}
                            style={{
                                marginTop: 8,
                                width: '100%',
                                padding: 6,
                                borderRadius: 6,
                                border: 'none',
                                background: 'transparent',
                                color: '#aaa',
                                cursor: 'pointer',
                                fontSize: 11,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#fff'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#aaa'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </Html>
            )}
            
            {/* Spectator indicator in 3D view */}
            {isSpectator && (
                <Html position={[0, 4.5, 0]} center>
                    <div
                        style={{
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(8px)',
                            color: '#ffd700',
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            border: '1px solid rgba(255,215,0,0.3)',
                            pointerEvents: 'none',
                        }}
                    >
                        <span>👁️</span>
                        <span>SPECTATING</span>
                    </div>
                </Html>
            )}
        </>
    )
}
