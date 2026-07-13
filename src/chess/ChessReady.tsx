'use client'

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { API_BASE_URL } from '@/lib/config'
import '@/chess/styles/global.scss'

const WS_BASE_URL = 'wss://api.earnquestapp.com'

type LobbyState = {
    id: string
    creator: string
    opponent: string | null
    stake: string
    status: string
    creator_ready: boolean
    opponent_ready: boolean
}

export default function ReadyPage() {
    const params = useParams()
    const navigate = useNavigate()
    const lobbyId = params.id as string

    const [mounted, setMounted] = useState(false)
    const [userToken, setUserToken] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [lobby, setLobby] = useState<LobbyState | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [isCreator, setIsCreator] = useState(false)

    useEffect(() => {
        setMounted(true)
        const storedUsername = localStorage.getItem('username')
        if (storedUsername) setUsername(storedUsername)
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token')
            if (token) setUserToken(token)
        }
    }, [])

    useEffect(() => {
        if (!userToken) return

        const fetchLobby = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/chess/lobby/${lobbyId}/`, {
                    headers: {
                        Authorization: `Token ${userToken}`,
                    },
                })
                if (response.ok) {
                    const data = await response.json()
                    setLobby(data)
                    setIsCreator(data.creator === username)
                    console.log('Initial lobby data:', data)
                }
            } catch (error) {
                console.error('Error fetching lobby:', error)
            }
        }

        fetchLobby()

        const interval = setInterval(fetchLobby, 3000)
        return () => clearInterval(interval)
    }, [userToken, lobbyId, username])

    useEffect(() => {
        if (!userToken || !lobbyId) return

        const websocket = new WebSocket(`${WS_BASE_URL}/ws/chess/lobby/${lobbyId}/?token=${userToken}`)

        websocket.onopen = () => {
            console.log('Connected to lobby WebSocket')
            if (!isReady && lobby?.opponent === username) {
                setTimeout(() => {
                    websocket.send(JSON.stringify({ action: 'ready' }))
                }, 500)
            }
        }

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log('WebSocket message:', data)

            if (data.type === 'lobby_state') {
                setLobby(data.lobby)
                setIsCreator(data.lobby.creator === username)
            }

            if (data.type === 'lobby_update') {
                if (data.action === 'player_joined') {
                    console.log('Player joined:', data.player)
                    setLobby((prev) =>
                        prev ? {
                            ...prev,
                            opponent: data.player,
                            status: 'invited'
                        } : null
                    )
                }

                if (data.action === 'player_ready') {
                    setLobby((prev) =>
                        prev ? {
                            ...prev,
                            creator_ready: data.creator_ready ?? prev.creator_ready,
                            opponent_ready: data.opponent_ready ?? prev.opponent_ready,
                        } : null
                    )

                    if (data.player === username) {
                        setIsReady(true)
                    }
                }

                if (data.action === 'countdown_start') {
                    setCountdown(data.countdown_seconds)
                }

                if (data.action === 'game_started') {
                    console.log('Game started! Redirecting to game:', data.game_id)
                    navigate({ to: "/dashboard/chess/play/$id", params: { id: String(data.game_id) } })
                }
            }
        }

        websocket.onerror = (error) => console.error('WebSocket error:', error)
        websocket.onclose = () => console.log('Disconnected from lobby')

        setWs(websocket)
        return () => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.close()
            }
        }
    }, [userToken, lobbyId, username, lobby?.opponent, isReady, navigate])

    useEffect(() => {
        if (countdown === null || countdown <= 0) return

        const timer = setTimeout(() => {
            setCountdown(countdown - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown])

    const toggleReady = () => {
        if (!userToken || !lobbyId || !ws) return
        ws.send(JSON.stringify({ action: 'ready' }))
        setIsReady(true)
    }

    if (!mounted || !lobby) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground">Loading...</div>
            </div>
        )
    }

    const amIReady = isCreator ? lobby.creator_ready : lobby.opponent_ready
    const hasOpponent = !!lobby.opponent

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border border-border rounded-xl p-8">
                <h1 className="text-2xl font-bold text-foreground text-center mb-6">🎮 Get Ready!</h1>

                <div className="space-y-6">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 text-center">
                            <div className="font-semibold text-foreground">
                                {lobby.creator} {isCreator && <span className="text-primary text-sm">(You)</span>}
                            </div>
                            <div className="text-sm mt-1">
                                {lobby.creator_ready ? '✅ Ready' : '⏳ Waiting...'}
                            </div>
                        </div>

                        <div className="text-primary font-bold">VS</div>

                        <div className="flex-1 text-center">
                            <div className="font-semibold text-foreground">
                                {lobby.opponent || 'Waiting...'}
                                {!isCreator && lobby.opponent === username && <span className="text-primary text-sm"> (You)</span>}
                            </div>
                            <div className="text-sm mt-1">
                                {lobby.opponent ? (
                                    lobby.opponent_ready ? '✅ Ready' : '⏳ Waiting...'
                                ) : (
                                    '👤 Waiting for player...'
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                        <span className="text-primary font-medium">Stake: ${Number(lobby.stake).toFixed(2)}</span>
                    </div>

                    {countdown !== null ? (
                        <div className="text-center">
                            <p className="text-muted-foreground mb-2">Starting in:</p>
                            <div className="text-5xl font-bold text-primary animate-pulse">{countdown}</div>
                        </div>
                    ) : (
                        <>
                            {!hasOpponent && !isCreator && (
                                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-center">
                                    <p className="text-warning">⏳ Waiting for opponent to join...</p>
                                </div>
                            )}

                            {hasOpponent && !amIReady && (
                                <button
                                    onClick={toggleReady}
                                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg"
                                >
                                    🎯 Click to Ready
                                </button>
                            )}

                            {hasOpponent && amIReady && (
                                <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
                                    <p className="text-success">✅ Ready! Waiting for opponent...</p>
                                </div>
                            )}
                        </>
                    )}

                    <Link
                        to="/dashboard"
                        className="block text-center text-muted-foreground hover:text-primary transition-colors mt-4"
                    >
                        Back to Lobby
                    </Link>
                </div>
            </div>
        </div>
    )
}
