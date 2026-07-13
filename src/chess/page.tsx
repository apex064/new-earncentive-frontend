'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { API_BASE_URL } from '@/lib/config'
import ''

import './styles/global.scss'
import { useGame, MoveResult } from '@/hooks/useGame'
import { Controls } from '@/chess/controls/Controls'

const Canvas = dynamic(
  () => import('@react-three/fiber').then(mod => mod.Canvas),
  { ssr: false }
)

const Experience = dynamic(
  () => import('@/chess/experience/Experience').then(mod => mod.Experience),
  { ssr: false }
)

const WS_BASE_URL = 'wss://api.earnquestapp.com'

export default function Home() {
    const [mounted, setMounted] = useState(false)
    const [stake, setStake] = useState(0)
    const [opponent, setOpponent] = useState<'human' | 'bot'>('bot')
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [game, gameActions] = useGame()
    const [gameId, setGameId] = useState<string | null>(null)
    const [lobbyId, setLobbyId] = useState<string | null>(null)
    const [userToken, setUserToken] = useState<string>('')

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token')
            if (token) setUserToken(token)
        }
    }, [])

    useEffect(() => {
        if (gameId && userToken) {
            const websocket = new WebSocket(`${WS_BASE_URL}/ws/chess/game/${gameId}/?token=${userToken}`)
            
            websocket.onopen = () => {
                console.log('Game WebSocket connected for game:', gameId)
            }
            
            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data)
                console.log('Game WebSocket message:', data.type)
                
                if (data.type === 'game_state') {
                    gameActions.syncFromFen(data.game.fen)
                }
                if (data.type === 'game_update') {
                    if (data.fen) {
                        gameActions.syncFromFen(data.fen)
                    }
                }
            }
            websocket.onclose = () => {
                console.log('Game WebSocket closed')
                setWs(null)
            }
            websocket.onerror = (error) => console.error('Chess WS error', error)
            setWs(websocket)
            return () => websocket.close()
        }
    }, [gameId, userToken, gameActions])

    useEffect(() => {
        let intervalId: number | undefined

        const checkForMatch = async () => {
            if (!lobbyId || !userToken) return

            try {
                const response = await fetch(`${API_BASE_URL}/chess/games/`, {
                    headers: {
                        Authorization: `Token ${userToken}`,
                    },
                })
                if (!response.ok) return

                const games = await response.json()
                const activeGame = Array.isArray(games)
                    ? games.find((game: any) => game.status === 'active')
                    : null
                if (activeGame) {
                    setGameId(String(activeGame.id))
                    setLobbyId(null)
                    gameActions.startGame()
                    if (intervalId) {
                        window.clearInterval(intervalId)
                    }
                }
            } catch (error) {
                console.error('Error polling for chess match:', error)
            }
        }

        if (lobbyId) {
            intervalId = window.setInterval(checkForMatch, 3000)
            checkForMatch()
        }

        return () => {
            if (intervalId) {
                window.clearInterval(intervalId)
            }
        }
    }, [lobbyId, userToken, gameActions])

    const startGame = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            alert('Please sign in before playing')
            return
        }

        if (opponent === 'bot') {
            try {
                const response = await fetch(`${API_BASE_URL}/chess/games/start_bot_game/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        stake: 0,
                        bot_difficulty: 'medium',
                    }),
                })

                const data = await response.json()
                console.log('Bot game response:', data)
                
                if (response.ok && data.game_id) {
                    window.location.href = `/chess/play/${data.game_id}`
                } else {
                    alert(data.error || 'Failed to create bot game')
                }
            } catch (error) {
                console.error('Error creating bot game:', error)
                alert('Failed to create bot game')
            }
            return
        }

        if (stake < 0.1 || stake > 5) {
            alert('Stake must be between $0.10 and $5.00')
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/chess/lobby/create_lobby/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify({
                    stake,
                    is_vs_bot: false,
                }),
            })

            const data = await response.json()
            if (response.ok && data.id) {
                setLobbyId(String(data.id))
                window.location.href = `/chess/ready/${data.id}`
            } else {
                alert(data.error || 'Failed to create lobby')
            }
        } catch (error) {
            console.error('Error creating lobby:', error)
            alert('Failed to create lobby')
        }
    }

    const handleMove = useCallback(
        (selectedPiece: any, position: any, promotion?: 'q' | 'r' | 'b' | 'n') => {
            const result: MoveResult = gameActions.movePiece(
                selectedPiece,
                position,
                promotion ?? 'q'
            )
            if (!result.valid) return

            if (opponent === 'human' && ws?.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    action: 'make_move',
                    move: result.uci ?? `${result.from}${result.to}`,
                    fen_after: result.fen,
                }))
            }

            if (opponent === 'bot') {
                setTimeout(() => gameActions.makeBotMove(), 800)
            }
        },
        [gameActions, opponent, ws]
    )

    const isGameStart = useMemo(() => {
        return game.situation !== 'inactive' && game.situation !== 'checkmate'
    }, [game.situation])

    useEffect(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return
        if (game.situation === 'checkmate') {
            const result = game.turn === 'white' ? 'black_win' : 'white_win'
            ws.send(JSON.stringify({ action: 'game_end', result }))
        } else if (game.situation === 'stalemate' || game.situation === 'draw') {
            ws.send(JSON.stringify({ action: 'game_end', result: 'draw' }))
        }
    }, [game.situation, ws, game.turn])

    if (!mounted) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">♟️ Chess</h1>
                    <p className="text-muted-foreground">Challenge yourself or compete with others</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold text-foreground text-center mb-6">How do you want to play?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                            className={`p-6 rounded-xl border-2 transition-all ${
                                opponent === 'bot' 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'bg-background border-border hover:border-primary/50'
                            }`}
                            onClick={() => setOpponent('bot')}
                        >
                            <div className="text-4xl mb-2">🤖</div>
                            <div className="font-semibold text-foreground mb-1">Play vs Bot</div>
                            <div className="text-sm text-muted-foreground">No stakes, practice mode</div>
                        </button>

                        <button
                            className={`p-6 rounded-xl border-2 transition-all ${
                                opponent === 'human' 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'bg-background border-border hover:border-primary/50'
                            }`}
                            onClick={() => setOpponent('human')}
                        >
                            <div className="text-4xl mb-2">👥</div>
                            <div className="font-semibold text-foreground mb-1">Play vs Human</div>
                            <div className="text-sm text-muted-foreground">Play with others for stakes</div>
                        </button>
                    </div>

                    {opponent === 'human' && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Stake Amount (USD):
                            </label>
                            <input
                                type="number"
                                value={stake}
                                onChange={(e) => setStake(Number(e.target.value))}
                                min={0.1}
                                max={5}
                                step={0.1}
                                className="w-full px-4 py-2 bg-background border border-border rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0.10"
                            />
                            <p className="text-xs text-muted-foreground mt-2">Minimum $0.10 • Maximum $5.00</p>
                        </div>
                    )}

                    <button
                        onClick={startGame}
                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg"
                    >
                        Start Game →
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h3 className="font-semibold text-foreground mb-2">🎯 Quick Rules</h3>
                        <p className="text-sm text-muted-foreground">Standard chess rules apply. Win by checkmate or opponent resignation.</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h3 className="font-semibold text-foreground mb-2">💰 Payouts</h3>
                        <p className="text-sm text-muted-foreground">5% house rake on human games. Draw refunds both stakes. Winner takes all.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
