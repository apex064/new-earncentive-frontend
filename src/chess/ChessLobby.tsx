'use client'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/config'
import '@/chess/styles/global.scss'


type Lobby = {
    id: string
    creator: string
    creator_id?: number
    opponent?: string | null
    opponent_id?: number | null
    stake: string
    status: string
    is_vs_bot: boolean
    creator_ready?: boolean
    opponent_ready?: boolean
    bot_difficulty?: string
}

type CreateLobbyData = {
    stake: number
    is_vs_bot: boolean
    bot_difficulty?: string
    opponent_id?: number
}

export default function LobbyPage() {
    const [mounted, setMounted] = useState(false)
    const [lobbies, setLobbies] = useState<Lobby[]>([])
    const [userToken, setUserToken] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createData, setCreateData] = useState<CreateLobbyData>({
        stake: 0,
        is_vs_bot: false,
        bot_difficulty: 'medium'
    })
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token')
            const sessionToken = sessionStorage.getItem('token')
            const finalToken = token || sessionToken
            if (finalToken) setUserToken(finalToken)
        }
    }, [])

    // Fetch active lobbies
    useEffect(() => {
        if (!userToken) return

        const fetchLobbies = async () => {
            try {
                setError(null)
                const response = await fetch(`${API_BASE_URL}/chess/lobby/active_lobbies/`, {
                    headers: {
                        Authorization: `Token ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    setLobbies(Array.isArray(data) ? data : [])
                } else {
                    console.error('Failed to fetch lobbies:', response.status)
                }
            } catch (error) {
                console.error('Error fetching lobbies:', error)
                setError('Failed to load lobbies. Please try again.')
            }
        }

        fetchLobbies()
        const interval = setInterval(fetchLobbies, 5000)
        return () => clearInterval(interval)
    }, [userToken])

    const joinLobby = async (lobbyId: string) => {
        if (!userToken) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE_URL}/chess/lobby/${lobbyId}/join_lobby/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${userToken}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                sessionStorage.setItem('currentLobbyId', lobbyId)
                sessionStorage.setItem('currentLobbyData', JSON.stringify(data))
                window.location.href = `/chess/ready/${lobbyId}`
            } else {
                const error = await response.json()
                alert(error.error || error.message || 'Failed to join lobby')
            }
        } catch (error) {
            console.error('Error joining lobby:', error)
            setError('Network error. Please check your connection.')
            alert('Failed to join lobby. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const createLobby = async () => {
        if (!userToken) return

        if (createData.stake < 0 || createData.stake > 5) {
            alert('Stake must be between 0 and 5')
            return
        }

        setCreating(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE_URL}/chess/lobby/create_lobby/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${userToken}`,
                },
                body: JSON.stringify(createData),
            })

            if (response.ok) {
                const data = await response.json()
                setShowCreateModal(false)
                setCreateData({
                    stake: 0,
                    is_vs_bot: false,
                    bot_difficulty: 'medium'
                })
                if (data.id) {
                    sessionStorage.setItem('currentLobbyId', data.id)
                    window.location.href = `/chess/ready/${data.id}`
                } else {
                    window.location.reload()
                }
            } else {
                const error = await response.json()
                alert(error.error || error.message || 'Failed to create lobby')
            }
        } catch (error) {
            console.error('Error creating lobby:', error)
            setError('Network error. Please check your connection.')
            alert('Failed to create lobby. Please try again.')
        } finally {
            setCreating(false)
        }
    }

    const startBotGame = async () => {
        if (!userToken) return

        if (createData.stake < 0 || createData.stake > 5) {
            alert('Stake must be between 0 and 5')
            return
        }

        setCreating(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE_URL}/chess/games/start_bot_game/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${userToken}`,
                },
                body: JSON.stringify({
                    stake: createData.stake,
                    bot_difficulty: createData.bot_difficulty
                }),
            })

            if (response.ok) {
                const data = await response.json()
                window.location.href = `/chess/play/${data.game_id}`
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to start bot game')
            }
        } catch (error) {
            console.error('Error starting bot game:', error)
            alert('Failed to start bot game. Please try again.')
        } finally {
            setCreating(false)
            setShowCreateModal(false)
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">🎮 Chess Lobbies</h1>
                    <p className="text-muted-foreground">Join a player and play for stakes!</p>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex justify-between items-center">
                        <span className="text-destructive">⚠️ {error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-destructive hover:text-destructive-light transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {lobbies.length === 0 ? (
                    <div className="text-center py-12 bg-card border border-border rounded-xl">
                        <p className="text-muted-foreground">No active lobbies. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {lobbies.map((lobby) => (
                            <div key={lobby.id} className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-all duration-300 hover:shadow-lg">
                                <div className="flex justify-between items-start mb-4 pb-4 border-b border-border">
                                    <div>
                                        <h3 className="font-semibold text-foreground">{lobby.creator}</h3>
                                        {lobby.is_vs_bot && (
                                            <span className="inline-block mt-1 text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                                                🤖 VS Bot
                                            </span>
                                        )}
                                    </div>
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                        ${Number(lobby.stake).toFixed(2)}
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground">
                                        Status: <span className="text-foreground">{lobby.status}</span>
                                    </p>
                                    {lobby.bot_difficulty && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Difficulty: <span className="text-foreground">{lobby.bot_difficulty}</span>
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => joinLobby(lobby.id)}
                                    disabled={loading || lobby.is_vs_bot}
                                    className={`w-full py-2 rounded-full font-medium transition-all ${
                                        lobby.is_vs_bot
                                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                            : 'bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    {loading ? 'Joining...' : 'Join Game'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg"
                    >
                        Create New Lobby
                    </button>
                    <a
                        href="/chess"
                        className="px-6 py-3 bg-background border border-border hover:bg-primary/10 text-foreground font-medium rounded-full transition-all"
                    >
                        Back to Chess
                    </a>
                </div>
            </div>

            {/* Create Lobby Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-foreground text-center mb-6">Create New Lobby</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Stake Amount ($0 - $5)
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="5"
                                    value={createData.stake}
                                    onChange={(e) => setCreateData({...createData, stake: parseFloat(e.target.value)})}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createData.is_vs_bot}
                                        onChange={(e) => setCreateData({...createData, is_vs_bot: e.target.checked})}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-foreground">Play against Bot</span>
                                </label>
                            </div>

                            {createData.is_vs_bot && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Bot Difficulty
                                    </label>
                                    <select
                                        value={createData.bot_difficulty}
                                        onChange={(e) => setCreateData({...createData, bot_difficulty: e.target.value})}
                                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-full font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                {createData.is_vs_bot ? (
                                    <button
                                        onClick={startBotGame}
                                        className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg"
                                        disabled={creating}
                                    >
                                        {creating ? 'Starting...' : 'Start Bot Game'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={createLobby}
                                        className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg"
                                        disabled={creating}
                                    >
                                        {creating ? 'Creating...' : 'Create Lobby'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
