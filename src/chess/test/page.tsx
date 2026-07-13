'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { API_BASE_URL } from '@/lib/config'

import '../styles/global.scss'
import { useGame, MoveResult } from '@/hooks/useGame'
import { Controls } from '../controls/Controls'

const Canvas = dynamic(
  () => import('@react-three/fiber').then(mod => mod.Canvas),
  { ssr: false }
)

const Experience = dynamic(
  () => import('../experience/Experience').then(mod => mod.Experience),
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

    // Wait for client-side mount before showing anything
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
            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if (data.type === 'game_state') {
                    gameActions.syncFromFen(data.game.fen)
                }
                if (data.type === 'game_update') {
                    if (data.fen) {
                        gameActions.syncFromFen(data.fen)
                    }
                }
            }
            websocket.onclose = () => setWs(null)
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
        if (opponent === 'bot') {
            setStake(0)
            gameActions.startGame()
            return
        }

        if (stake < 0.1 || stake > 5) {
            alert('Stake must be between $0.10 and $5.00')
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            alert('Please sign in before playing')
            return
        }

        const response = await fetch(`${API_BASE_URL}/chess/games/join_lobby/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ stake, is_vs_bot: false }),
        })

        const data = await response.json()
        if (response.ok && data.id) {
            setGameId(String(data.id))
            setLobbyId(null)
            gameActions.startGame()
            return
        }

        if (data.lobby_id) {
            setLobbyId(String(data.lobby_id))
            setGameId(null)
            alert('Waiting for an opponent to match your stake...')
            return
        }

        console.error('Chess lobby error:', data)
        alert(data.error || 'Unable to join chess lobby')
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

    // Don't render anything on the server - prevents hydration mismatch
    if (!mounted) {
        return null
    }

    return (
        <div className={`home ${isGameStart ? 'start' : ''}`}>
            <div className="staking-ui">
                <label>Stake Amount:</label>
                <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(Number(e.target.value))}
                    disabled={opponent === 'bot'}
                    min={0.1}
                    max={5}
                    step={0.1}
                />
                <select value={opponent} onChange={(e) => setOpponent(e.target.value as 'human' | 'bot')}>
                    <option value="bot">Play vs Bot</option>
                    <option value="human">Play vs Human</option>
                </select>
                <button onClick={startGame}>Start Game</button>
                {lobbyId ? <div>Waiting for opponent... lobby {lobbyId}</div> : null}
            </div>
            <Controls game={game} gameActions={gameActions} />
            <Canvas>
                <Experience game={game} onMove={handleMove} />
            </Canvas>
        </div>
    )
}
