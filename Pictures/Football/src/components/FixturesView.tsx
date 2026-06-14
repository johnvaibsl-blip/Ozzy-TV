import React, { useState } from "react";
import { Calendar, Search, HelpCircle, Brain, Target, Sparkle } from "lucide-react";
import { TeamFlag } from "./TeamFlag";
import { Fixture } from "../data";

interface FixturesViewProps {
  TODAY_FIXTURES: Fixture[];
  handleFetchFullAnalysis: (home: string, away: string) => void;
}

export const FixturesView: React.FC<FixturesViewProps> = ({
  TODAY_FIXTURES,
  handleFetchFullAnalysis
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("All");

  // Format a fixture's kickoff date/time in the VIEWER's local timezone.
  // Falls back to server-provided strings if no ISO timestamp is available.
  const getLocalDateTime = (fix: Fixture) => {
    if (fix.kickoffISO) {
      const d = new Date(fix.kickoffISO);
      if (!isNaN(d.getTime())) {
        return {
          date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
      }
    }
    return { date: fix.date || "TODAY", time: fix.time };
  };


  const filteredFixtures = TODAY_FIXTURES.filter(fix => {
    const matchesSearch = 
      fix.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fix.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fix.homeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fix.awayCode.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesGroup = selectedGroupFilter === "All" || fix.group === selectedGroupFilter;
    
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="flex flex-col gap-6" id="fixtures_view_parent">
      
      {/* FILTER SEARCH CRITERIA */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Search tool */}
        <div className="w-full sm:max-w-xs relative">
          <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search teams (e.g. Brazil)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Group tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl overflow-x-auto w-full sm:w-auto">
          {["All", "A", "B", "C", "D"].map(grp => (
            <button
              key={grp}
              onClick={() => setSelectedGroupFilter(grp)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                selectedGroupFilter === grp
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {grp === "All" ? "All Groups" : `Group ${grp}`}
            </button>
          ))}
        </div>
      </div>

      {/* SCHEDULE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="fixtures_list_grid">
        {filteredFixtures.length > 0 ? (
          filteredFixtures.map(fixture => (
            <div key={fixture.id} className="bg-[#0b101d]/60 border border-slate-850 hover:border-slate-700/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between transition-all group">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 text-[10px] font-mono text-slate-500">
                  <span className="font-bold bg-slate-900 border border-slate-800 py-0.5 px-2 rounded text-slate-400">
                    GROUP {fixture.group}
                  </span>
                  <span>{getLocalDateTime(fixture).date} / SCHEDULED</span>
                </div>

                {/* Scoreboard line */}
                <div className="flex items-center justify-between my-5 font-semibold text-slate-100">
                  
                  {/* Home */}
                  <div className="flex items-center gap-2.5 max-w-[45%] truncate">
                    <TeamFlag code={fixture.homeCode} className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate text-xs">{fixture.homeTeam}</span>
                  </div>

                  {/* Hour */}
                  <span className="text-[10px] font-mono font-extrabold bg-blue-950/40 text-blue-400 border border-blue-900/40 py-1 px-2.5 rounded-lg shrink-0">
                    {getLocalDateTime(fixture).time}
                  </span>


                  {/* Away */}
                  <div className="flex items-center gap-2.5 max-w-[45%] truncate text-right justify-end">
                    <span className="truncate text-xs">{fixture.awayTeam}</span>
                    <TeamFlag code={fixture.awayCode} className="w-5 h-5 flex-shrink-0" />
                  </div>

                </div>
              </div>

              {/* Advanced interactive actions */}
              <button
                disabled={fixture.played}
                onClick={() => handleFetchFullAnalysis(fixture.homeTeam, fixture.awayTeam)}
                className={`w-full mt-4 py-2 px-3 rounded-lg border text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                  fixture.played 
                    ? "bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed"
                    : "bg-slate-950 hover:bg-indigo-600 border-slate-800 hover:border-indigo-500 hover:text-white text-slate-400 cursor-pointer group-hover:text-white"
                }`}
              >
                {fixture.played ? (
                  <>
                    <Brain size={12} className="text-slate-600" />
                    <span>Match Concluded</span>
                  </>
                ) : (
                  <>
                    <Brain size={12} className="text-slate-500 group-hover:text-white" />
                    <span>Generate AI Analysis</span>
                  </>
                )}
              </button>

            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-950/40 border border-dashed border-slate-850 py-16 px-4 rounded-2xl text-center">
            <HelpCircle size={36} className="text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No Matchups Located</h4>
            <p className="text-xs text-slate-500 mt-1">Adjust your team query text or structural group tags.</p>
          </div>
        )}
      </div>

    </div>
  );
};
