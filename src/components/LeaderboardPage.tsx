"use client";

import { useState, useEffect } from "react";
import { Star, Crown, DollarSign, TrendingUp } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

type Entry = {
  id: number; username: string; profile_picture?: string | null;
  total_earned: string; tasks_completed: number; level: string; rank: number;
};
type UserStats = { rank: number; total_earned: string; tasks_completed: number };
type Period = "daily" | "weekly" | "monthly" | "all_time";

const PERIODS: { key: Period; label: string }[] = [
  { key: "daily", label: "DAILY" }, { key: "weekly", label: "WEEKLY" },
  { key: "monthly", label: "MONTHLY" }, { key: "all_time", label: "ALL TIME" },
];

function getLevelBadge(level: string) {
  const c: Record<string, string> = { Gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", Silver: "bg-gray-400/20 text-gray-300 border-gray-400/30", Bronze: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
  return c[level] || "bg-primary/20 text-primary border-primary/30";
}

function fixImg(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `https://api.earnquestapp.com${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all_time");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [myStats, setMyStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t); else setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/leaderboard/?period=${period}&page=1&limit=20`, { headers: { Authorization: `Token ${token}` } }),
      fetch(`${API_BASE_URL}/leaderboard/my-stats/`, { headers: { Authorization: `Token ${token}` } }),
    ]).then(async ([r1, r2]) => {
      if (r1.ok) setEntries((await r1.json()).results || []);
      if (r2.ok) setMyStats(await r2.json());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [period, token]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">🏆 Leaderboard</h1>
          {myStats && <p className="text-sm text-muted-foreground mt-2">Your Rank: <span className="text-primary font-bold">#{myStats.rank}</span> · Earned: <span className="text-primary font-bold">${Number(myStats.total_earned).toFixed(2)}</span></p>}
        </div>

        {/* Period tabs */}
        <div className="flex justify-center gap-1 mb-8 flex-wrap">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${period === p.key ? "bg-primary text-white" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>{p.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No entries for this period</div>
        ) : (
          <>
            {/* Podium: 2nd | 1st | 3rd */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-10">
                {[top3[1], top3[0], top3[2]].map((e, i) => {
                  const isFirst = i === 1;
                  return (
                    <div key={e.id} className={`flex flex-col items-center ${isFirst ? "order-2 -mt-4" : "order-" + (i === 0 ? "1" : "3")}`}>
                      <div className={`relative w-${isFirst ? "20" : "16"} h-${isFirst ? "20" : "16"} rounded-full border-2 ${isFirst ? "border-yellow-400" : "border-muted"} overflow-hidden bg-muted/20 mb-2`}>
                        {e.profile_picture ? <img src={fixImg(e.profile_picture)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">{e.username?.[0]}</div>}
                        {isFirst && <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 h-5 w-5 text-yellow-400" />}
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate max-w-[80px]">{e.username}</span>
                      <span className="text-xs text-primary font-bold">${Number(e.total_earned).toFixed(2)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border mt-1 ${getLevelBadge(e.level)}`}>{e.level}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of list */}
            <div className="space-y-2">
              {rest.map((e) => (
                <div key={e.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-all">
                  <span className="text-sm font-bold text-muted-foreground w-8 text-center">#{e.rank}</span>
                  <div className="w-10 h-10 rounded-full bg-muted/20 overflow-hidden shrink-0">
                    {e.profile_picture ? <img src={fixImg(e.profile_picture)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">{e.username?.[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground block truncate">{e.username}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border mt-0.5 inline-block ${getLevelBadge(e.level)}`}>{e.level}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary block">${Number(e.total_earned).toFixed(2)}</span>
                    <span className="text-[10px] text-muted-foreground">{e.tasks_completed} tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
