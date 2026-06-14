import React from "react";
import { Sliders, Award, Star, ArrowRight, Brain, Target, Shield } from "lucide-react";
import { TeamFlag } from "./TeamFlag";
import { Team } from "../data";

interface TeamsViewProps {
  sortedTeamsList: any[];
  teamTunings: Record<string, { attack: number; defense: number }>;
  setTeamTunings: React.Dispatch<React.SetStateAction<Record<string, { attack: number; defense: number }>>>;
  focusedTuningTeam: string;
  setFocusedTuningTeam: (code: string) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  sortedTeamsList,
  teamTunings,
  setTeamTunings,
  focusedTuningTeam,
  setFocusedTuningTeam
}) => {
  const currentTeam = sortedTeamsList.find(t => t.code === focusedTuningTeam) || sortedTeamsList[0];
  const tuning = teamTunings[focusedTuningTeam] || { attack: currentTeam.attack, defense: currentTeam.defense };

  const handleSliderChange = (type: "attack" | "defense", value: number) => {
    setTeamTunings(prev => ({
      ...prev,
      [focusedTuningTeam]: {
        ...prev[focusedTuningTeam],
        [type]: value
      }
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="teams_view_parent">
      
      {/* COLUMN 1 & 2: TEAM SELECTOR & SLIDERS (OCCUPIES 2 COLUMNS) */}
      <div className="lg:col-span-2 flex flex-col gap-6" id="teams_main_segment">
        
        {/* Sliders description banner */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Sliders size={18} className="text-indigo-400" />
            <span>AI Power Rankings Configurator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
            Configure coefficients on attack output velocity and defensive compactness metrics. Recalculate global hierarchies, and inspect overall ratings shifts.
          </p>
        </div>

        {/* Directory of Teams */}
        <div className="bg-[#0b101d]/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-900 pb-2">
            Country Catalog Index
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {sortedTeamsList.map(t => {
              const isActive = t.code === focusedTuningTeam;
              return (
                <button
                  key={t.code}
                  onClick={() => setFocusedTuningTeam(t.code)}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600/25 border-indigo-500 text-white shadow-lg shadow-indigo-950/30 font-semibold"
                      : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800"
                  }`}
                >
                  <TeamFlag code={t.code} className="w-8 h-8 rounded-full shadow" />
                  <span className="text-xs mt-2.5 truncate w-full">{t.name}</span>
                  <span className="text-[10px] font-mono font-bold mt-1 text-slate-500 uppercase">{t.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders adjustment view */}
        <div className="bg-[#0b101d]/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <TeamFlag code={focusedTuningTeam} className="w-10 h-10 shadow" />
              <div>
                <h4 className="font-semibold text-white tracking-tight text-base">{currentTeam.name} fine-tuning</h4>
                <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">Parameters: {focusedTuningTeam}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg text-emerald-400">
              <Star size={14} className="fill-emerald-400" />
              <span className="text-sm font-mono font-extrabold">{currentTeam.rating.toFixed(1)}</span>
              <span className="text-[10px] font-mono text-slate-500">SCORE</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Attack Strength */}
            <div className="bg-slate-950/80 p-4 border border-slate-900 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Target size={14} className="text-rose-500" />
                  <span>Attacking Strength (Coeff: x0.52)</span>
                </span>
                <span className="text-xs font-mono font-extrabold text-rose-400">{tuning.attack} pts</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={tuning.attack}
                onChange={(e) => handleSliderChange("attack", parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 leading-normal mt-2">
                Determines goal conversion rates, creative chances, and pass velocity coefficients.
              </p>
            </div>

            {/* Defense Strength */}
            <div className="bg-slate-950/80 p-4 border border-slate-900 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-500" />
                  <span>Defensive Compactness (Coeff: x0.48)</span>
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-400">{tuning.defense} pts</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={tuning.defense}
                onChange={(e) => handleSliderChange("defense", parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 leading-normal mt-2">
                Determines goalkeeper efficiency, intercept rates, and offside trap synchronization.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* COLUMN 3: GLOBAL AI LEADERBOARD SIDEBAR */}
      <div className="bg-[#0b101d]/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between" id="teams_leaderboard_col">
        <div>
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <h3 className="font-semibold text-white tracking-tight text-sm">Global Rankings hierarchy</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold text-slate-400">ACTIVE LEADERBOARD</span>
          </div>

          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
            {sortedTeamsList.map((t, idx) => {
              const isActive = t.code === focusedTuningTeam;
              return (
                <div
                  key={t.code}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isActive
                      ? "bg-indigo-600/10 border-indigo-500/40"
                      : "bg-slate-950/60 border-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold text-slate-500 w-4 pl-1">
                      {idx + 1}
                    </span>
                    <TeamFlag code={t.code} className="w-5 h-5 shadow-sm" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{t.name}</span>
                      <span className="text-[9px] font-mono text-slate-500">ATT: {t.attack} | DEF: {t.defense}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-extrabold text-indigo-400 font-bold bg-slate-900/95 py-1 px-2 rounded-lg border border-slate-800">
                    {t.rating.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info callout */}
        <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl mt-4 text-[11px] text-slate-400 leading-normal flex items-start gap-2.5">
          <Brain size={16} className="text-blue-400 mt-0.5 animate-pulse shrink-0" />
          <span>Ratings alter match projections in real time! Check out the active scorecard changes.</span>
        </div>

      </div>

    </div>
  );
};
