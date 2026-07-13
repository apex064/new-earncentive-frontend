import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Swords, Plus, Hash, Zap, Search, X, Sparkles,
  DollarSign, Loader2, LogIn, Bot, Clock,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

type Lobby = {
  id: string;
  creator: number;
  creator_username?: string;
  creator_profile_picture?: string | null;
  creator_level?: string;
  creator_rating?: number;
  opponent: number | null;
  opponent_username?: string;
  stake: string;
  status: string;
  is_vs_bot: boolean;
};

type BotLobby = {
  id: number;
  stake: number;
  expires_in: number;
  bot_difficulty: string;
  type: string;
  is_free: boolean;
  creator_username?: string;
};

type MatchmakingStatus = {
  in_queue: boolean;
  queue_id?: number;
  wait_time?: number;
  remaining_seconds?: number;
  stake?: number;
  will_match_bot_at?: number;
};

export default function ChessLobby() {
  const navigate = useNavigate();
  const [userToken, setUserToken] = useState("");
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [botLobbies, setBotLobbies] = useState<BotLobby[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createStake, setCreateStake] = useState(0);
  const [createVsBot, setCreateVsBot] = useState(false);
  const [createBotDiff, setCreateBotDiff] = useState("medium");
  const [creating, setCreating] = useState(false);

  // Join by ID modal
  const [showJoin, setShowJoin] = useState(false);
  const [joinId, setJoinId] = useState("");
  const [joining, setJoining] = useState(false);

  // Matchmaking
  const [showMatchmake, setShowMatchmake] = useState(false);
  const [mmStake, setMmStake] = useState(0);
  const [mmStatus, setMmStatus] = useState<MatchmakingStatus | null>(null);
  const [mmLoading, setMmLoading] = useState(false);
  const mmInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUserToken(token);
  }, []);

  const fetchGames = useCallback(async () => {
    if (!userToken) { setLoading(false); return; }
    try {
      const [lRes, bRes] = await Promise.all([
        fetch(`${API_BASE_URL}/chess/lobby/active_lobbies/`, {
          headers: { Authorization: `Token ${userToken}` },
        }),
        fetch(`${API_BASE_URL}/chess/games/bot_lobbies/`, {
          headers: { Authorization: `Token ${userToken}` },
        }),
      ]);
      if (!mounted.current) return;
      if (lRes.ok) setLobbies((await lRes.json()) || []);
      if (bRes.ok) setBotLobbies((await bRes.json()).lobbies || []);
    } catch (e) {
      console.error("Error fetching games:", e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (userToken) {
      fetchGames();
      fetchInterval.current = setInterval(fetchGames, 5000);
      return () => { if (fetchInterval.current) clearInterval(fetchInterval.current); };
    }
  }, [userToken, fetchGames]);

  // Poll matchmaking
  useEffect(() => {
    if (!mmStatus?.in_queue) return;
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chess/games/matchmaking_status/`, {
          headers: { Authorization: `Token ${userToken}` },
        });
        if (!mounted.current) return;
        if (res.ok) {
          const data = await res.json();
          setMmStatus(data);
          if (!data.in_queue) {
            if (mmInterval.current) clearInterval(mmInterval.current);
            setShowMatchmake(false);
            if (data.match_data?.lobby_id) {
              toast.success("Match found!");
              navigate({ to: "/dashboard/chess/ready/$id", params: { id: String(data.match_data.lobby_id) } });
            } else {
              toast.success("Match found! Refreshing...");
              fetchGames();
            }
          }
        }
      } catch { /* ignore */ }
    };
    mmInterval.current = setInterval(poll, 1000);
    return () => { if (mmInterval.current) clearInterval(mmInterval.current); };
  }, [mmStatus?.in_queue, userToken, navigate, fetchGames]);

  const joinLobby = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chess/lobby/${id}/join_lobby/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` },
      });
      if (res.ok) {
        navigate({ to: "/dashboard/chess/ready/$id", params: { id } });
      } else {
        toast.error((await res.json()).error || "Failed to join");
      }
    } catch { toast.error("Network error"); }
  };

  const joinBot = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chess/games/${id}/join_bot_lobby/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        navigate({ to: "/dashboard/chess/ready/$id", params: { id: String(data.lobby_id) } });
      } else {
        toast.error((await res.json()).error || "Failed to join");
      }
    } catch { toast.error("Network error"); }
  };

  const joinById = async () => {
    if (!joinId.trim()) { toast.error("Enter a lobby ID"); return; }
    setJoining(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chess/lobby/${joinId}/join_lobby/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` },
      });
      if (res.ok) {
        navigate({ to: "/dashboard/chess/ready/$id", params: { id: joinId } });
      } else {
        toast.error((await res.json()).error || "Failed to join");
      }
    } catch { toast.error("Network error"); }
    finally { setJoining(false); setShowJoin(false); setJoinId(""); }
  };

  const createLobby = async () => {
    if (createStake < 0 || createStake > 5) { toast.error("Stake must be $0-$5"); return; }
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chess/lobby/create_lobby/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` },
        body: JSON.stringify({ stake: createStake, is_vs_bot: createVsBot, bot_difficulty: createVsBot ? createBotDiff : undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowCreate(false);
        navigate({ to: "/dashboard/chess/ready/$id", params: { id: String(data.id) } });
      } else {
        toast.error((await res.json()).error || "Failed to create");
      }
    } catch { toast.error("Network error"); }
    finally { setCreating(false); }
  };

  const startBotGame = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chess/games/start_bot_game/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` },
        body: JSON.stringify({ stake: createStake, bot_difficulty: createBotDiff }),
      });
      if (res.ok) {
        const data = await res.json();
        navigate({ to: "/dashboard/chess/play/$id", params: { id: String(data.game_id) } });
      } else {
        toast.error((await res.json()).error || "Failed to start");
      }
    } catch { toast.error("Network error"); }
    finally { setCreating(false); setShowCreate(false); }
  };

  const startMatchmaking = async () => {
    setMmLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chess/games/join_matchmaking/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` },
        body: JSON.stringify({ stake: mmStake }),
      });
      if (res.ok) {
        const data = await res.json();
        setMmStatus({ in_queue: true, queue_id: data.queue_id, wait_time: 0, remaining_seconds: data.search_duration, stake: mmStake, will_match_bot_at: data.search_duration });
      } else {
        toast.error((await res.json()).error || "Failed");
      }
    } catch { toast.error("Network error"); }
    finally { setMmLoading(false); }
  };

  const cancelMatchmaking = async () => {
    if (mmInterval.current) clearInterval(mmInterval.current);
    try {
      await fetch(`${API_BASE_URL}/chess/games/cancel_matchmaking/`, {
        method: "POST", headers: { Authorization: `Token ${userToken}` },
      });
    } catch { /* ignore */ }
    setMmStatus(null);
    setShowMatchmake(false);
  };

  const allGames = [
    ...lobbies.map((l) => ({ ...l, _type: "lobby" as const })),
    ...botLobbies.map((b) => ({ id: String(b.id), creator: 0, creator_username: b.creator_username || "Bot Arena", opponent: null, stake: String(b.stake), status: "waiting", is_vs_bot: true, _type: "bot" as const, bot_difficulty: b.bot_difficulty })),
  ];

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Chess Arena</h1>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{allGames.length} games</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowJoin(true)} className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1"><Hash className="h-3 w-3" /> Join by ID</button>
            <button onClick={() => setShowMatchmake(true)} className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1"><Zap className="h-3 w-3" /> Quick Match</button>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium"><Plus className="h-4 w-4 inline mr-1" /> Create</button>
          </div>
        </div>

        {/* Game list */}
        {allGames.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Active Games</h3>
            <p className="text-muted-foreground text-sm mb-4">Be the first to create a game or play against a bot!</p>
            <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-primary text-white rounded-full font-medium">Create Game</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allGames.map((game) => (
              <div key={game.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer" onClick={() => game._type === "bot" ? joinBot(Number(game.id)) : joinLobby(game.id)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {game.is_vs_bot ? <Bot className="h-4 w-4 text-purple-400" /> : <Swords className="h-4 w-4 text-primary" />}
                    <span className="text-sm font-medium text-foreground">{game.is_vs_bot ? "Bot Game" : "PvP"}</span>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{game.is_vs_bot ? (game as any).bot_difficulty || "medium" : game.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{game.creator_username || `#${game.id}`}</span>
                  <span className="text-lg font-bold text-foreground tabular-nums">${Number(game.stake).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Game</h2>
              <button onClick={() => setShowCreate(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stake ($0-$5)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="number" step="0.5" min="0" max="5" value={createStake} onChange={(e) => setCreateStake(parseFloat(e.target.value))} className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-full" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-muted/20 rounded-xl">
                <input type="checkbox" checked={createVsBot} onChange={(e) => setCreateVsBot(e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium">Play against Bot</span>
              </label>
              {createVsBot && (
                <select value={createBotDiff} onChange={(e) => setCreateBotDiff(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-full">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2 bg-muted rounded-full">Cancel</button>
                <button onClick={createVsBot ? startBotGame : createLobby} disabled={creating} className="flex-1 py-2 bg-primary text-white rounded-full font-medium disabled:opacity-50">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join by ID Modal */}
      {showJoin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowJoin(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Join by ID</h2>
              <button onClick={() => setShowJoin(false)}><X className="h-5 w-5" /></button>
            </div>
            <input value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Lobby ID" className="w-full px-4 py-2 bg-background border border-border rounded-full mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowJoin(false)} className="flex-1 py-2 bg-muted rounded-full">Cancel</button>
              <button onClick={joinById} disabled={joining} className="flex-1 py-2 bg-primary text-white rounded-full font-medium disabled:opacity-50">
                {joining ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matchmaking Modal */}
      {showMatchmake && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => !mmStatus?.in_queue && setShowMatchmake(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            {mmStatus?.in_queue ? (
              <>
                <div className="text-center mb-6">
                  <Search className="h-12 w-12 text-primary animate-pulse mx-auto mb-3" />
                  <h2 className="text-xl font-bold">Finding Opponent...</h2>
                  <p className="text-sm text-muted-foreground mt-1">Stake: ${mmStatus.stake?.toFixed(2)}</p>
                  <div className="mt-3 inline-flex items-center gap-2 bg-muted/20 rounded-full px-3 py-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-mono">{mmStatus.remaining_seconds}s remaining</span>
                  </div>
                </div>
                <button onClick={cancelMatchmaking} className="w-full py-2.5 bg-destructive text-white rounded-full font-medium">Cancel</button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Quick Match</h2>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Stake ($0-$5)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="number" step="0.5" min="0" max="5" value={mmStake} onChange={(e) => setMmStake(parseFloat(e.target.value))} className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-full" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4 bg-primary/5 rounded-xl p-3 pl-4 border-l-2 border-primary">
                  If no human opponent found in 10s, you'll be matched with a bot.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowMatchmake(false)} className="flex-1 py-2 bg-muted rounded-full">Cancel</button>
                  <button onClick={startMatchmaking} disabled={mmLoading} className="flex-1 py-2 bg-primary text-white rounded-full font-medium disabled:opacity-50">
                    {mmLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Find Match"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
