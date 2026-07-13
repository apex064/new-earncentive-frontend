// hooks/useChessWebSocket.ts

import { useEffect, useRef, useState, useCallback } from 'react'
import { GameActions } from './useGame'
import { playGameEndSound } from '@/utils/soundUtils'
import { toast } from 'sonner'

const WS_BASE_URL = 'wss://api.earnquestapp.com'

interface UseChessWebSocketProps {
    gameId: string | null
    userToken: string
    userName: string
    gameActions: GameActions
    isSpectator?: boolean
}

export function useChessWebSocket({ 
    gameId, 
    userToken, 
    userName, 
    gameActions,
    isSpectator = false 
}: UseChessWebSocketProps) {
    const [isVsBot, setIsVsBot] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [myColor, setMyColor] = useState<'white' | 'black'>('white')
    const [wsConnected, setWsConnected] = useState(false)
    const [ping, setPing] = useState<number | null>(null)
    const [opponentLeft, setOpponentLeft] = useState(false)
    const [spectatorCount, setSpectatorCount] = useState(0)
    
    const wsRef = useRef<WebSocket | null>(null)
    const connectionEstablished = useRef(false)
    const currentGameIdRef = useRef<string | null>(null)
    const isMounted = useRef(true)
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const pingTimeoutRef = useRef<number | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pingCountRef = useRef(0)
    const pongCountRef = useRef(0)

    // Helper to get WebSocket URL
    const getWebSocketUrl = useCallback(() => {
        if (!gameId) return null
        const params = new URLSearchParams()
        if (userToken) params.append('token', userToken)
        if (isSpectator) params.append('spectator', 'true')
        
        const queryString = params.toString()
        return `${WS_BASE_URL}/ws/chess/game/${gameId}/${queryString ? `?${queryString}` : ''}`
    }, [gameId, userToken, isSpectator])

    useEffect(() => {
        isMounted.current = true
        console.log(`🔧 useChessWebSocket mounted (spectator: ${isSpectator})`)
        return () => {
            console.log('🔧 useChessWebSocket unmounted')
            isMounted.current = false
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
            }
            if (pingTimeoutRef.current) {
                clearTimeout(pingTimeoutRef.current)
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (wsRef.current) {
                console.log('🔌 Closing WebSocket on unmount')
                wsRef.current.close()
                wsRef.current = null
            }
            connectionEstablished.current = false
            currentGameIdRef.current = null
        }
    }, [isSpectator])

    // Ping measurement - only when connected
    useEffect(() => {
        if (!wsConnected || !wsRef.current) {
            return
        }

        const measurePing = () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const start = Date.now()
                pingCountRef.current++
                wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: start }))
                
                const timeout = window.setTimeout(() => {
                    if (isMounted.current) setPing(null)
                }, 5000)
                
                pingTimeoutRef.current = timeout
            }
        }

        measurePing()
        pingIntervalRef.current = setInterval(measurePing, 30000)

        return () => {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
            }
            if (pingTimeoutRef.current) {
                clearTimeout(pingTimeoutRef.current)
            }
        }
    }, [wsConnected])

    // Handle incoming WebSocket messages - UPDATED with better logging and handling
    const handleMessage = useCallback((event: MessageEvent) => {
        if (!isMounted.current) return
        try {
            const data = JSON.parse(event.data)
            console.log('📨 WebSocket message received:', data.type, data)
            
            // Handle ping response (pong)
            if (data.type === 'pong' && data.timestamp) {
                const latency = Date.now() - data.timestamp
                pongCountRef.current++
                if (isMounted.current) {
                    setPing(Math.max(0, latency))
                }
                if (pingTimeoutRef.current) {
                    clearTimeout(pingTimeoutRef.current)
                    pingTimeoutRef.current = null
                }
                return
            }

            // Handle opponent disconnected
            if (data.type === 'opponent_disconnected' && !isSpectator) {
                console.log('⚠️ Opponent disconnected!')
                if (isMounted.current) setOpponentLeft(true)
                toast.error('Opponent left the game!', {
                    description: 'Your opponent has disconnected. Redirecting to lobby...',
                    duration: 5000,
                    icon: '🚪',
                    action: {
                        label: 'Go to Lobby',
                        onClick: () => {
                            window.location.href = '/game/lobby'
                        }
                    }
                })
                return
            }

            // Handle opponent reconnected
            if (data.type === 'opponent_reconnected' && !isSpectator) {
                console.log('🔄 Opponent reconnected!')
                if (isMounted.current) setOpponentLeft(false)
                toast.success('Opponent reconnected!', {
                    duration: 3000,
                    icon: '🔄',
                })
                return
            }

            // Handle spectator count updates
            if (data.type === 'spectator_update') {
                console.log(`👁️ Spectator update: ${data.spectator_count} spectators`)
                setSpectatorCount(data.spectator_count)
                return
            }

            // Handle spectator chat messages
            if (data.type === 'spectator_chat') {
                console.log(`💬 Spectator chat: ${data.username}: ${data.message}`)
                return
            }

            // Handle game state from backend
            if (data.type === 'game_state') {
                console.log('📦 Received game state, syncing board...')
                
                let fenToSync = null
                if (data.game && data.game.fen) {
                    fenToSync = data.game.fen
                } else if (data.fen) {
                    fenToSync = data.fen
                }
                
                if (fenToSync) {
                    gameActions.syncFromFen(fenToSync)
                    console.log('✅ Board synced with FEN:', fenToSync.substring(0, 50))
                } else {
                    console.warn('No FEN found in game_state response', data)
                }
                
                setIsVsBot(data.game?.is_vs_bot || false)
                
                if (!isSpectator && data.game) {
                    if (data.game.white_player === userName) {
                        setMyColor('white')
                        console.log('♔ You are playing as WHITE')
                    } else if (data.game.black_player === userName) {
                        setMyColor('black')
                        console.log('♚ You are playing as BLACK')
                    }
                }
                
                if (data.game?.status === 'active' && !isSpectator) {
                    toast.success('Game started! Your turn.', {
                        duration: 3000,
                        icon: '♟️',
                    })
                }
            }

            // Handle game updates (moves, game end, etc.) - CRITICAL FIX
            if (data.type === 'game_update') {
                console.log('🎯 GAME UPDATE RECEIVED:', data.action)
                
                // Handle move updates
                if (data.action === 'move_made' || data.action === 'bot_move') {
                    console.log('🔄 Move update, new FEN received:', data.fen)
                    
                    if (data.fen) {
                        // CRITICAL: Update the board with the new FEN
                        gameActions.syncFromFen(data.fen)
                        console.log('✅ Board updated with new FEN')
                    }
                    
                    if (data.game_over === true) {
                        console.log('🏁 Game over from backend!', data.result)
                        if (isMounted.current) {
                            setGameOver(true)
                            setResult(data.result)
                            if (!isSpectator) {
                                playGameEndSound(data.result)
                            }
                        }
                        
                        // Show toast for game end
                        if (!isSpectator) {
                            const currentMyColor = myColor
                            if (data.result === 'white_win') {
                                const winner = currentMyColor === 'white' ? 'You won!' : 'You lost!'
                                if (currentMyColor === 'white') {
                                    toast.success(winner, {
                                        description: data.result.replace('_', ' ').toUpperCase(),
                                        duration: 5000,
                                        icon: '🏆',
                                    })
                                } else {
                                    toast.error(winner, {
                                        description: data.result.replace('_', ' ').toUpperCase(),
                                        duration: 5000,
                                        icon: '😔',
                                    })
                                }
                            } else if (data.result === 'black_win') {
                                const winner = currentMyColor === 'black' ? 'You won!' : 'You lost!'
                                if (currentMyColor === 'black') {
                                    toast.success(winner, {
                                        description: data.result.replace('_', ' ').toUpperCase(),
                                        duration: 5000,
                                        icon: '🏆',
                                    })
                                } else {
                                    toast.error(winner, {
                                        description: data.result.replace('_', ' ').toUpperCase(),
                                        duration: 5000,
                                        icon: '😔',
                                    })
                                }
                            } else if (data.result === 'draw') {
                                toast.info('Game ended in a draw!', {
                                    description: 'Good game!',
                                    duration: 5000,
                                    icon: '🤝',
                                })
                            }
                        }
                    }
                }

                // Handle game end action
                if (data.action === 'game_end') {
                    console.log('🏁 Game end action received', data.result)
                    if (isMounted.current) {
                        setGameOver(true)
                        setResult(data.result)
                        if (!isSpectator) {
                            playGameEndSound(data.result)
                        }
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error)
        }
    }, [gameActions, isSpectator, userName, myColor])

    // Main WebSocket connection
    useEffect(() => {
        console.log('🔌 useEffect triggered - gameId:', gameId, 'spectator:', isSpectator)
        
        if (!gameId || !userToken) {
            console.log('🔌 Skipping - missing gameId or userToken')
            return
        }
        
        if (wsRef.current) {
            const state = wsRef.current.readyState
            if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
                console.log('🔌 WebSocket already exists, skipping new connection')
                return
            }
        }
        
        if (connectionEstablished.current && currentGameIdRef.current === gameId) {
            console.log('🔌 WebSocket already established for game', gameId)
            return
        }

        const wsUrl = getWebSocketUrl()
        if (!wsUrl) {
            console.log('🔌 No WebSocket URL, skipping')
            return
        }

        console.log(`🔌 Creating NEW WebSocket connection for game ${gameId} (spectator: ${isSpectator})`)
        console.log(`🔌 WebSocket URL: ${wsUrl}`)
        currentGameIdRef.current = gameId
        
        const websocket = new WebSocket(wsUrl)

        websocket.onopen = () => {
            if (!isMounted.current) return
            console.log('✅ WebSocket OPEN event fired')
            setWsConnected(true)
            connectionEstablished.current = true
            setOpponentLeft(false)
            
            if (!isSpectator) {
                toast.success('Connected to game server', {
                    duration: 2000,
                    icon: '🔌',
                })
            }
        }

        websocket.onmessage = handleMessage

        websocket.onerror = (error) => {
            console.error('❌ Chess WS error:', error)
            if (isMounted.current) {
                setWsConnected(false)
                if (!isSpectator) {
                    toast.error('Connection error', {
                        description: 'Attempting to reconnect...',
                        duration: 3000,
                    })
                }
            }
        }
        
        websocket.onclose = (event) => {
            console.log(`🔌 WebSocket closed: code=${event.code}, reason=${event.reason || 'no reason'}`)
            wsRef.current = null
            connectionEstablished.current = false
            currentGameIdRef.current = null
            if (isMounted.current) {
                setWsConnected(false)
                setPing(null)
            }
            
            if (pingTimeoutRef.current) {
                clearTimeout(pingTimeoutRef.current)
                pingTimeoutRef.current = null
            }
            
            // Attempt reconnect
            if (event.code !== 1000 && event.code !== 1001 && gameId && isMounted.current) {
                console.log('🔄 Scheduling reconnect in 5 seconds...')
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current)
                }
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (isMounted.current && gameId) {
                        console.log('🔄 Attempting to reconnect...')
                        connectionEstablished.current = false
                        if (wsRef.current) {
                            wsRef.current = null
                        }
                        const newWsUrl = getWebSocketUrl()
                        if (newWsUrl) {
                            const newWs = new WebSocket(newWsUrl)
                            newWs.onopen = websocket.onopen
                            newWs.onmessage = websocket.onmessage
                            newWs.onerror = websocket.onerror
                            newWs.onclose = websocket.onclose
                            wsRef.current = newWs
                        }
                    }
                }, 5000)
            }
        }

        wsRef.current = websocket

        return () => {
            console.log('🔌 Cleanup skipped - keeping WebSocket connection alive')
        }
    }, [gameId, userToken, isSpectator, getWebSocketUrl, handleMessage])

    const sendMove = useCallback((move: string) => {
        if (isSpectator) {
            console.log('Spectators cannot send moves')
            return false
        }
        
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log(`📤 Sending move: ${move}`)
            wsRef.current.send(JSON.stringify({
                action: 'make_move',
                move: move,
            }))
            return true
        }
        console.log('❌ Cannot send move - WebSocket not open')
        if (!isSpectator) {
            toast.error('Not connected to game server', {
                duration: 2000,
            })
        }
        return false
    }, [isSpectator])

    const sendSpectatorChat = useCallback((message: string) => {
        if (!isSpectator) {
            console.log('Only spectators can send spectator chat')
            return false
        }
        
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                action: 'spectator_chat',
                message: message,
            }))
            return true
        }
        return false
    }, [isSpectator])

    const getPingColor = useCallback(() => {
        if (ping === null) return '#aaa'
        if (ping < 50) return '#10b981'
        if (ping < 100) return '#f59e0b'
        if (ping < 200) return '#f97316'
        return '#ef4444'
    }, [ping])

    const getPingStatus = useCallback(() => {
        if (ping === null) return '--'
        if (ping < 50) return 'Excellent'
        if (ping < 100) return 'Good'
        if (ping < 200) return 'Fair'
        return 'Poor'
    }, [ping])

    const resetOpponentLeft = useCallback(() => {
        setOpponentLeft(false)
    }, [])

    useEffect(() => {
        console.log(`📊 [DEBUG] Ping state changed to: ${ping}ms`)
    }, [ping])

    useEffect(() => {
        console.log(`📊 [DEBUG] wsConnected changed to: ${wsConnected}`)
    }, [wsConnected])

    return {
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
        sendSpectatorChat,
        resetOpponentLeft,
        setGameOver,
        setResult
    }
}
