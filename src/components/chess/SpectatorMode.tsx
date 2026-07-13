// components/chess/SpectatorMode.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSpectator } from '@/hooks/useSpectator';
import { Board2D } from '@/components/Board2D';
import { Users, Eye, Trophy, Bot, X, Copy, Check, Share2, ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/config';
import { Chess } from 'chess.js';

const Canvas = dynamic(
    () => import('@react-three/fiber').then(mod => mod.Canvas),
    { ssr: false }
);

const Experience = dynamic(
    () => import('@/app/(chess)/chess/experience/Experience').then(mod => mod.Experience),
    { ssr: false }
);

interface SpectatorModeProps {
    gameId: number;
    onClose?: () => void;
}

interface UserSearchResult {
    id: number;
    username: string;
    profile_picture?: string;
}

// Convert FEN to the required game status structure with pieces
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
    const [viewMode, setViewMode] = useState<'3d' | '2d'>('2d'); // Default to 2D to avoid 3D issues
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviting, setInviting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSpectatorsList, setShowSpectatorsList] = useState(false);
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
    
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
    
    // Search for users by username
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
    
    // Debounced search
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
        
        const result = await sendInvitation(targetUser.id, gameId, inviteMessage);
        
        if (result) {
            toast.success(`Invitation sent to ${targetUser.username}!`);
            setShowInviteModal(false);
            setInviteUsername('');
            setInviteMessage('');
            setSelectedUser(null);
            setSearchResults([]);
        } else {
            toast.error('Failed to send invitation');
        }
        
        setInviting(false);
    }, [selectedUser, searchResults, sendInvitation, gameId, inviteMessage]);
    
    const copyGameLink = useCallback(() => {
        const link = `${window.location.origin}/chess/play/${gameId}?spectator=true`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Game link copied!');
        setTimeout(() => setCopied(false), 2000);
    }, [gameId]);
    
    const shareGame = useCallback(async () => {
        const shareText = `Watch this chess game! Join as spectator: ${window.location.origin}/chess/play/${gameId}?spectator=true`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Chess Game Spectator',
                    text: shareText,
                });
            } catch (err) {
                console.error('Error sharing:', err);
                copyGameLink();
            }
        } else {
            copyGameLink();
        }
    }, [gameId, copyGameLink]);
    
    if (connecting) {
        return (
            <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Connecting to game...</p>
                </div>
            </div>
        );
    }
    
    if (!isSpectating || !connected) {
        return (
            <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
                <div className="text-center max-w-md p-6">
                    <Eye className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Spectator Mode</h2>
                    <p className="text-muted-foreground mb-6">
                        {!connected ? 'Connecting to game...' : 'Unable to connect to game'}
                    </p>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }
    
    // Convert FEN to full game status for 3D view
    const gameStatusFor3D = fenToGameStatus(fen, gameOver ? 'game_over' : 'active', isVsBot);
    
    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
            {/* Spectator Header */}
            <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Spectator Mode</span>
                    </div>
                    
                    {/* Game Info */}
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">White:</span>
                            <span className="font-medium text-foreground">{whitePlayer || 'Unknown'}</span>
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Black:</span>
                            <span className="font-medium text-foreground">{blackPlayer || 'Unknown'}</span>
                        </div>
                        {isVsBot && (
                            <div className="flex items-center gap-1 text-primary">
                                <Bot className="h-3 w-3" />
                                <span className="text-xs">vs Bot</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Spectator Count */}
                    <button
                        onClick={() => setShowSpectatorsList(!showSpectatorsList)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{spectatorCount}</span>
                    </button>
                    
                    {/* View Toggle */}
                    <button
                        onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                        className="px-3 py-1.5 rounded-full bg-muted/20 hover:bg-muted/40 text-sm font-medium transition-colors"
                    >
                        {viewMode === '3d' ? '2D View' : '3D View'}
                    </button>
                    
                    {/* Invite Button */}
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors flex items-center gap-1"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Invite
                    </button>
                    
                    {/* Copy Link */}
                    <button
                        onClick={copyGameLink}
                        className="px-3 py-1.5 rounded-full bg-muted/20 hover:bg-muted/40 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </div>
            
            {/* Spectators List Dropdown */}
            {showSpectatorsList && (
                <div className="absolute top-14 right-4 w-64 bg-card border border-border rounded-lg shadow-lg z-10">
                    <div className="p-2 border-b border-border">
                        <h3 className="text-sm font-semibold">Spectators ({spectators.length})</h3>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {spectators.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                                No spectators yet
                            </div>
                        ) : (
                            spectators.map((spectator) => (
                                <div key={spectator.id} className="p-2 hover:bg-muted/20 flex items-center gap-2">
                                    {spectator.profile_picture ? (
                                        <img
                                            src={spectator.profile_picture}
                                            alt={spectator.username}
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                            <span className="text-xs font-medium">
                                                {spectator.username?.[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-sm">{spectator.username}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            {/* Game Board */}
            <div className="flex-1 relative">
                {viewMode === '3d' ? (
                    <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
                        <Experience
                            game={gameStatusFor3D}
                            onMove={() => {}} // Spectators can't move
                            myColor="spectator"
                            gameActions={{} as any}
                            isSpectator={true}
                        />
                    </Canvas>
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
            
            {/* Spectator Instructions */}
            {!gameOver && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                    <p className="text-xs text-white">
                        <Eye className="h-3 w-3 inline mr-1" />
                        Spectator mode - watching live game
                    </p>
                </div>
            )}
            
            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
                    <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">Invite to Spectate</h2>
                            <button onClick={() => setShowInviteModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={inviteUsername}
                                    onChange={(e) => setInviteUsername(e.target.value)}
                                    placeholder="Search for username..."
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                
                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="mt-2 border border-border rounded-lg overflow-hidden bg-background">
                                        {searchResults.slice(0, 5).map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setInviteUsername(user.username);
                                                    setSearchResults([]);
                                                }}
                                                className="w-full px-3 py-2 text-left hover:bg-muted/20 flex items-center gap-2 transition-colors"
                                            >
                                                {user.profile_picture ? (
                                                    <img
                                                        src={user.profile_picture}
                                                        alt={user.username}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <span className="text-xs font-medium">
                                                            {user.username?.[0]?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="text-sm">{user.username}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                {searching && (
                                    <div className="mt-2 text-center text-sm text-muted-foreground">
                                        Searching...
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Message (optional)
                                </label>
                                <textarea
                                    value={inviteMessage}
                                    onChange={(e) => setInviteMessage(e.target.value)}
                                    placeholder="Join my game as a spectator!"
                                    rows={3}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>
                            
                            <button
                                onClick={handleInvite}
                                disabled={inviting || (!selectedUser && searchResults.length === 0)}
                                className="w-full py-2 bg-primary text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark"
                            >
                                {inviting ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .spectator-count-indicator {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    color: #8b5cf6;
                    z-index: 100;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                }
            `}</style>
        </div>
    );
}
