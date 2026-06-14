import React from "react";
import { BarChart3, TrendingUp, ShieldAlert, Award, Star, Activity } from "lucide-react";
import { TeamFlag } from "./TeamFlag";

interface StatisticsViewProps {
  syncedStats: any[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  syncedStats
}) => {
  if (!syncedStats || syncedStats.length === 0) {
    return (
      <div className="flex flex-col gap-6" id="statistics_view_parent">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-400" />
            <span>FIFA World Cup 2026 Sports analytical leaderboards</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Detailed metrics parsed directly from live team feeds and analytical telemetry databases.
          </p>
        </div>

        <div className="bg-[#0b101d]/60 border border-slate-850 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-500">
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">No Stats Data Synced</h3>
            <p className="text-xs text-slate-450 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Please enter valid API credentials in the Admin configuration gate and click 'Sync Live Data' to fetch actual player statistics and leaderboards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const scorersList = syncedStats.map((s, idx) => ({
    name: s.name,
    team: s.team,
    code: s.teamCode || "UNK",
    goals: parseInt(s.goals) || 0,
    assists: parseInt(s.assists) || 0,
    pos: s.position || "FW"
  }));

  const playmakersList = scorersList
    .filter(s => s.assists > 0)
    .sort((a, b) => b.assists - a.assists);

  // Group players by team and calculate team goals for the chart
  const teamGoals: Record<string, { team: string; code: string; goals: number }> = {};
  scorersList.forEach(s => {
    if (!teamGoals[s.code]) {
      teamGoals[s.code] = { team: s.team, code: s.code, goals: 0 };
    }
    teamGoals[s.code].goals += s.goals;
  });
  const topTeamsByGoals = Object.values(teamGoals)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);
  const maxTeamGoals = topTeamsByGoals.length > 0 ? topTeamsByGoals[0].goals : 1;

  return (
    <div className="flex flex-col gap-6" id="statistics_view_parent">
      
      {/* Overview stats header banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
          <BarChart3 size={18} className="text-indigo-400" />
          <span>FIFA World Cup 2026 Sports analytical leaderboards</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Detailed metrics parsed directly from live team feeds and analytical telemetry databases. Click on sync in the Overview tab to update this with search grounding results.
        </p>
      </div>

      {/* Triple grid column leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="stats_leaderboards_grid">
        
        {/* Top Scorers */}
        <div className="bg-[#0b101d]/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="font-semibold text-white tracking-tight text-sm flex items-center gap-2">
              <TrendingUp size={15} className="text-rose-500" />
              <span>Top Goalscorers</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Goals index</span>
          </div>

          <div className="space-y-2">
            {scorersList.map((player, idx) => (
              <div key={idx} className="p-3 bg-slate-950/75 border border-slate-900 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500 w-3 pr-1">{idx + 1}</span>
                  <TeamFlag code={player.code} className="w-5 h-5 shadow-sm" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{player.name}</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{player.pos} · {player.team}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-extrabold text-rose-455 bg-rose-955/40 border border-rose-900/40 px-2.5 py-1 rounded-[6px]">
                    {player.goals} G
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Playmakers */}
        <div className="bg-[#0b101d]/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="font-semibold text-white tracking-tight text-sm flex items-center gap-2">
              <Award size={15} className="text-indigo-400" />
              <span>Top Assists creators</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Key Passes</span>
          </div>

          <div className="space-y-2">
            {playmakersList.length > 0 ? (
              playmakersList.map((player, idx) => (
                <div key={idx} className="p-3 bg-slate-950/75 border border-slate-900 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 w-3 pr-1">{idx + 1}</span>
                    <TeamFlag code={player.code} className="w-5 h-5 shadow-sm" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{player.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{player.pos} · {player.team}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-extrabold text-indigo-455 bg-indigo-955/40 border border-indigo-900/40 px-2.5 py-1 rounded-[6px]">
                      {player.assists} A
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                NO ASSISTS DATA SYNCHRONIZED
              </div>
            )}
          </div>
        </div>

        {/* Top Rated Players */}
        <div className="bg-[#0b101d]/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="font-semibold text-white tracking-tight text-sm flex items-center gap-2">
              <Activity size={15} className="text-emerald-500" />
              <span>Top Rated Players</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Rating</span>
          </div>

          <div className="space-y-2">
            {scorersList.length > 0 ? (
              [...scorersList]
                .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
                .slice(0, 10)
                .map((player, idx) => (
                <div key={idx} className="p-3 bg-slate-950/75 border border-slate-900 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 w-3 pr-1">{idx + 1}</span>
                    <TeamFlag code={player.code} className="w-5 h-5 shadow-sm" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{player.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{player.pos} · {player.team}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-400">{player.goals}G {player.assists}A</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-450 bg-emerald-955/40 border border-emerald-900/40 px-2.5 py-1 rounded-[6px]">
                      {player.goals + player.assists}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                NO PLAYER DATA SYNCHRONIZED
              </div>
            )}
          </div>
        </div>

      </div>

      {/* TEAM STRENGTHS HORIZONTAL CHANNELS */}
      <div className="bg-[#0b101d]/60 border border-slate-800 rounded-2xl p-6 shadow-xl" id="team_strengths_comparison_visual">
        <h3 className="text-sm font-semibold text-white tracking-tight mb-5 border-b border-slate-900 pb-3 uppercase tracking-wider text-slate-350">
          Global Team Attacking Intensity Projections (Goals Per Match)
        </h3>

        <div className="space-y-4">
          {topTeamsByGoals.length > 0 ? (
            topTeamsByGoals.map(item => (
              <div key={item.code} className="grid grid-cols-12 items-center text-xs font-semibold text-slate-300">
                <div className="col-span-3 flex items-center gap-2.5">
                  <TeamFlag code={item.code} className="w-5 h-5 shadow-sm" />
                  <span>{item.team}</span>
                </div>

                <div className="col-span-7 pr-4">
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${maxTeamGoals > 0 ? (item.goals / maxTeamGoals) * 100 : 0}%` }} />
                  </div>
                </div>

                <span className="col-span-2 text-right font-mono font-bold text-slate-400">
                  {item.goals} G
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-xs text-slate-500 font-mono">
              NO TEAM DATA AVAILABLE
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
