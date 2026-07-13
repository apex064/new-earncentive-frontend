// components/controls/Controls.tsx

import { useMemo, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate, faChessBoard, faSignal, faUserSlash, faSpinner, faEye } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'
import { GameActions } from '../hooks/useGame'
import { GameStatus } from '../types/game-status'
import { Data } from './components/Data'
import { Options } from './components/Options'
import { StartMenu } from './components/StartMenu'
import { EndMenu } from './components/EndMenu'
import { CapturedPieces } from './components/CapturedPieces'

type ControlsProps = {
    game: GameStatus
    gameActions: GameActions
    myColor?: 'white' | 'black'
    isVsBot?: boolean
    wsConnected?: boolean
    gameId?: string
    onShowBoard?: () => void
    ping?: number | null
    opponentLeft?: boolean
    spectatorCount?: number
    getPingColor?: () => string
    getPingStatus?: () => string
}

export function Controls({ 
    game, 
    gameActions, 
    myColor, 
    isVsBot, 
    wsConnected, 
    gameId, 
    onShowBoard,
    ping,
    opponentLeft = false,
    spectatorCount = 0,
    getPingColor = () => '#aaa',
    getPingStatus = () => '--'
}: ControlsProps) {
    const [showOpponentLeftToast, setShowOpponentLeftToast] = useState(false)

    const isGameStart = useMemo(() => {
        return game.situation !== 'inactive'
    }, [game.situation])

    const isGameEnded = useMemo(() => {
        return (
            game.situation === 'checkmate' ||
            game.situation === 'stalemate' ||
            game.situation === 'draw'
        )
    }, [game.situation])

    // Handle opponent left notification
    useEffect(() => {
        if (opponentLeft && !showOpponentLeftToast && !isGameEnded) {
            setShowOpponentLeftToast(true)
            toast.error('Opponent left the game!', {
                description: 'Your opponent has disconnected. The game will end automatically.',
                duration: 5000,
                icon: <FontAwesomeIcon icon={faUserSlash} />,
                action: {
                    label: 'Return to Lobby',
                    onClick: () => {
                        gameActions.reset()
                        window.location.href = '/game/lobby'
                    }
                }
            })
        }
    }, [opponentLeft, showOpponentLeftToast, isGameEnded, gameActions])

    // Auto redirect to lobby after opponent leaves
    useEffect(() => {
        if (opponentLeft && !isGameEnded) {
            const timeout = setTimeout(() => {
                gameActions.reset()
                window.location.href = '/game/lobby'
            }, 10000)
            return () => clearTimeout(timeout)
        }
    }, [opponentLeft, isGameEnded, gameActions])

    return (
        <div className="controls">
            {/* Opponent Left Overlay */}
            {opponentLeft && !isGameEnded && (
                <div className="opponent-left-overlay">
                    <div className="opponent-left-card">
                        <FontAwesomeIcon icon={faUserSlash} className="icon" />
                        <h3>Opponent Left</h3>
                        <p>Your opponent has disconnected from the game.</p>
                        <p className="redirect-message">Redirecting to lobby in a few seconds...</p>
                        <button onClick={() => {
                            gameActions.reset()
                            window.location.href = '/game/lobby'
                        }}>
                            Return to Lobby Now
                        </button>
                    </div>
                </div>
            )}

            {/* Always show the game header card when game is active */}
            {isGameStart && !isGameEnded && !opponentLeft && (
                <div className="game-header-card">
                    <div className="card-header">
                        <div className="title-section">
                            <h2>Chess Match</h2>
                            <span className="game-id">ID: {gameId}</span>
                        </div>
                        <div className="action-buttons">
                            <button 
                                onClick={onShowBoard} 
                                className="icon-btn"
                                title="Show Board"
                            >
                                <FontAwesomeIcon icon={faChessBoard} />
                            </button>
                            <button 
                                onClick={gameActions.reset} 
                                className="icon-btn"
                                title="Reset Board"
                            >
                                <FontAwesomeIcon icon={faArrowsRotate} />
                            </button>
                        </div>
                    </div>

                    <div className="player-status">
                        <div className="status-item">
                            <span className="label">Your pieces</span>
                            <span className={`color-badge ${myColor}`}>
                                {myColor === 'white' ? 'White' : 'Black'}
                            </span>
                        </div>
                        
                        <div className="status-item">
                            <span className="label">Turn</span>
                            <span className={`color-badge ${game.turn}`}>
                                {game.turn === 'white' ? 'White' : 'Black'}
                            </span>
                        </div>

                        {game.situation === 'check' && (
                            <div className="check-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L1 21H23L12 2Z" fill="currentColor"/>
                                    <circle cx="12" cy="16" r="1.5" fill="white"/>
                                    <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2"/>
                                </svg>
                                CHECK
                            </div>
                        )}
                    </div>

                    <div className="game-footer">
                        <div className="left-section">
                            {isVsBot && (
                                <div className="vs-bot">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" fill="none"/>
                                        <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
                                        <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
                                        <path d="M8 15H16" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                    Playing vs Bot
                                </div>
                            )}
                            
                            {/* Spectator Count Display */}
                            {spectatorCount > 0 && (
                                <div className="spectator-count" title={`${spectatorCount} spectator${spectatorCount !== 1 ? 's' : ''} watching`}>
                                    <FontAwesomeIcon icon={faEye} />
                                    <span className="spectator-value">{spectatorCount}</span>
                                    <span className="spectator-label">watching</span>
                                </div>
                            )}
                            
                            {/* Ping Display */}
                            <div className="ping-display" title={`${getPingStatus()} ping - ${ping !== null ? `${ping}ms` : 'measuring...'}`}>
                                <FontAwesomeIcon icon={ping !== null ? faSignal : faSpinner} style={{ color: getPingColor() }} />
                                <span className="ping-value" style={{ color: getPingColor() }}>
                                    {ping !== null ? `${ping}ms` : '--'}
                                </span>
                                <span className="ping-status">{getPingStatus()}</span>
                            </div>
                        </div>
                        
                        <div className={`connection-status ${wsConnected ? 'connected' : 'connecting'}`}>
                            <span className="status-dot"></span>
                            <span>{wsConnected ? 'Connected' : 'Connecting'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Captured Pieces Display - Now using Lucide icons */}
            {isGameStart && !isGameEnded && !opponentLeft && (
                <div className="captured-pieces-section">
                    <CapturedPieces
                        pieces={game.capturedByWhite}
                        rival="black"
                        title="Captured by White"
                    />
                    <CapturedPieces
                        pieces={game.capturedByBlack}
                        rival="white"
                        title="Captured by Black"
                    />
                </div>
            )}

            {/* Original controls for backward compatibility */}
            {isGameStart && !isGameEnded && !opponentLeft && (
                <>
                    <Data game={game} />
                    <Options gameActions={gameActions} />
                </>
            )}
            
            {!isGameStart && !isGameEnded && !opponentLeft && (
                <StartMenu gameActions={gameActions} />
            )}
            
            {isGameEnded && <EndMenu gameActions={gameActions} />}
        </div>
    )
}
