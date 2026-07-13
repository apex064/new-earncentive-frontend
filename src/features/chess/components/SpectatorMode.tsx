// components/chess/SpectatorMode.tsx — Full version with 2D + 3D support

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSpectator } from '../hooks/useSpectator';
import { Board2D } from '../components/Board2D';
import { Users, Eye, Trophy, Bot, X, Copy, Check, Share2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import { Chess } from 'chess.js';

// 3D Chess — lazy loaded for performance
const Chess3D = {
  Canvas: null as any,
  Experience: null as any,
};

interface SpectatorModeProps {
    gameId: number;
    onClose?: () => void;
}

interface UserSearchResult {
    id: number;
    username: string;
    profile_picture?: string;
}

// Convert FEN to game status structure for 3D view
const fenToGameStatus = (fen: string, situation: string, isVsBot: boolean) => {
    if (!fen) {
        return {
            fen: fen,
            situation: situation,
            is_vs_bot: isVsBot,
            turn: 'white',
            white: { pieces: [] },
            black: { pieces: [] }
        };
    }

    try {
        const chess = new Chess(fen);
        const board = chess.board();
        const whitePieces: any[] = [];
        const blackPieces: any[] = [];

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const piece = board[rank][file];
                if (piece) {
                    const pieceData = {
                        id: `${piece.type}-${file}-${rank}`,
                        type: piece.type === 'p' ? 'pawn' :
                              piece.type === 'n' ? 'knight' :
                              piece.type === 'b' ? 'bishop' :
                              piece.type === 'r' ? 'rook' :
                              piece.type === 'q' ? 'queen' : 'king',
                        rank: 8 - rank,
                        file: String.fromCharCode(97 + file).toUpperCase(),
                        rival: piece.color === 'w' ? 'white' : 'black',
                        isMoved: false
                    };

                    if (piece.color === 'w') {
                        whitePieces.push(pieceData);
                    } else {
                        blackPieces.push(pieceData);
                    }
                }
            }
        }

        return {
            fen: fen,
            situation: situation,
            is_vs_bot: isVsBot,
            turn: chess.turn() === 'w' ? 'white' : 'black',
            white: { pieces: whitePieces },
            black: { pieces: blackPieces }
        };
    } catch (e) {
        console.error('Error converting FEN:', e);
        return {
            fen: fen,
            situation: situation,
            is_vs_bot: isVsBot,
            turn: 'white',
            white: { pieces: [] },
            black: { pieces: [] }
        };
    }
};

export default function SpectatorMode({ gameId, onClose }: SpectatorModeProps) {
    const [viewMode, setViewMode] = useState<'3d' | '2d'>('2d');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviting, setInviting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSpectatorsList, setShowSpectatorsList] = useState(false);
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
    // 3D loaded state
    const [threeDLoaded, setThreeDLoaded] = useState(false);

    const {
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
        sendInvitation,
    } = useSpectator();

    // Lazy load 3D components
    useEffect(() => {
        if (viewMode === '3d' && !threeDLoaded) {
            Promise.all([
                import('@react-three/fiber'),
                import('../experience/Experience'),
            ]).then(([fiber, exp]) => {
                Chess3D.Canvas = fiber.Canvas;
                Chess3D.Experience = exp.Experience;
                setThreeDLoaded(true);
            }).catch(() => {
                // 3D not available, fall back to 2D
                setViewMode('2d');
            });
        }
    }, [viewMode, threeDLoaded]);

    useEffect(() => {
        if (gameId && !isSpectating) {
            startSpectating(gameId);
        }

        return () => {
            if (isSpectating) {
                stopSpectating();
            }
        };
    }, [gameId, isSpectating, startSpectating, stopSpectating]);

    const handleClose = useCallback(() => {
        stopSpectating();
        if (onClose) onClose();
    }, [stopSpectating, onClose]);

    const searchUsers = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/chat/users/autocomplete/?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.users || []);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (inviteUsername) {
                searchUsers(inviteUsername);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [inviteUsername, searchUsers]);

    const handleInvite = useCallback(async () => {
        const targetUser = selectedUser || searchResults[0];

        if (!targetUser) {
            toast.error('Please select a user to invite');
            return;
        }

        setInviting(true);

        const success = await sendInvitation(targetUser.id, gameId, inviteMessage);

        if (success) {
            toast.success(`Invitation sent to ${targetUser.username}!`);
            setShowInviteModal(false);
            setInviteUsername('');
            setInviteMessage('');
            setSelectedUser(null);
        } else {
            toast.error('Failed to send invitation');
        }
        setInviting(false);
    }, [selectedUser, searchResults, sendInvitation, gameId, inviteMessage]);

    const handleCopyLink = useCallback(() => {
        const link = `${window.location.origin}/chess/spectate/${gameId}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            toast.success('Link copied!');
            setTimeout(() => setCopied(false), 2000);
        });
    }, [gameId]);

    const gameStatusFor3D = fenToGameStatus(fen, gameOver ? 'game_over' : 'active', isVsBot);

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-muted/20 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold">Spectating Game #{gameId}</h2>
                        <p className="text-xs text-muted-foreground">
                            {whitePlayer || 'White'} vs {blackPlayer || 'Black'}
                            {isVsBot && ' (Bot)'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Connection status */}
                    <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : connecting ? 'bg-yellow-500' : 'bg-red-500'}`} />

                    {/* Spectator count */}
                    <button onClick={() => setShowSpectatorsList(!showSpectatorsList)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 hover:bg-muted/40 text-sm font-medium transition-colors">
                        <Eye className="h-4 w-4" />
                        {spectatorCount}
                    </button>

                    {/* View mode toggle */}
                    <button
                        onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                        className="px-3 py-1.5 rounded-full bg-muted/20 hover:bg-muted/40 text-sm font-medium transition-colors"
                    >
                        {viewMode === '3d' ? '2D View' : '3D View'}
                    </button>

                    <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-sm font-medium transition-colors">
                        <Share2 className="h-4 w-4" />
                        Invite
                    </button>

                    <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 hover:bg-muted/40 text-sm font-medium transition-colors">
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>

                    <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-muted/20 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
                    <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Invite to Spectate</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <input
                                    type="text"
                                    value={inviteUsername}
                                    onChange={(e) => setInviteUsername(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full px-4 py-2 bg-background border border-border rounded-full text-foreground"
                                />
                                {searching && <p className="text-xs text-muted-foreground mt-1">Searching...</p>}
                                {searchResults.length > 0 && (
                                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                        {searchResults.map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => { setSelectedUser(user); setInviteUsername(user.username); }}
                                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-primary/20' : 'hover:bg-muted/20'}`}
                                            >
                                                <span>{user.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message (optional)</label>
                                <input
                                    type="text"
                                    value={inviteMessage}
                                    onChange={(e) => setInviteMessage(e.target.value)}
                                    placeholder="Come watch this game!"
                                    className="w-full px-4 py-2 bg-background border border-border rounded-full text-foreground"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowInviteModal(false)} className="flex-1 py-2 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors">Cancel</button>
                                <button onClick={handleInvite} disabled={inviting} className="flex-1 py-2 rounded-full bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50">
                                    {inviting ? 'Sending...' : 'Send Invite'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Spectators list */}
            {showSpectatorsList && (
                <div className="absolute top-16 right-4 z-20 bg-card rounded-xl p-3 shadow-lg border border-border max-h-80 overflow-y-auto w-56">
                    <h4 className="text-sm font-semibold mb-2">Spectators ({spectatorCount})</h4>
                    <div className="space-y-1">
                        {spectators.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No spectators</p>
                        ) : (
                            spectators.map((spectator, i) => (
                                <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-xs font-medium">
                                            {spectator.username?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm">{spectator.username}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Game Board */}
            <div className="flex-1 relative">
                {viewMode === '3d' && threeDLoaded ? (
                    <Chess3D.Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
                        <Chess3D.Experience
                            game={gameStatusFor3D as any}
                            onMove={() => {}} // Spectators can't move
                            myColor="spectator"
                            gameActions={{} as any}
                            isSpectator={true}
                        />
                    </Chess3D.Canvas>
                ) : (
                    <div className="h-full flex items-center justify-center p-4">
                        <Board2D
                            game={{
                                fen: fen,
                                situation: gameOver ? 'game_over' : 'active',
                                turn: fen?.split(' ')[1] === 'w' ? 'white' : 'black',
                                white: { pieces: [] },
                                black: { pieces: [] }
                            }}
                            onMove={() => {}} // Spectators can't move
                            myColor="spectator"
                            isSpectator={true}
                        />
                    </div>
                )}
            </div>

            {/* Game Status Overlay */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                    <div className="bg-card rounded-2xl p-6 text-center max-w-sm">
                        <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
                        <h2 className="text-xl font-bold text-foreground mb-2">Game Over!</h2>
                        <p className="text-lg font-semibold text-primary mb-4">
                            {result?.replace('_', ' ').toUpperCase()}
                        </p>
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
