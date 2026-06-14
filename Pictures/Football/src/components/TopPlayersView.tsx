import React, { useState } from "react";
import { Award, Search, TrendingUp, HelpCircle, Star, Sparkle, Tag } from "lucide-react";
import { TeamFlag } from "./TeamFlag";
import { PlayerProfile } from "../data";

interface TopPlayersViewProps {
  PLAYER_PROFILES: PlayerProfile[];
  setSelectedPlayer: (player: PlayerProfile | null) => void;
}

export const TopPlayersView: React.FC<TopPlayersViewProps> = ({
  PLAYER_PROFILES,
  setSelectedPlayer
}) => {
  const [queryText, setQueryText] = useState<string>("");
  const [activePositionTab, setActivePositionTab] = useState<string>("All");

  const filteredPlayers = PLAYER_PROFILES.filter(player => {
    const matchesSearch = 
      player.name.toLowerCase().includes(queryText.toLowerCase()) ||
      player.team.toLowerCase().includes(queryText.toLowerCase());

    const matchesPosition = activePositionTab === "All" || player.position === activePositionTab;

    return matchesSearch && matchesPosition;
  });

  return (
    <div className="flex flex-col gap-6" id="top_players_view_parent">
      
      {/* FILTER PANEL AND SEARCH CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Search */}
        <div className="w-full sm:max-w-xs relative">
          <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search superstar players or nations..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* position tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl overflow-x-auto w-full sm:w-auto">
          {["All", "FW", "MF", "DF", "GK"].map(pTab => (
            <button
              key={pTab}
              onClick={() => setActivePositionTab(pTab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                activePositionTab === pTab
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {pTab === "All" ? "All Positions" : pTab === "FW" ? "Forwards" : pTab === "MF" ? "Midfielders" : pTab === "DF" ? "Defenders" : "Goalkeepers"}
            </button>
          ))}
        </div>
      </div>

      {/* PLYRS BENTO GRID ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="top_players_cards_grid">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => (
            <div
              key={player.name}
              onClick={() => setSelectedPlayer(player)}
              className="bg-[#0b101d]/60 border border-slate-850 hover:border-indigo-500/30 p-5 rounded-2xl shadow-xl flex flex-col justify-between transition-all cursor-pointer group hover:-translate-y-0.5"
            >
              <div>
                {/* Header positioning badge and rating flag */}
                <div className="flex items-center justify-between border-b border-indigo-900/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-indigo-950/40 border border-indigo-900 text-indigo-400 py-0.5 px-2 rounded-md">
                      {player.position}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">MARKET CRITERIA</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded text-amber-400">
                    <Star size={11} className="fill-amber-400" />
                    <span className="text-[10px] font-mono font-extrabold">{player.rating}</span>
                  </div>
                </div>

                {/* Profile brief */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center text-white shrink-0 font-display font-medium text-sm group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-colors">
                    {player.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors truncate text-sm leading-snug">
                      {player.name}
                    </h4>
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-mono mt-0.5">
                      <TeamFlag code={player.code} className="w-3.5 h-3.5 mr-0.5 shrink-0" />
                      <span>{player.team}</span>
                    </div>
                  </div>
                </div>

                {/* Valuation card */}
                <div className="bg-slate-950/80 p-3 border border-slate-900 rounded-xl mb-4 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-505 flex items-center gap-1.2 font-semibold">
                    <Tag size={12} className="text-slate-500" />
                    <span>Est. Transfer Value</span>
                  </span>
                  <span className="text-xs font-mono font-extrabold text-indigo-400">
                    {player.marketValue}
                  </span>
                </div>

                {/* Tactical Roles */}
                <div className="space-y-1.5 mb-3">
                  <span className="block text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">Tactical highlights</span>
                  <div className="flex flex-wrap gap-1">
                    {player.highlights.map(hl => (
                      <span key={hl} className="text-[9px] bg-slate-950 border border-slate-900 py-1 px-2.5 rounded-full text-slate-400 italic">
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* View interactive detail prompt */}
              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-semibold text-indigo-450 group-hover:text-indigo-300">
                <span>View Scouting File</span>
                <TrendingUp size={12} className="transform group-hover:translate-x-1 transition-transform" />
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-950/40 border border-dashed border-slate-850 py-16 px-4 rounded-2xl text-center">
            <HelpCircle size={36} className="text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No Superstar Records Found</h4>
            <p className="text-xs text-slate-500 mt-1">Refine your queries or change your position selectors.</p>
          </div>
        )}
      </div>

    </div>
  );
};
