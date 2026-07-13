'use client';

import { Users, Dices, Trophy, Clock, Bot, Crown, Sparkles, Zap, Flame, Gamepad2, Swords, Coins, AlertCircle } from 'lucide-react';
import { PiCoinsThin } from "react-icons/pi";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { usePlatformIcons } from '@/hooks/useDeviceDetection';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useState } from 'react';

export interface Game {
    id: string;
    creator: string;
    creator_id?: number;
    creator_username?: string;
    creator_profile_picture?: string | null;
    creator_level?: string;
    creator_rating?: number;
    opponent?: string | null;
    opponent_id?: number | null;
    opponent_username?: string;
    opponent_profile_picture?: string | null;
    opponent_level?: string;
    opponent_rating?: number;
    stake: string;
    status: string;
    is_vs_bot: boolean;
    bot_difficulty?: string;
    creator_ready?: boolean;
    opponent_ready?: boolean;
}

interface GameCardProps {
    game: Game;
    onClick: (game: Game) => void;
    username?: string;
}

function getDifficultyColor(difficulty?: string) {
    switch(difficulty) {
        case 'easy': return 'text-success bg-success/20 border-success/30';
        case 'medium': return 'text-warning bg-warning/20 border-warning/30';
        case 'hard': return 'text-destructive bg-destructive/20 border-destructive/30';
        default: return 'text-muted-foreground bg-muted/20 border-border';
    }
}

function getDifficultyIcon(difficulty?: string) {
    switch(difficulty) {
        case 'easy': return <Sparkles className="h-2.5 w-2.5" />;
        case 'medium': return <Zap className="h-2.5 w-2.5" />;
        case 'hard': return <Flame className="h-2.5 w-2.5" />;
        default: return <Gamepad2 className="h-2.5 w-2.5" />;
    }
}

// Status rail color: mirrors the badge semantics used elsewhere in the app
function getStatusRailColor(game: Game) {
    if (game.is_vs_bot) return 'bg-primary';
    if (game.status === 'waiting') return 'bg-warning';
    return 'bg-success';
}

export function GameCard({ game, onClick, username }: GameCardProps) {
    const { renderPlatformIcons } = usePlatformIcons();
    const { formatDollarAmount, isDollarMode } = useCurrency();
    const CurrencyIcon = isDollarMode ? HiOutlineBanknotes : PiCoinsThin;
    const [imgError, setImgError] = useState(false);

    const creatorDisplayName = game.creator_username || game.creator || 'Player';
    const opponentDisplayName = game.opponent_username || game.opponent || 'Waiting...';
    const isCreator = game.creator === username;
    const isWaiting = game.status === 'waiting';
    const hasOpponent = !!game.opponent && game.opponent !== 'Waiting...';

    return (
        <div
            className="relative flex-shrink-0 w-[30%] min-w-[105px] sm:w-32 bg-card rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group border border-border hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 flex flex-col h-[200px]"
            onClick={() => onClick(game)}
        >
            {/* Vertical status rail */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 z-10 ${getStatusRailColor(game)}`} />

            <div className="h-28 bg-gradient-to-br from-primary/30 to-primary/5 relative overflow-hidden flex-shrink-0">
                {/* Image instead of icons */}
                {!imgError ? (
                    <img
                        src="/chess.png"
                        alt="Chess game"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {game.is_vs_bot ? (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mb-1">
                                    <Bot className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-[8px] font-semibold text-primary">VS BOT</div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-1">
                                <div className="text-2xl text-foreground">♔</div>
                                <div className="text-primary font-bold text-xs">VS</div>
                                <div className="text-2xl text-foreground">♚</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Stake Badge - soft pill, tabular-nums */}
                <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm text-foreground px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm border border-border/50 flex items-center gap-0.5 z-10 tabular-nums">
                    <CurrencyIcon className="h-2.5 w-2.5 text-primary" />
                    {formatDollarAmount(Number(game.stake))}
                </div>

                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-1 py-0.5 rounded-md z-10">
                    {renderPlatformIcons({
                        osString: 'web',
                        size: 'sm',
                    })}
                </div>

                {game.is_vs_bot && game.bot_difficulty && (
                    <div className={`absolute bottom-2 left-2 ${getDifficultyColor(game.bot_difficulty)} px-1 py-0.5 rounded-full text-[8px] font-semibold border backdrop-blur-sm flex items-center gap-0.5 z-10`}>
                        {getDifficultyIcon(game.bot_difficulty)} {game.bot_difficulty[0].toUpperCase()}
                    </div>
                )}
            </div>

            <div className="p-2 pl-2.5 flex flex-col flex-grow bg-card">
                <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                    <Users className="h-2.5 w-2.5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground text-[9px] leading-tight text-center truncate group-hover:text-primary transition-colors">
                        {creatorDisplayName.length > 12 ? creatorDisplayName.slice(0, 10) + '...' : creatorDisplayName}
                        {isCreator && <span className="text-primary text-[7px] ml-0.5">(You)</span>}
                    </h3>
                    {game.creator_level && (
                        <span className={`text-[6px] px-0.5 py-0.5 rounded-full ${
                            game.creator_level === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                            game.creator_level === 'Silver' ? 'bg-gray-400/20 text-gray-400' :
                            game.creator_level === 'Bronze' ? 'bg-orange-600/20 text-orange-400' :
                            'bg-primary/20 text-primary'
                        }`}>
                            {game.creator_level[0]}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-center mb-1">
                    {hasOpponent ? (
                        <div className="flex items-center gap-1 text-[7px] text-muted-foreground">
                            <span>vs</span>
                            <span className="font-medium text-foreground">
                                {opponentDisplayName.length > 10 ? opponentDisplayName.slice(0, 8) + '...' : opponentDisplayName}
                            </span>
                            {game.opponent_level && (
                                <span className={`text-[6px] px-0.5 py-0.5 rounded-full ${
                                    game.opponent_level === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                                    game.opponent_level === 'Silver' ? 'bg-gray-400/20 text-gray-400' :
                                    game.opponent_level === 'Bronze' ? 'bg-orange-600/20 text-orange-400' :
                                    'bg-primary/20 text-primary'
                                }`}>
                                    {game.opponent_level[0]}
                                </span>
                            )}
                        </div>
                    ) : game.is_vs_bot ? (
                        <div className="flex items-center gap-1 text-[7px] text-muted-foreground">
                            <Bot className="h-2 w-2 text-primary" />
                            <span>AI Battle</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-[7px] text-warning">
                            <Clock className="h-2 w-2" />
                            <span>Waiting...</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-1">
                    <button
                        className={`w-full py-1 rounded-lg font-medium transition-all text-[8px] flex items-center justify-center gap-1 ${
                            game.status !== 'waiting' && !game.is_vs_bot
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/80 text-white shadow-md hover:shadow-lg'
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(game);
                        }}
                        disabled={game.status !== 'waiting' && !game.is_vs_bot}
                    >
                        {game.is_vs_bot ? (
                            <>
                                <Dices className="h-2.5 w-2.5" />
                                Play Bot
                            </>
                        ) : game.status === 'waiting' ? (
                            <>
                                <Trophy className="h-2.5 w-2.5" />
                                Join
                            </>
                        ) : (
                            'In Progress'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
