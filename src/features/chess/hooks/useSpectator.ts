// hooks/useSpectator.ts - COMPLETE FIXED VERSION

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';

const WS_BASE_URL = 'wss://api.earnquestapp.com';

interface SpectatorGame {
    id: number;
    white_player: string | null;
    black_player: string | null;
    stake: number;
    is_vs_bot: boolean;
    spectator_count: number;
    started_at: string | null;
}

interface Spectator {
    id: number;
    username: string;
    profile_picture: string | null;
    joined_at: string;
}

interface UseSpectatorReturn {
    isSpectating: boolean;
    spectatorCount: number;
    spectators: Spectator[];
    fen: string;
    gameOver: boolean;
    result: string | null;
    whitePlayer: string | null;
    blackPlayer: string | null;
    isVsBot: boolean;
    connected: boolean;
    connecting: boolean;
    startSpectating: (gameId: number) => Promise<boolean>;
    stopSpectating: () => Promise<void>;
    getPublicGames: () => Promise<SpectatorGame[]>;
    sendInvitation: (toUserId: number, gameId?: number, message?: string) => Promise<boolean>;
    getInvitations: () => Promise<any[]>;
    respondToInvitation: (invitationId: number, accept: boolean) => Promise<boolean>;
}

export function useSpectator(): UseSpectatorReturn {
    const [isSpectating, setIsSpectating] = useState(false);
    const [spectatorCount, setSpectatorCount] = useState(0);
    const [spectators, setSpectators] = useState<Spectator[]>([]);
    
    const [fen, setFen] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [whitePlayer, setWhitePlayer] = useState<string | null>(null);
    const [blackPlayer, setBlackPlayer] = useState<string | null>(null);
    const [isVsBot, setIsVsBot] = useState(false);
    
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    
    const currentGameIdRef = useRef<number | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMounted = useRef(true);
    
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);
    
    const connectWebSocket = useCallback((gameId: number, token: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.close();
        }
        
        setConnecting(true);
        
        // CRITICAL FIX: Add spectator=true to WebSocket URL
        const wsUrl = `${WS_BASE_URL}/ws/chess/game/${gameId}/?token=${token}&spectator=true`;
        
        console.log('🔌 Spectator WebSocket connecting to:', wsUrl);
        
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            if (isMounted.current) {
                setConnected(true);
                setConnecting(false);
                setIsSpectating(true);
                console.log('✅ Spectator WebSocket connected successfully');
            }
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📦 Spectator WebSocket message:', data.type);
                
                if (data.type === 'game_state') {
                    setFen(data.game.fen);
                    setWhitePlayer(data.game.white_player);
                    setBlackPlayer(data.game.black_player);
                    setIsVsBot(data.game.is_vs_bot);
                    console.log('📦 Game state received, FEN:', data.game.fen?.substring(0, 50));
                }
                
                if (data.type === 'game_update') {
                    if (data.action === 'move_made' || data.action === 'bot_move') {
                        setFen(data.fen);
                        console.log('🔄 Move update received, new FEN');
                    }
                    
                    if (data.action === 'game_end') {
                        setGameOver(true);
                        setResult(data.result);
                        console.log('🏁 Game ended:', data.result);
                    }
                }
                
                if (data.type === 'spectator_update') {
                    setSpectatorCount(data.spectator_count);
                    setSpectators(data.spectators || []);
                    console.log('👁️ Spectator update:', data.spectator_count, 'spectators');
                }
                
                if (data.type === 'pong') {
                    // Keep connection alive
                    console.log('🏓 Pong received');
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        ws.onerror = (error) => {
            console.error('❌ Spectator WebSocket error:', error);
            if (isMounted.current) {
                setConnected(false);
                setConnecting(false);
            }
        };
        
        ws.onclose = (event) => {
            console.log(`🔌 Spectator WebSocket closed: code=${event.code}, reason=${event.reason}`);
            if (isMounted.current) {
                setConnected(false);
                setConnecting(false);
                setIsSpectating(false);
                
                // Attempt to reconnect
                if (currentGameIdRef.current && isMounted.current && event.code !== 1000) {
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                    }
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (currentGameIdRef.current && isMounted.current) {
                            const token = localStorage.getItem('token');
                            if (token) {
                                console.log('🔄 Attempting to reconnect spectator WebSocket...');
                                connectWebSocket(currentGameIdRef.current, token);
                            }
                        }
                    }, 3000);
                }
            }
        };
        
        wsRef.current = ws;
    }, []);
    
    const startSpectating = useCallback(async (gameId: number): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No auth token found');
            return false;
        }
        
        try {
            console.log(`🎬 Starting spectate for game ${gameId}`);
            
            const response = await fetch(`${API_BASE_URL}/chess/games/${gameId}/spectate/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Spectate API response:', data);
                
                currentGameIdRef.current = gameId;
                setFen(data.fen);
                setWhitePlayer(data.white_player);
                setBlackPlayer(data.black_player);
                setIsVsBot(data.is_vs_bot);
                setSpectatorCount(data.spectator_count);
                
                // Connect WebSocket with spectator flag
                connectWebSocket(gameId, token);
                return true;
            } else {
                const error = await response.json();
                console.error('Failed to start spectating:', error);
                return false;
            }
        } catch (error) {
            console.error('Error starting spectate:', error);
            return false;
        }
    }, [connectWebSocket]);
    
    const stopSpectating = useCallback(async () => {
        if (!currentGameIdRef.current) return;
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        console.log(`🛑 Stopping spectate for game ${currentGameIdRef.current}`);
        
        try {
            await fetch(`${API_BASE_URL}/chess/games/${currentGameIdRef.current}/stop_spectating/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
        } catch (error) {
            console.error('Error stopping spectate:', error);
        }
        
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        
        setIsSpectating(false);
        setConnected(false);
        currentGameIdRef.current = null;
        setFen('');
        setGameOver(false);
        setResult(null);
        setSpectatorCount(0);
        setSpectators([]);
    }, []);
    
    const getPublicGames = useCallback(async (): Promise<SpectatorGame[]> => {
        const token = localStorage.getItem('token');
        if (!token) return [];
        
        try {
            const response = await fetch(`${API_BASE_URL}/chess/games/public_games/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.games || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching public games:', error);
            return [];
        }
    }, []);
    
    const sendInvitation = useCallback(async (toUserId: number, gameId?: number, message: string = ''): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        try {
            const response = await fetch(`${API_BASE_URL}/chess/games/invite/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to_user_id: toUserId,
                    game_id: gameId || currentGameIdRef.current,
                    invitation_type: 'spectate',
                    message,
                }),
            });
            
            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error sending invitation:', error);
            return false;
        }
    }, []);
    
    const getInvitations = useCallback(async (): Promise<any[]> => {
        const token = localStorage.getItem('token');
        if (!token) return [];
        
        try {
            const response = await fetch(`${API_BASE_URL}/chess/games/my_invitations/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.invitations || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching invitations:', error);
            return [];
        }
    }, []);
    
    const respondToInvitation = useCallback(async (invitationId: number, accept: boolean): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        try {
            const response = await fetch(`${API_BASE_URL}/chess/games/${invitationId}/respond_invitation/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accept }),
            });
            
            if (response.ok) {
                if (accept) {
                    const data = await response.json();
                    if (data.game_id) {
                        await startSpectating(data.game_id);
                    }
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error responding to invitation:', error);
            return false;
        }
    }, [startSpectating]);
    
    return {
        isSpectating,
        spectatorCount,
        spectators,
        fen,
        gameOver,
        result,
        whitePlayer,
        blackPlayer,
        isVsBot,
        connected,
        connecting,
        startSpectating,
        stopSpectating,
        getPublicGames,
        sendInvitation,
        getInvitations,
        respondToInvitation,
    };
}
