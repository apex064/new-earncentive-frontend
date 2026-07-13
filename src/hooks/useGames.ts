import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/config';

export interface Game {
    id: string;
    creator: string;
    creator_id?: number;
    opponent?: string | null;
    opponent_id?: number | null;
    stake: string;
    status: string;
    is_vs_bot: boolean;
    bot_difficulty?: string;
    creator_ready?: boolean;
    opponent_ready?: boolean;
}

export function useGames(userToken: string | null) {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGames = useCallback(async () => {
        if (!userToken) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/chess/lobby/active_lobbies/`, {
                headers: {
                    Authorization: `Token ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setGames(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to fetch games:', response.status);
                setError('Failed to load games');
            }
        } catch (error) {
            console.error('Error fetching games:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [userToken]);

    useEffect(() => {
        fetchGames();
        const interval = setInterval(fetchGames, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [fetchGames]);

    return { games, loading, error, refetch: fetchGames };
}