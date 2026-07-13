"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Flame, Rocket, FileText, ClipboardList, LayoutGrid, List,
  Swords, Zap, Plus, Hash, Clock, Search, X, Sparkles,
  DollarSign, Loader2, LogIn, Bot, Trophy,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useOffers } from "@/hooks/useOffers";
import { useTasks } from "@/hooks/useTasks";
import { useSurveys } from "@/hooks/useSurveys";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { OfferCard } from "@/components/OfferCard";
import { TaskCard } from "@/components/TaskCard";
import { SurveyCard } from "@/components/SurveyCard";
import { TournamentEventCard } from "@/components/TournamentEventCard";
import { GameCard, type Game } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import type { Offer } from "@/utils/offers";
import { API_BASE_URL } from "@/lib/config";

type Lobby = Game;
type BotLobby = {
  id: number;
  stake: number;
  expires_in: number;
  bot_difficulty: string;
  type: string;
  is_free: boolean;
  creator_username?: string;
  creator_level?: string;
};
type MatchmakingStatus = {
  in_queue: boolean; queue_id?: number; wait_time?: number;
  remaining_seconds?: number; stake?: number; will_match_bot_at?: number;
  match_data?: { lobby_id: number; stake: number; is_vs_bot: boolean; bot_difficulty?: string };
};

const tournamentEvents = [
  { id: 1, title: "$5,000 Referral Frenzy", subtitle: "Invite friends and climb the leaderboard", badgeText: "Tournament", buttonText: "Join Now", imageUrl: "https://earncentive.com/magnific__background__64778.png", imageAlt: "Tournament", rotateClass: "rotate-3", route: "/leadf" },
  { id: 2, title: "Ultimate Earnings Race", subtitle: "Earn more and dominate the rankings", badgeText: "Earnings", buttonText: "Compete Now", imageUrl: "https://earncentive.com/magnific__background__58436.png", imageAlt: "Earnings", rotateClass: "-rotate-3", route: "/lead" },
  { id: 3, title: "Double Notik Rewards", subtitle: "Complete offers and earn bonus payouts", badgeText: "Offerwall Bonus", buttonText: "Earn Now", imageUrl: "https://earncentive.com/logos/notik_logo.png", imageAlt: "Bonus", rotateClass: "rotate-3", route: "/dashboard" },
  { id: 4, title: "Bonus Code Boost", subtitle: "Redeem bonus codes for more earnings", badgeText: "Bonus codes", buttonText: "Claim Bonus", imageUrl: "https://earncentive.com/discord.png", imageAlt: "Bonus", rotateClass: "-rotate-3", route: "/rewards" },
];

export default function ChessLobby() {
  const navigate = useNavigate();
  const { firstName } = useProfile();
  const { recommendedOffers: _r, gamingOffers: _g, premiumOffers, loading: offersLoading } = useOffers();
  const { tasks, loading: tasksLoading } = useTasks();
  const { surveys, loading: surveysLoading } = useSurveys();

  const [userToken, setUserToken] = useState("");
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [botLobbies, setBotLobbies] = useState<BotLobby[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Lobby | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showMatchmake, setShowMatchmake] = useState(false);
  const [createStake, setCreateStake] = useState(0);
  const [createVsBot, setCreateVsBot] = useState(false);
  const [createBotDiff, setCreateBotDiff] = useState("medium");
  const [creating, setCreating] = useState(false);
  const [joinId, setJoinId] = useState("");
  const [joining, setJoining] = useState(false);
  const [mmStake, setMmStake] = useState(0);
  const [mmStatus, setMmStatus] = useState<MatchmakingStatus | null>(null);
  const [mmLoading, setMmLoading] = useState(false);
  const mmInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);

  useEffect(() => { const t = localStorage.getItem("token"); if (t) setUserToken(t); }, []);

  const fetchGames = useCallback(async () => {
    if (!userToken) { setLoadingGames(false); return; }
    try {
      const [lRes, bRes] = await Promise.all([
        fetch(`${API_BASE_URL}/chess/lobby/active_lobbies/`, { headers: { Authorization: `Token ${userToken}` } }),
        fetch(`${API_BASE_URL}/chess/games/bot_lobbies/`, { headers: { Authorization: `Token ${userToken}` } }),
      ]);
      if (!mounted.current) return;
      if (lRes.ok) setLobbies((await lRes.json()) || []);
      if (bRes.ok) setBotLobbies((await bRes.json()).lobbies || []);
    } catch { /* ignore */ }
    finally { if (mounted.current) setLoadingGames(false); }
  }, [userToken]);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (userToken) { fetchGames(); fetchInterval.current = setInterval(fetchGames, 5000); return () => { if (fetchInterval.current) clearInterval(fetchInterval.current); }; }
  }, [userToken, fetchGames]);

  useEffect(() => {
    if (!mmStatus?.in_queue) return;
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chess/games/matchmaking_status/`, { headers: { Authorization: `Token ${userToken}` } });
        if (!mounted.current) return;
        if (res.ok) {
          const d = await res.json();
          setMmStatus(d);
          if (!d.in_queue) { if (mmInterval.current) clearInterval(mmInterval.current); setShowMatchmake(false);
            if (d.match_data?.lobby_id) { toast.success("Match found!"); navigate({ to: "/dashboard/chess/ready/$id", params: { id: String(d.match_data.lobby_id) } }); }
            else { toast.success("Match found!"); fetchGames(); }
          }
        }
      } catch { /* ignore */ }
    };
    mmInterval.current = setInterval(poll, 1000);
    return () => { if (mmInterval.current) clearInterval(mmInterval.current); };
  }, [mmStatus?.in_queue, userToken, navigate, fetchGames]);

  const joinLobby = async (id: string) => {
    try {
      const r = await fetch(`${API_BASE_URL}/chess/lobby/${id}/join_lobby/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` } });
      if (r.ok) navigate({ to: "/dashboard/chess/ready/$id", params: { id } });
      else toast.error((await r.json()).error || "Failed");
    } catch { toast.error("Network error"); }
  };
  const joinBot = async (id: number) => {
    try {
      const r = await fetch(`${API_BASE_URL}/chess/games/${id}/join_bot_lobby/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` } });
      if (r.ok) { const d = await r.json(); navigate({ to: "/dashboard/chess/ready/$id", params: { id: String(d.lobby_id) } }); }
      else toast.error((await r.json()).error || "Failed");
    } catch { toast.error("Network error"); }
  };
  const joinById = async () => {
    if (!joinId.trim()) { toast.error("Enter ID"); return; }
    setJoining(true);
    try {
      const r = await fetch(`${API_BASE_URL}/chess/lobby/${joinId}/join_lobby/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` } });
      if (r.ok) navigate({ to: "/dashboard/chess/ready/$id", params: { id: joinId } });
      else toast.error((await r.json()).error || "Failed");
    } catch { toast.error("Network error"); }
    finally { setJoining(false); setShowJoin(false); setJoinId(""); }
  };
  const createLobby = async () => {
    setCreating(true);
    try {
      const r = await fetch(`${API_BASE_URL}/chess/lobby/create_lobby/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` }, body: JSON.stringify({ stake: createStake, is_vs_bot: createVsBot, bot_difficulty: createVsBot ? createBotDiff : undefined }) });
      if (r.ok) { const d = await r.json(); setShowCreate(false); navigate({ to: "/dashboard/chess/ready/$id", params: { id: String(d.id) } }); }
      else toast.error((await r.json()).error || "Failed");
    } catch { toast.error("Network error"); }
    finally { setCreating(false); }
  };
  const startBotGame = async () => {
    setCreating(true);
    try {
      const r = await fetch(`${API_BASE_URL}/chess/games/start_bot_game/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` }, body: JSON.stringify({ stake: createStake, bot_difficulty: createBotDiff }) });
      if (r.ok) { const d = await r.json(); navigate({ to: "/dashboard/chess/play/$id", params: { id: String(d.game_id) } }); }
      else toast.error((await r.json()).error || "Failed");
    } catch { toast.error("Network error"); }
    finally { setCreating(false); setShowCreate(false); }
  };
  const startMatchmaking = async () => {
    setMmLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/chess/games/join_matchmaking/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Token ${userToken}` }, body: JSON.stringify({ stake: mmStake }) });
      if (r.ok) { const d = await r.json(); setMmStatus({ in_queue: true, queue_id: d.queue_id, wait_time: 0, remaining_seconds: d.search_duration, stake: mmStake, will_match_bot_at: d.search_duration }); }
      else toast.error((await r.json()).error || "Failed");
    } catch { toast.error("Network error"); }
    finally { setMmLoading(false); }
  };
  const cancelMatchmaking = async () => {
    if (mmInterval.current) clearInterval(mmInterval.current);
    try { await fetch(`${API_BASE_URL}/chess/games/cancel_matchmaking/`, { method: "POST", headers: { Authorization: `Token ${userToken}` } }); } catch { /* ignore */ }
    setMmStatus(null); setShowMatchmake(false);
  };

  const allGames: Game[] = [
    ...lobbies,
    ...botLobbies.map((b) => ({ id: String(b.id), creator: 0, creator_username: b.creator_username || "Bot Arena", creator_level: b.creator_level, opponent: null, stake: String(b.stake), status: "waiting" as const, is_vs_bot: true, bot_difficulty: b.bot_difficulty })),
  ];

  const loading = offersLoading || tasksLoading || surveysLoading || loadingGames;

  if (loading && allGames.length === 0) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl lg:max-w-full px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Premium Offers */}
        {premiumOffers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><Flame className="h-5 w-5 text-warning" /> Premium Offers <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full border border-warning/30">Premium</span></h2>
            </div>
            <div className="lg:-mx-2"><HorizontalScroll id="premium"><div className="flex space-x-4 pb-4">{premiumOffers.map((o: Offer) => <OfferCard key={o.id} offer={o} onClick={() => {}} />)}</div></HorizontalScroll></div>
          </div>
        )}

        {/* Chess Games */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Swords className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Chess Games</h2><span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{allGames.length} Available</span></div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowJoin(true)} className="text-muted-foreground hover:text-primary text-xs font-medium flex items-center gap-1"><Hash className="h-3 w-3" /> Join by ID</button>
              <button onClick={() => setShowMatchmake(true)} className="text-muted-foreground hover:text-primary text-xs font-medium flex items-center gap-1"><Zap className="h-3 w-3" /> Quick Match</button>
              <button onClick={() => setShowCreate(true)} className="text-muted-foreground hover:text-primary text-xs font-medium flex items-center gap-1"><Plus className="h-3 w-3" /> Create Game</button>
            </div>
          </div>
          {allGames.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-2xl border border-border">
              <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-semibold mb-2">No Active Games</h3>
              <p className="text-muted-foreground text-sm mb-4">Be the first to create a game!</p>
              <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-primary text-white rounded-full font-medium">Create Game</button>
            </div>
          ) : (
            <div className="lg:-mx-2"><HorizontalScroll id="chess"><div className="flex space-x-4 pb-4">{allGames.map((g) => <GameCard key={g.id} game={g} onClick={(game) => { setSelectedGame(game); setShowGameModal(true); }} username={firstName || undefined} />)}</div></HorizontalScroll></div>
          )}
        </div>

        {/* Surveys */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-muted-foreground" /> Featured Surveys</h2></div>
          {surveys.length > 0 ? (
            <div className="lg:-mx-2"><HorizontalScroll id="surveys"><div className="flex space-x-4 pb-4">{surveys.map((s: any) => <SurveyCard key={s.id} survey={s} onClick={() => s.external_url && window.open(s.external_url, "_blank")} />)}</div></HorizontalScroll></div>
          ) : (
            <div className="text-center py-10 bg-card rounded-2xl border border-border"><ClipboardList className="h-7 w-7 text-muted-foreground mx-auto mb-3" /><h3 className="text-base font-semibold mb-1">No Surveys Available</h3><p className="text-muted-foreground text-sm">Check back later</p></div>
          )}
        </div>

        {/* Tournaments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /> Tournaments & Events <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Limited Time</span></h2></div>
          <div className="lg:-mx-2"><HorizontalScroll id="tournaments"><div className="flex space-x-4 pb-4">{tournamentEvents.map((e) => <TournamentEventCard key={e.id} {...e} />)}</div></HorizontalScroll></div>
        </div>

        {/* Tasks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-primary" /> Micro Tasks</h2></div>
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border"><ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">No Tasks Available</h3><p className="text-muted-foreground text-sm">Check back later</p></div>
          ) : (
            <div className="lg:-mx-2"><HorizontalScroll id="tasks"><div className="flex space-x-4 pb-4">{tasks.map((t: any) => <TaskCard key={t.id} task={t} onClick={() => {}} onStart={async (id) => {
              const token = localStorage.getItem("token"); if (!token) return;
              const res = await fetch(`${API_BASE_URL}/tasks/start/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Token ${token}` }, body: JSON.stringify({ task_id: id }) });
              const d = await res.json();
              if (res.ok && d.user_task_id) { toast.success("Task started!"); navigate({ to: "/dashboard/tasks" }); }
              else toast.error(d.error || "Failed");
            }} />)}</div></HorizontalScroll></div>
          )}
        </div>
      </div>

      {/* Game Modal */}
      {showGameModal && selectedGame && (
        <GameModal game={selectedGame} onClose={() => setShowGameModal(false)} onJoin={(id) => { selectedGame.is_vs_bot ? joinBot(Number(id)) : joinLobby(id); }} userToken={userToken} username={firstName || undefined} />
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Create Game</h2><button onClick={() => setShowCreate(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Stake ($0-$5)</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="number" step="0.5" min="0" max="5" value={createStake} onChange={(e) => setCreateStake(parseFloat(e.target.value))} className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-full" /></div></div>
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-muted/20 rounded-xl"><input type="checkbox" checked={createVsBot} onChange={(e) => setCreateVsBot(e.target.checked)} className="w-4 h-4 rounded" /><span className="text-sm font-medium">Play against Bot</span></label>
              {createVsBot && <select value={createBotDiff} onChange={(e) => setCreateBotDiff(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-full"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>}
              <div className="flex gap-3 pt-2"><button onClick={() => setShowCreate(false)} className="flex-1 py-2 bg-muted rounded-full">Cancel</button><button onClick={createVsBot ? startBotGame : createLobby} disabled={creating} className="flex-1 py-2 bg-primary text-white rounded-full font-medium disabled:opacity-50">{creating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Create"}</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Join by ID Modal */}
      {showJoin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowJoin(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Join by ID</h2><button onClick={() => setShowJoin(false)}><X className="h-5 w-5" /></button></div>
            <input value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Lobby ID" className="w-full px-4 py-2 bg-background border border-border rounded-full mb-4" />
            <div className="flex gap-3"><button onClick={() => setShowJoin(false)} className="flex-1 py-2 bg-muted rounded-full">Cancel</button><button onClick={joinById} disabled={joining} className="flex-1 py-2 bg-primary text-white rounded-full font-medium disabled:opacity-50">{joining ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Join"}</button></div>
          </div>
        </div>
      )}

      {/* Matchmaking Modal */}
      {showMatchmake && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => !mmStatus?.in_queue && setShowMatchmake(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            {mmStatus?.in_queue ? (
              <>
                <div className="text-center mb-6"><Search className="h-12 w-12 text-primary animate-pulse mx-auto mb-3" /><h2 className="text-xl font-bold">Finding Opponent...</h2><p className="text-sm text-muted-foreground mt-1">Stake: ${mmStatus.stake?.toFixed(2)}</p><div className="mt-3 inline-flex items-center gap-2 bg-muted/20 rounded-full px-3 py-1"><Clock className="h-3 w-3" /><span className="text-xs font-mono">{mmStatus.remaining_seconds}s</span></div></div>
                <button onClick={cancelMatchmaking} className="w-full py-2.5 bg-destructive text-white rounded-full font-medium">Cancel</button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6"><Zap className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold">Quick Match</h2></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-2">Stake ($0-$5)</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="number" step="0.5" min="0" max="5" value={mmStake} onChange={(e) => setMmStake(parseFloat(e.target.value))} className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-full" /></div></div>
                <p className="text-xs text-muted-foreground mb-4 bg-primary/5 rounded-xl p-3 border-l-2 border-primary">If no human opponent in 10s, you'll match with a bot.</p>
                <div className="flex gap-3"><button onClick={() => setShowMatchmake(false)} className="flex-1 py-2 bg-muted rounded-full">Cancel</button><button onClick={startMatchmaking} disabled={mmLoading} className="flex-1 py-2 bg-primary text-white rounded-full font-medium disabled:opacity-50">{mmLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Find Match"}</button></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
