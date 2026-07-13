// app/chess/play/[id]/page.tsx

'use client';

import { useState, useEffect, lazy } from 'react'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { useGame } from '../hooks/useGame'
import { useUser } from '../hooks/useUser'
import { useChessWebSocket } from '../hooks/useChessWebSocket'
import { useBoardManager } from '../hooks/useBoardManager'
import { useMoveHandler } from '../hooks/useMoveHandler'
import { Board2D } from '../components/Board2D'
import { LayoutGrid, Box } from 'lucide-react'
import type { PromotionPiece } from '../hooks/useMoveHandler'
import type { PieceData } from '../types/piece-data'
import type { ChessPosition } from '../types/chess-position'
import Loading from '../components/Loading'
import '../../styles/global.scss'

const Canvas = dynamic(
    () => import('@react-three/fiber').then(mod => mod.Canvas),
    { ssr: false }
)

const Experience = dynamic(
    () => import('../../experience/Experience').then(mod => mod.Experience),
    { ssr: false }
)

const Controls = dynamic(
    () => import('../../controls/Controls').then(mod => mod.Controls),
    { ssr: false }
)

export default function PlayPage() {
    const params = useParams_()
    const router = useNavigate()
    const searchParams = useSearch()
    const gameId = params.id as string
    const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d') // Default to 3D
    const [forceStartAttempted, setForceStartAttempted] = useState(false)

    const isSpectator = searchParams.get('spectator') === 'true'

    const { mounted, userToken, userName } = useUser()
    const [game, gameActions] = useGame()

    const {
        isVsBot,
        gameOver,
        result,
        myColor,
        wsConnected,
        ping,
        opponentLeft,
        spectatorCount,
        getPingColor,
        getPingStatus,
        sendMove,
        setGameOver,
        setResult
    } = useChessWebSocket({
        gameId,
        userToken,
        userName,
        gameActions,
        isSpectator: false
    })

    // Force start game on mount
    useEffect(() => {
        if (!forceStartAttempted) {
            console.log('🚀 Force starting game on mount...')
            setForceStartAttempted(true)

            const timer = setTimeout(() => {
                if (!game.fen || game.fen === 'start' || game.situation === 'inactive') {
                    console.log('🎮 Starting fresh game...')
                    gameActions.startGame()
                    gameActions.forceActive()
                }
            }, 100)

            return () => clearTimeout(timer)
        }
    }, [forceStartAttempted, game.fen, game.situation, gameActions])

    // Force game to active when WebSocket connects
    useEffect(() => {
        if (wsConnected && game.fen && game.situation === 'inactive') {
            console.log('🟢 Force activating game from WebSocket...')
            gameActions.forceActive()
        }
    }, [wsConnected, game.fen, game.situation, gameActions])

    // Check periodically if board needs to be activated
    useEffect(() => {
        const interval = setInterval(() => {
            if (game.fen && game.situation === 'inactive') {
                const hasPieces = (game.white?.pieces?.length || 0) + (game.black?.pieces?.length || 0) > 0
                if (hasPieces) {
                    console.log('🟢 Board has pieces but inactive, force activating...')
                    gameActions.forceActive()
                } else if (!forceStartAttempted) {
                    console.log('🎮 No pieces, starting new game...')
                    gameActions.startGame()
                    gameActions.forceActive()
                }
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [game.fen, game.situation, game.white, game.black, gameActions, forceStartAttempted])

    const { manualRenderBoard } = useBoardManager(gameActions, mounted)
    const { handleMove: handle3DMove } = useMoveHandler(gameActions, isVsBot, sendMove, game.fen)

    const handle2DMove = (
        selectedPiece: PieceData,
        position: ChessPosition,
        promotion?: PromotionPiece
    ) => {
        console.log('🎯 2D Move called:', { selectedPiece, position, promotion })
        handle3DMove(selectedPiece, position, promotion)
    }

    const isGameActive = useMemo(() => {
        return game.situation === 'active' || game.situation === 'check'
    }, [game.situation])

    useEffect(() => {
        console.log('🔍 Game State Update:', {
            situation: game.situation,
            fen: game.fen?.substring(0, 50),
            turn: game.turn,
            myColor,
            isGameActive,
            wsConnected,
            hasPieces: game.white?.pieces?.length || game.black?.pieces?.length
        })
    }, [game, myColor, isGameActive, wsConnected])

    if (isSpectator) {
        router.push(`/game/spectate/${gameId}`)
        return <Loading />
    }

    if (!mounted) return <Loading />

    return (
        <div className={`home ${isGameActive ? 'start' : ''}`}>
            {gameOver && !opponentLeft && (
                <div className="game-end-overlay">
                    <div className="game-end-card">
                        <h2>Game Over!</h2>
                        <p className="result">{result?.replace('_', ' ').toUpperCase()}</p>
                        <a href="/tasks" className="btn-restart">
                            Play Again
                        </a>
                        <a href="/tasks" className="btn-lobby">
                            Browse Lobbies
                        </a>
                    </div>
                </div>
            )}

            <button
                onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                className="view-toggle-btn"
                title={viewMode === '3d' ? 'Switch to 2D View' : 'Switch to 3D View'}
            >
                {viewMode === '3d' ? <LayoutGrid size={20} /> : <Box size={20} />}
                <span>{viewMode === '3d' ? '2D View' : '3D View'}</span>
            </button>

            <Controls
                game={game}
                gameActions={gameActions}
                myColor={myColor}
                isVsBot={isVsBot}
                wsConnected={wsConnected}
                gameId={gameId}
                onShowBoard={manualRenderBoard}
                ping={ping}
                opponentLeft={opponentLeft}
                spectatorCount={spectatorCount}
                getPingColor={getPingColor}
                getPingStatus={getPingStatus}
            />

            {viewMode === '3d' ? (
                <Canvas>
                    <Experience
                        game={game}
                        onMove={handle3DMove}
                        myColor={myColor}
                        gameActions={gameActions}
                        isSpectator={false}
                    />
                </Canvas>
            ) : (
                <div className="board-2d-wrapper">
                    <Board2D
                        game={game}
                        onMove={handle2DMove}
                        myColor={myColor}
                        isSpectator={false}
                    />
                </div>
            )}
        </div>
    )
}
