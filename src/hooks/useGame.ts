import { useState, useCallback, useMemo } from 'react'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { GameStatus } from '@/types/game-status'
import { PieceData } from '@/types/piece-data'
import { ChessPosition } from '@/types/chess-position'
import { getGameStatusFromFen, STANDARD_START_FEN } from '@/utils/fenUtils'

export type MoveResult = {
    valid: boolean
    from?: string
    to?: string
    fen?: string
    uci?: string
}

export type GameActions = {
    movePiece: (
        selectedPiece: PieceData,
        position: ChessPosition,
        promotion?: 'q' | 'r' | 'b' | 'n'
    ) => MoveResult
    startGame: () => void
    reset: () => void
    makeBotMove: () => void
    syncFromFen: (fen: string) => void
    forceActive: () => void
}

export function useGame() {
    // FIX 1: Store the FEN string as the single source of truth, not the mutable class object
    const [fen, setFen] = useState<string>(STANDARD_START_FEN)
    const [status, setStatus] = useState<GameStatus>(() =>
        getGameStatusFromFen(STANDARD_START_FEN)
    )
    const [lastMove, setLastMove] = useState<{from: {file: string; rank: number}, to: {file: string; rank: number}} | undefined>()

    const syncFromFen = useCallback((targetFen: string) => {
        console.log('🔄 syncFromFen called with FEN:', targetFen?.substring(0, 50))
        if (!targetFen) {
            console.error('No FEN provided to syncFromFen')
            return
        }
        
        try {
            // Validate via modern constructor pattern
            const nextChess = new Chess(targetFen)
            const currentFen = nextChess.fen()
            
            setFen(currentFen)
            const newStatus = getGameStatusFromFen(currentFen)
            setStatus(newStatus)
            setLastMove(undefined)
            console.log('✅ syncFromFen completed')
        } catch (err) {
            console.error('❌ Invalid FEN received:', targetFen, err)
        }
    }, [])

    const forceActive = useCallback(() => {
        setStatus(prev => {
            if (prev.situation === 'active' || prev.situation === 'check') return prev
            return { ...prev, situation: 'active' }
        })
    }, [])

    const movePiece = useCallback(
        (
            selectedPiece: PieceData,
            position: ChessPosition,
            promotion: 'q' | 'r' | 'b' | 'n' = 'q'
        ): MoveResult => {
            console.log('🎯 movePiece called:', { selectedPiece, position, promotion })
            
            try {
                const from = `${selectedPiece.file.toLowerCase()}${selectedPiece.rank}` as Square
                const to = `${position.file.toLowerCase()}${position.rank}` as Square

                // Initialize safely via active FEN string state
                const nextChess = new Chess(fen)
                const pieceBefore = nextChess.get(from)
                
                if (!pieceBefore) {
                    console.log('❌ No piece at source square')
                    return { valid: false }
                }
                
                const needsPromotion =
                    pieceBefore.type === 'p' &&
                    ((pieceBefore.color === 'w' && to[1] === '8') ||
                        (pieceBefore.color === 'b' && to[1] === '1'))

                const move = nextChess.move({
                    from,
                    to,
                    ...(needsPromotion ? { promotion } : {}),
                })

                if (!move) {
                    console.log('❌ Invalid move in chess.js')
                    return { valid: false }
                }

                const nextFen = nextChess.fen()
                const uci = `${move.from}${move.to}${move.promotion ?? ''}`

                console.log('✅ Local move executed:', { from, to, uci })

                // Atomic state updates
                setFen(nextFen)
                
                const moveData = {
                    from: { file: move.from[0].toUpperCase(), rank: parseInt(move.from[1]) },
                    to: { file: move.to[0].toUpperCase(), rank: parseInt(move.to[1]) }
                }
                
                setLastMove(moveData)
                
                const newStatus = getGameStatusFromFen(nextFen)
                setStatus({
                    ...newStatus,
                    lastMove: moveData
                })

                return { valid: true, from, to, fen: nextFen, uci }
            } catch (err) {
                console.error('Move error:', err)
                return { valid: false }
            }
        },
        [fen] // Depend cleanly on the string, not a class identity instance
    )

    const reset = useCallback(() => {
        console.log('🔄 Resetting game')
        setFen(STANDARD_START_FEN)
        setStatus(getGameStatusFromFen(STANDARD_START_FEN))
        setLastMove(undefined)
    }, [])

    const startGame = useCallback(() => {
        console.log('🎮 Starting new local game')
        setFen(STANDARD_START_FEN)
        const newStatus = getGameStatusFromFen(STANDARD_START_FEN)
        setStatus({
            ...newStatus,
            situation: 'active'
        })
        setLastMove(undefined)
    }, [])

    const makeBotMove = useCallback(() => {
        console.log('🤖 Making bot move')
        try {
            const nextChess = new Chess(fen)
            const moves = nextChess.moves({ verbose: true })

            if (moves.length > 0) {
                const randomMove = moves[Math.floor(Math.random() * moves.length)]
                nextChess.move(randomMove)
                
                const nextFen = nextChess.fen()
                setFen(nextFen)
                setStatus(getGameStatusFromFen(nextFen))
                console.log('🤖 Bot moved:', randomMove.from, 'to', randomMove.to)
            } else {
                console.log('🤖 No moves available for bot')
            }
        } catch (err) {
            console.error('Bot move failed:', err)
        }
    }, [fen])

    const gameActions = useMemo(
        () => ({
            movePiece,
            reset,
            startGame,
            makeBotMove,
            syncFromFen,
            forceActive,
        }),
        [movePiece, reset, startGame, makeBotMove, syncFromFen, forceActive]
    )

    return [status, gameActions] as const
}
