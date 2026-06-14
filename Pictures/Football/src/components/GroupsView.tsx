import React, { useState } from "react";
import { Users, Award, ShieldAlert } from "lucide-react";
import { TeamFlag } from "./TeamFlag";
import { PlayerProfile } from "../data";

interface GroupsViewProps {
  GROUP_STANDINGS: any;
  PLAYER_PROFILES: PlayerProfile[];
  setSelectedPlayer: (player: PlayerProfile | null) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  GROUP_STANDINGS,
  PLAYER_PROFILES,
  setSelectedPlayer
}) => {
  const groupsList = ["A", "B", "C", "D"];
  const [activeGroupIndex, setActiveGroupIndex] = useState<string>("All");

  return (
    <div className="flex flex-col gap-6" id="groups_view_parent">
      
      {/* Group selector control top panel */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Users size={18} className="text-emerald-400" />
            <span>Tournament Group Stage Standings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            The top two nations of each tier progress to the direct 2026 knockout rounds. Click on any national federation to view team roster details.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl">
          {["All", "A", "B", "C", "D"].map(v => (
            <button
              key={v}
              onClick={() => setActiveGroupIndex(v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                activeGroupIndex === v
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {v === "All" ? "Display All" : `Group ${v}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Group Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="groups_grids_parent">
        {groupsList
          .filter(gName => activeGroupIndex === "All" || gName === activeGroupIndex)
          .map(groupName => {
            const list = GROUP_STANDINGS[groupName] || [];
            return (
              <div key={groupName} className="bg-[#0b101d]/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  
                  {/* Table title */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                    <span className="text-xs font-mono font-bold text-white bg-blue-900/10 border border-blue-950 px-2.5 py-1 rounded">
                      TIER GROUP {groupName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">QUALIFYING MATRIX</span>
                  </div>

                  {/* Header labels */}
                  <div className="grid grid-cols-12 text-[10px] font-mono font-bold text-slate-500 px-2 py-1 mb-1 border-b border-slate-900 pb-2">
                    <span className="col-span-1">#</span>
                    <span className="col-span-5">NATION</span>
                    <span className="col-span-1 text-center">GP</span>
                    <span className="col-span-1 text-center">W</span>
                    <span className="col-span-1 text-center">D</span>
                    <span className="col-span-1 text-center">L</span>
                    <span className="col-span-1 text-center">GD</span>
                    <span className="col-span-1 text-right">PTS</span>
                  </div>

                  {/* Table rows */}
                  <div className="space-y-1">
                    {list.map((row: any, idx: number) => {
                      const isTopTwo = idx < 2;
                      const isSubTwo = idx === 2;
                      return (
                        <div
                          key={row.team}
                          onClick={() => {
                            const player = PLAYER_PROFILES.find(p => p.team === row.team);
                            if (player) setSelectedPlayer(player);
                          }}
                          className={`grid grid-cols-12 items-center text-xs font-semibold p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isTopTwo 
                              ? "bg-slate-950/60 border-emerald-900/15 hover:border-emerald-600/30 hover:bg-slate-950"
                              : isSubTwo 
                              ? "bg-slate-950/60 border-amber-900/15 hover:border-amber-600/20 hover:bg-slate-950"
                              : "bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-950"
                          }`}
                        >
                          {/* Row position */}
                          <span className={`col-span-1 font-mono text-[10px] font-extrabold ${isTopTwo ? "text-emerald-400" : isSubTwo ? "text-amber-400" : "text-slate-600"}`}>
                            {idx + 1}
                          </span>

                          {/* Flag + Name */}
                          <div className="col-span-5 flex items-center gap-2">
                            <TeamFlag code={row.code} className="w-4 h-4 shadow-sm" />
                            <span className="truncate text-slate-200">{row.team}</span>
                          </div>

                          {/* GP */}
                          <span className="col-span-1 text-center font-mono text-[10px] text-slate-400">
                            {row.played}
                          </span>

                          {/* W */}
                          <span className="col-span-1 text-center font-mono text-[10px] text-slate-400">
                            {row.won}
                          </span>

                          {/* D */}
                          <span className="col-span-1 text-center font-mono text-[10px] text-slate-400">
                            {row.drawn}
                          </span>

                          {/* L */}
                          <span className="col-span-1 text-center font-mono text-[10px] text-slate-400">
                            {row.lost}
                          </span>

                          {/* GD */}
                          <span className={`col-span-1 text-center font-mono text-[10px] font-bold ${row.gd > 0 ? "text-emerald-500" : row.gd < 0 ? "text-rose-500" : "text-slate-500"}`}>
                            {row.gd > 0 ? `+${row.gd}` : row.gd}
                          </span>

                          {/* Points */}
                          <span className={`col-span-1 text-right font-mono font-bold text-sm ${isTopTwo ? "text-emerald-400" : isSubTwo ? "text-amber-400" : "text-slate-400"}`}>
                            {row.points}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Qualifiers footer message */}
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Nations 1-2 advance to round 16</span>
                  </div>
                  <span>QUALIFIED PILL ACTIVE</span>
                </div>

              </div>
            );
          })}
      </div>

    </div>
  );
};
