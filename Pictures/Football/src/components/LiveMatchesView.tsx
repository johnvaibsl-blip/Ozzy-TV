import React from "react";
import { Tv, Award } from "lucide-react";
import { TeamFlag } from "./TeamFlag";
import { LiveMatch } from "../data";

interface LiveMatchesViewProps {
  liveMatches: LiveMatch[];
}

export const LiveMatchesView: React.FC<LiveMatchesViewProps> = ({
  liveMatches
}) => {
  return (
    <div className="flex flex-col gap-6" id="live_matches_view_parent">
      
      {/* REAL-TIME TELEMETRY STREAM STATUS */}
      <div className="rounded-2xl bg-[#090d16] border border-blue-950/40 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Tv size={18} className="text-blue-400 animate-pulse" />
            <span>Real-Time World Cup Telemetry Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            Displaying actual, search-grounded live matches and stats synced from current global stadium metrics. Mock calculations are disabled to enforce integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950/35 border border-blue-900/40 rounded-lg px-3.5 py-2 font-mono font-bold">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>TELEMETRY METRICS SYNCHRONIZED</span>
          </span>
        </div>
      </div>

      {/* DETAILED DOUBLE GRID COLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="detailed_live_match_matrix">
        {liveMatches.length > 0 ? (
          liveMatches.map(match => (
            <div key={match.id} className="bg-[#0b101d]/60 border border-slate-800 rounded-2xl overflow-hidden p-6 shadow-xl flex flex-col justify-between">
              
              {/* Header info */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-5">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900 px-2.5 py-0.5 rounded">
                    LIVE MATCH
                  </span>
                  
                  <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${
                    match.status === "FT" 
                      ? "bg-slate-800 text-slate-400" 
                      : "bg-rose-500/10 text-rose-400 animate-pulse border border-rose-500/15"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${match.status === "FT" ? "bg-slate-600" : "bg-rose-500 animate-ping"}`} />
                    <span>{match.status === "FT" ? "FULL TIME" : match.displayTime ? `${match.displayTime}` : `${match.minute}' MIN`}</span>
                  </span>
                </div>

                {/* Huge Stadium scoreboard */}
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 mb-5 flex items-center justify-between text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-blue-900/5 to-transparent pointer-events-none" />

                  {/* Home */}
                  <div className="flex-1 flex flex-col items-center">
                    <TeamFlag code={match.homeCode} className="w-10 h-10 shadow-lg" />
                    <span className="text-xs font-semibold text-slate-200 mt-2 truncate max-w-[100px]">{match.homeTeam}</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">{match.homeCode}</span>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center px-4 shrink-0">
                    <div className="text-3xl font-bold font-mono text-white tracking-widest bg-slate-900 px-4 py-1.5 rounded border border-slate-800">
                      {match.homeScore} : {match.awayScore}
                    </div>
                    <span className="text-[9px] font-mono text-indigo-400 font-semibold tracking-wider uppercase mt-2">LIVE PROJECTION</span>
                  </div>

                  {/* Away */}
                  <div className="flex-1 flex flex-col items-center">
                    <TeamFlag code={match.awayCode} className="w-10 h-10 shadow-lg" />
                    <span className="text-xs font-semibold text-slate-200 mt-2 truncate max-w-[100px]">{match.awayTeam}</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">{match.awayCode}</span>
                  </div>
                </div>

                {/* Match Stats progress lines */}
                <div className="space-y-3.5 bg-[#03060f]/90 border border-slate-900 rounded-xl p-4 mb-5">
                  <h4 className="text-[11px] font-mono font-bold text-slate-400 tracking-widest uppercase">Match telemetry stats</h4>
                  
                  {/* Possession bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Possession: {match.possessionHome}%</span>
                      <span>{100-match.possessionHome}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${match.possessionHome}%` }} />
                      <div className="h-full bg-slate-600 transition-all duration-300" style={{ width: `${100-match.possessionHome}%` }} />
                    </div>
                  </div>

                  {/* Shots on Target */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Shots on target: {match.shotsHome}</span>
                      <span>{match.shotsAway}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                      {(() => {
                        const total = match.shotsHome + match.shotsAway || 1;
                        const hPct = Math.round((match.shotsHome / total) * 100);
                        return (
                          <>
                            <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${hPct}%` }} />
                            <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${100-hPct}%` }} />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Match Event Timeline scroll log */}
                <div className="bg-[#03060f]/90 border border-slate-900 rounded-xl p-4 max-h-[160px] overflow-y-auto space-y-2.5">
                  <h4 className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase mb-1">Live Commentary Logs</h4>
                  
                  {match.events.slice().reverse().map((evt, eIdx) => (
                    <div key={eIdx} className="text-xs flex items-start gap-2 border-l-2 border-slate-800 pl-3.5 py-0.5">
                      <span className="font-mono text-indigo-400 font-bold shrink-0">{evt.minute}'</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-200">
                          {evt.player} <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 rounded px-1 text-slate-400 ml-1.5">{evt.type}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{evt.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Static clean footer */}
              <div className="mt-5 pt-4 border-t border-slate-900/60 text-center">
                <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest">
                  STREAM CHANNELS LOCKED • SECURE METRIC LINE
                </span>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-2 bg-[#0b101d]/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-500">
              <Tv size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">No Matches Currently Live</h3>
              <p className="text-xs text-slate-450 mt-1.5 max-w-sm mx-auto leading-relaxed">
                There are no active matches in progress at this time. Check the **Fixtures** tab for today's match schedule or wait for the next game clock to boot.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
