"use client";

import { useState, useEffect } from "react";
import {
  X,
  Users,
  Coins,
  Clock,
  Bot,
  Crown,
  Shield,
  AlertCircle,
  Loader2,
  User,
  ChevronRight,
  Star,
  Target,
  Sparkles,
  Zap,
  Flame,
  Gamepad2,
  Trophy,
  Swords,
} from "lucide-react";
import { PiCoinsThin } from "react-icons/pi";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { Game } from "@/components/GameCard";
import { API_BASE_URL } from "@/lib/config";
import { UserProfileModal, useUserProfile } from "@/components/UserProfileModal";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

interface GameModalProps {
  game: Game;
  onClose: () => void;
  onJoin?: (gameId: string) => void;
  userToken?: string;
  username?: string;
}

type UserProfileType = {
  user_id: number;
  username: string;
  profile_picture: string | null;
  level?: string;
  earnings?: number;
  games_played?: number;
  win_rate?: number;
  rating?: number;
};

function fixImageUrl(url: string | null) {
  if (!url) return null;
  if (url.includes("rebackend-ij74.onrender.com"))
    return url.replace(/^http:/, "https:");
  if (url.startsWith("/media/"))
    return `https://rebackend-ij74.onrender.com${url}`;
  return url.replace(/^http:/, "https:");
}

export function GameModal({
  game,
  onClose,
  onJoin,
  userToken,
  username,
}: GameModalProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { formatDollarAmount, isDollarMode } = useCurrency();
  const CurrencyIcon = isDollarMode ? HiOutlineBanknotes : PiCoinsThin;
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.body.style.overflow = "";
    };
  }, []);

  const {
    selectedUser,
    showUserProfile,
    userProfileLoading,
    fetchUserProfile,
    closeUserProfile,
  } = useUserProfile();

  const handleUserClick = (userId: number) => {
    console.log("Opening profile for user:", userId);
    if (userId) {
      fetchUserProfile(userId);
    }
  };

  const isCreator = game.creator_username === username;
  const hasOpponent =
    !!game.opponent && game.opponent !== 0 && game.opponent !== null;
  const isWaiting = game.status === "waiting";
  const canJoin = isWaiting && !isCreator && !game.is_vs_bot;

  const creatorDisplayName = game.creator_username || "Player";
  const creatorProfilePicture = game.creator_profile_picture;
  const creatorLevel = game.creator_level;
  const creatorRating = game.creator_rating;

  const opponentDisplayName = game.opponent_username || "Opponent";
  const opponentProfilePicture = game.opponent_profile_picture;
  const opponentLevel = game.opponent_level;
  const opponentRating = game.opponent_rating;

  const handleJoin = async () => {
    if (!onJoin) return;

    if (game.is_vs_bot) {
      setIsJoining(true);
      await onJoin(game.id);
      setIsJoining(false);
      return;
    }

    if (!canJoin) return;
    setIsJoining(true);
    await onJoin(game.id);
    setIsJoining(false);
  };

  const getDifficultyDetails = () => {
    switch (game.bot_difficulty) {
      case "easy":
        return {
          icon: <Sparkles className="h-3 w-3" />,
          color: "text-success",
          bg: "bg-success/10",
          border: "border-success/30",
          description: "Perfect for beginners learning the game",
          strength: 800,
        };
      case "medium":
        return {
          icon: <Zap className="h-3 w-3" />,
          color: "text-warning",
          bg: "bg-warning/10",
          border: "border-warning/30",
          description: "Balanced challenge for casual players",
          strength: 1200,
        };
      case "hard":
        return {
          icon: <Flame className="h-3 w-3" />,
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          description: "Expert level - only for masters!",
          strength: 1800,
        };
      default:
        return {
          icon: <Gamepad2 className="h-3 w-3" />,
          color: "text-primary",
          bg: "bg-primary/10",
          border: "border-primary/30",
          description: "Challenge the AI",
          strength: 1000,
        };
    }
  };

  const difficulty = getDifficultyDetails();

  // Top accent rail color mirrors card status rail semantics
  const accentRailColor = game.is_vs_bot
    ? "bg-primary"
    : isWaiting
      ? "bg-warning"
      : "bg-success";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className={`bg-card border border-border flex flex-col relative ${
            isMobile
              ? "w-full h-full rounded-none"
              : "rounded-2xl max-w-md w-full max-h-[90vh]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent rail */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 z-10 ${accentRailColor} ${isMobile ? "" : "rounded-t-2xl"}`}
          />

          <div className="flex-1 overflow-y-auto">
            <div className={isMobile ? "p-4 pt-5" : "p-5 pt-6"}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {game.is_vs_bot ? (
                    <>
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      Bot Game
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                        <Swords className="h-4 w-4 text-primary" />
                      </div>
                      Chess Match
                    </>
                  )}
                </h3>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Game Image/Header - Updated with actual image */}
              <div className="h-32 bg-gradient-to-br from-primary/30 to-primary/5 rounded-xl mb-4 relative overflow-hidden">
                {/* Chess Board Image */}
                {!imgError ? (
                  <img
                    src="/chess.png"
                    alt="Chess game"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {game.is_vs_bot ? (
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-1">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-xs font-semibold text-primary">
                          CHESS BOT
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {game.bot_difficulty?.toUpperCase()} Difficulty
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <div className="text-3xl mb-1 text-foreground">♔</div>
                          <div className="text-[10px] font-semibold text-foreground">
                            White
                          </div>
                        </div>
                        <div className="text-primary font-bold text-xl">VS</div>
                        <div className="text-center">
                          <div className="text-3xl mb-1 text-foreground">♚</div>
                          <div className="text-[10px] font-semibold text-foreground">
                            Black
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Stake Badge - soft pill, tabular-nums */}
                <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm border border-border/50 flex items-center gap-1 z-10 tabular-nums">
                  <CurrencyIcon className="h-3 w-3 text-primary" />
                  {formatDollarAmount(Number(game.stake))}
                </div>

                {/* Status Badge - soft pill */}
                <div
                  className={`absolute top-2 left-2 ${isWaiting ? "bg-warning/20 text-warning border-warning/30" : "bg-success/20 text-success border-success/30"} px-2 py-0.5 rounded-full text-[9px] font-semibold border z-10`}
                >
                  {isWaiting ? (
                    <>
                      <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                      Waiting
                    </>
                  ) : (
                    <>
                      <Trophy className="h-2.5 w-2.5 inline mr-0.5" />
                      In Progress
                    </>
                  )}
                </div>
              </div>

              {/* Players Section */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Players
                </h4>

                <div className="space-y-2">
                  {/* Creator */}
                  <div
                    className="relative overflow-hidden flex items-center justify-between p-2 pl-3 bg-background rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => {
                      if (game.creator) {
                        console.log(
                          "Opening creator profile, ID:",
                          game.creator,
                        );
                        handleUserClick(game.creator);
                      }
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-card border border-border">
                        {creatorProfilePicture ? (
                          <img
                            className="w-full h-full object-cover"
                            src={fixImageUrl(creatorProfilePicture)}
                            alt={creatorDisplayName}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallback =
                                  parent.querySelector(".creator-fallback");
                                if (fallback)
                                  fallback.classList.remove("hidden");
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`creator-fallback flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-sm ${creatorProfilePicture ? "hidden" : "flex"}`}
                        >
                          {creatorDisplayName?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm flex items-center gap-1">
                          {creatorDisplayName}
                          {isCreator && (
                            <span className="text-primary text-[10px]">
                              (You)
                            </span>
                          )}
                          {!game.is_vs_bot && (
                            <Crown className="h-3 w-3 text-warning" />
                          )}
                        </div>
                        {creatorLevel && (
                          <div className="text-[9px] text-muted-foreground">
                            {creatorLevel}
                          </div>
                        )}
                        {creatorRating && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 tabular-nums">
                            <Star className="h-2 w-2" />
                            Rating: {creatorRating}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  {/* VS Divider */}
                  {!game.is_vs_bot && (
                    <div className="flex justify-center">
                      <div className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        VS
                      </div>
                    </div>
                  )}

                  {/* Opponent / Bot */}
                  {game.is_vs_bot ? (
                    <div
                      className={`relative overflow-hidden flex items-center justify-between p-2 pl-3 rounded-xl border ${difficulty.bg} ${difficulty.border}`}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${difficulty.color.replace("text-", "bg-")}`}
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-card flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm flex items-center gap-1">
                            Chess Bot
                            <span className={`text-[9px] ${difficulty.color}`}>
                              {game.bot_difficulty?.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[9px] text-muted-foreground flex items-center gap-1 tabular-nums">
                            <Target className="h-2 w-2" />
                            Strength: {difficulty.strength}
                          </div>
                        </div>
                      </div>
                      {difficulty.icon}
                    </div>
                  ) : hasOpponent ? (
                    <div
                      className="relative overflow-hidden flex items-center justify-between p-2 pl-3 bg-background rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => {
                        if (game.opponent) {
                          console.log(
                            "Opening opponent profile, ID:",
                            game.opponent,
                          );
                          handleUserClick(game.opponent);
                        }
                      }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-success" />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-card border border-border">
                          {opponentProfilePicture ? (
                            <img
                              className="w-full h-full object-cover"
                              src={fixImageUrl(opponentProfilePicture)}
                              alt={opponentDisplayName}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const fallback =
                                    parent.querySelector(".opponent-fallback");
                                  if (fallback)
                                    fallback.classList.remove("hidden");
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`opponent-fallback flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-sm ${opponentProfilePicture ? "hidden" : "flex"}`}
                          >
                            {opponentDisplayName?.[0]?.toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {opponentDisplayName}
                            {game.opponent_username === username && (
                              <span className="text-primary text-[10px] ml-1">
                                (You)
                              </span>
                            )}
                          </div>
                          {opponentLevel && (
                            <div className="text-[9px] text-muted-foreground">
                              {opponentLevel}
                            </div>
                          )}
                          {opponentRating && (
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 tabular-nums">
                              <Star className="h-2 w-2" />
                              Rating: {opponentRating}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  ) : (
                    // Icon-container empty state
                    <div className="relative overflow-hidden flex items-center gap-2 p-2 pl-3 bg-warning/10 rounded-xl border border-warning/30">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning" />
                      <div className="w-8 h-8 rounded-full bg-warning/15 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4 text-warning animate-pulse" />
                      </div>
                      <div>
                        <div className="font-semibold text-warning text-sm">
                          Waiting for opponent...
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          Share the lobby ID with a friend!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Details */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="bg-background p-2 rounded-xl border border-border">
                  <div className="flex items-center gap-1 mb-1">
                    <CurrencyIcon className="h-3 w-3 text-primary" />
                    <span className="text-[9px] text-muted-foreground">
                      Stake
                    </span>
                  </div>
                  <div className="text-base font-bold text-foreground tabular-nums">
                    {formatDollarAmount(Number(game.stake))}
                  </div>
                  <div className="text-[8px] text-muted-foreground">
                    Winner takes all
                  </div>
                </div>

                <div className="bg-background p-2 rounded-xl border border-border">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-primary" />
                    <span className="text-[9px] text-muted-foreground">
                      Status
                    </span>
                  </div>
                  <div className="text-base font-bold text-foreground capitalize">
                    {game.status}
                  </div>
                  <div className="text-[8px] text-muted-foreground">
                    {isWaiting ? "Waiting for players" : "Game in progress"}
                  </div>
                </div>
              </div>

              {/* Warning / Info */}
              {isWaiting && !isCreator && !game.is_vs_bot && (
                <div className="relative overflow-hidden bg-warning/10 border border-warning/30 rounded-xl p-2 pl-3 mb-5">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning" />
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-warning font-medium">
                        Ready to play?
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        Joining this game means you agree to play for the stake
                        amount. Make sure you have enough balance!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {game.is_vs_bot ? (
                  <button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="flex-1 bg-primary hover:bg-primary/80 text-white py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        Play Against Bot
                      </>
                    )}
                  </button>
                ) : canJoin ? (
                  <button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="flex-1 bg-primary hover:bg-primary/80 text-white py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4" />
                        Join Game
                      </>
                    )}
                  </button>
                ) : isCreator ? (
                  <button
                    disabled
                    className="flex-1 bg-muted text-muted-foreground py-2 rounded-xl font-semibold cursor-not-allowed text-sm"
                  >
                    {isWaiting ? "Waiting for opponent..." : "Game in Progress"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-muted text-muted-foreground py-2 rounded-xl font-semibold cursor-not-allowed text-sm"
                  >
                    Game in Progress
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-background border border-border hover:bg-primary/10 text-foreground rounded-xl font-semibold transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={showUserProfile}
        loading={userProfileLoading}
        onClose={closeUserProfile}
      />
    </>
  );
}
