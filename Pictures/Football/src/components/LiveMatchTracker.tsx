import React, { useState, useEffect, useRef } from "react";
import { CircleDot, Target, RefreshCw } from "lucide-react";
import { LiveMatch } from "../data";



interface LiveMatchTrackerProps {
  match: LiveMatch;
  hideHeaderFooter?: boolean;
}

export const LiveMatchTracker: React.FC<LiveMatchTrackerProps> = ({ match, hideHeaderFooter = false }) => {
  const [ballX, setBallX] = useState<number>(50); // percentage 0-100
  const [ballY, setBallY] = useState<number>(30); // percentage 0-60 (pitch ratio)
  const [actionText, setActionText] = useState<string>("MATCH STARTED");
  const [isHomeAttacking, setIsHomeAttacking] = useState<boolean>(true);

  // Keep references to current match and possession state to avoid breaking the interval loop on updates
  const matchRef = useRef<LiveMatch>(match);
  const isHomeAttackingRef = useRef<boolean>(isHomeAttacking);

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  useEffect(() => {
    isHomeAttackingRef.current = isHomeAttacking;
  }, [isHomeAttacking]);

  // Robust helper: determine if an event belongs to the home team
  const isHomeTeamEvent = (team: string) => {
    if (!team) return true;
    const t = team.toLowerCase().trim();
    return (
      t === 'home' ||
      t === match.homeCode.toLowerCase() ||
      t === match.homeTeam.toLowerCase()
    );
  };

  // Read events and update ball position purely driven by the latest commentary event
  useEffect(() => {
    if (!match) return;

    if (!match.events || match.events.length === 0) {
      setBallX(50);
      setBallY(30);
      setActionText("MATCH READY");
      setIsHomeAttacking(true);
      return;
    }

    const lastEvent = match.events[match.events.length - 1];
    const isHomeAction = isHomeTeamEvent(lastEvent.team);
    setIsHomeAttacking(isHomeAction);
    // Immediately update ref so ball timer picks it up without waiting for next render
    isHomeAttackingRef.current = isHomeAction;

    if (lastEvent.type === "GOAL") {
      const isHomeGoal = isHomeTeamEvent(lastEvent.team);
      setBallX(isHomeGoal ? 97 : 3);
      setBallY(30);
      setActionText(`GOAL! ${lastEvent.player} (${lastEvent.minute}')`);
    } else if (lastEvent.type === "YELLOW_CARD" || lastEvent.type === "RED_CARD") {
      const hashX = 25 + ((lastEvent.minute * 17) % 50);
      const hashY = 15 + ((lastEvent.minute * 13) % 30);
      setBallX(hashX);
      setBallY(hashY);
      setActionText(`${lastEvent.type === "RED_CARD" ? "RED CARD" : "YELLOW CARD"}: ${lastEvent.player} (${lastEvent.minute}')`);
    } else if (lastEvent.type === "SUBSTITUTION") {
      setBallX(50);
      setBallY(30);
      setActionText(`SUBSTITUTION: ${lastEvent.player} (${lastEvent.minute}')`);
    } else if (lastEvent.type === "KICKOFF") {
      setBallX(50);
      setBallY(30);
      setActionText(`KICKOFF (${lastEvent.minute}')`);
    } else {
      const hashX = isHomeAction ? 70 + ((lastEvent.minute * 7) % 20) : 10 + ((lastEvent.minute * 7) % 20);
      const hashY = 10 + ((lastEvent.minute * 11) % 40);
      setBallX(hashX);
      setBallY(hashY);
      setActionText(`${lastEvent.player}: ${lastEvent.detail}`);
    }
  }, [match?.events, match?.homeCode, match?.awayCode, match?.homeTeam, match?.awayTeam]);

  // Periodic ball passing and dribbling simulation effect (runs continuously in real-time)
  useEffect(() => {
    if (!match) return;

    const ballTimer = setInterval(() => {
      const currentMatch = matchRef.current;
      const currentIsHomeAttacking = isHomeAttackingRef.current;
      if (!currentMatch) return;

      const lastEvent = currentMatch.events && currentMatch.events.length > 0 
        ? currentMatch.events[currentMatch.events.length - 1] 
        : null;

      if (lastEvent && lastEvent.type === "GOAL") {
        const isHomeGoal = (
          lastEvent.team.toLowerCase() === 'home' ||
          lastEvent.team.toLowerCase() === currentMatch.homeCode.toLowerCase() ||
          lastEvent.team.toLowerCase() === currentMatch.homeTeam.toLowerCase()
        );
        setBallX(prev => {
          const targetGoal = isHomeGoal ? 97 : 3;
          if (Math.abs(prev - targetGoal) < 2) return targetGoal;
          return prev + (targetGoal - prev) * 0.3;
        });
        return;
      }

      if (currentMatch.status === "LIVE") {
        // Active play: dribble and pass within the attacking zone
        setBallX(prevX => {
          const targetMinX = currentIsHomeAttacking ? 60 : 10;
          const targetMaxX = currentIsHomeAttacking ? 90 : 40;
          const step = (Math.random() - 0.5) * 12;
          let nextX = prevX + step;
          if (nextX < targetMinX) nextX = targetMinX + Math.random() * 5;
          if (nextX > targetMaxX) nextX = targetMaxX - Math.random() * 5;
          return nextX;
        });

        setBallY(prevY => {
          const step = (Math.random() - 0.5) * 8;
          let nextY = prevY + step;
          if (nextY < 5) nextY = 5 + Math.random() * 5;
          if (nextY > 55) nextY = 55 - Math.random() * 5;
          return nextY;
        });
      } else {
        // Non-live/practice play: slowly pass the ball around the center circle
        setBallX(prevX => {
          const step = (Math.random() - 0.5) * 10;
          let nextX = prevX + step;
          if (nextX < 40) nextX = 40 + Math.random() * 5;
          if (nextX > 60) nextX = 60 - Math.random() * 5;
          return nextX;
        });

        setBallY(prevY => {
          const step = (Math.random() - 0.5) * 8;
          let nextY = prevY + step;
          if (nextY < 15) nextY = 15 + Math.random() * 5;
          if (nextY > 45) nextY = 45 - Math.random() * 5;
          return nextY;
        });
      }
    }, 800); // Poll/update ball coords every 800ms for a snappier, real-time feel

    return () => clearInterval(ballTimer);
  }, [match?.id]);

  return (
    <div className="relative w-full bg-[#05140b] border border-emerald-950/60 rounded-xl p-3 flex flex-col gap-2.5 overflow-hidden shadow-2xl select-none" id="pitch_visualizer_wrapper">
      
      {/* Pitch Header Title/Info overlay */}
      {!hideHeaderFooter && (
        <div className="flex items-center justify-between z-10 text-left">
          <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
            <CircleDot size={12} className="animate-pulse" />
            <span>{actionText}</span>
          </span>
          <span className="text-[9px] font-mono text-slate-500 font-extrabold uppercase">
            LIVE MATCH CORE
          </span>
        </div>
      )}

      {/* SVG Pitch Canvas Container */}
      <div className="relative w-full aspect-[100/60] bg-[#092213] border-2 border-emerald-900/40 rounded-lg overflow-hidden shadow-inner" id="svg_pitch_container">
        
        {/* Grass Pattern details (Grid pattern lines) */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-1/20 h-full border-r border-white bg-emerald-950/20" />
          ))}
        </div>

        {/* Pitch Lines Canvas SVG */}
        <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full text-emerald-800/35" fill="none" stroke="currentColor" strokeWidth="0.8">
          {/* Outer Border */}
          <rect x="0.5" y="0.5" width="99" height="59" />
          {/* Halfway Line */}
          <line x1="50" y1="0" x2="50" y2="60" />
          {/* Center Circle */}
          <circle cx="50" cy="30" r="10" />
          <circle cx="50" cy="30" r="0.6" fill="currentColor" />

          {/* Left Penalty Area */}
          <rect x="0.5" y="15" width="16.5" height="30" />
          {/* Left Goal Area */}
          <rect x="0.5" y="22.5" width="5.5" height="15" />
          {/* Left Penalty Spot */}
          <circle cx="11" cy="30" r="0.5" fill="currentColor" />
          {/* Left Penalty Arc */}
          <path d="M 17 24 A 10 10 0 0 1 17 36" />

          {/* Right Penalty Area */}
          <rect x="83" y="15" width="16.5" height="30" />
          {/* Right Goal Area */}
          <rect x="94" y="22.5" width="5.5" height="15" />
          {/* Right Penalty Spot */}
          <circle cx="89" cy="30" r="0.5" fill="currentColor" />
          {/* Right Penalty Arc */}
          <path d="M 83 24 A 10 10 0 0 0 83 36" />

          {/* Corner Arcs */}
          <path d="M 1 0 A 1 1 0 0 1 0 1" />
          <path d="M 99 0 A 1 1 0 0 0 100 1" />
          <path d="M 1 60 A 1 1 0 0 0 0 59" />
          <path d="M 99 60 A 1 1 0 0 1 100 59" />
        </svg>

        {/* Dynamic Attacking Pressure Halos */}
        {(actionText.includes("GOAL") || (match.status === "LIVE" && isHomeAttacking)) && (
          <div 
            className={`absolute top-0 bottom-0 w-[45%] pointer-events-none transition-all duration-1000 ${
              isHomeAttacking 
                ? "right-0 bg-gradient-to-l from-emerald-500/10 to-transparent" 
                : "left-0 bg-gradient-to-r from-rose-500/10 to-transparent"
            }`}
          />
        )}





        {/* THE FOOTBALL (ANIMATED TARGET WITH CSS TRANSITION AND NEON TRAIL) */}
        <div 
          className="absolute w-2 h-2 bg-yellow-400 rounded-full transition-all duration-[600ms] ease-in-out shadow-[0_0_12px_#facc15,0_0_4px_#ffffff] z-10"
          style={{ 
            left: `${ballX}%`, 
            top: `${ballY}%`,
            transform: 'translate(-50%, -50%)' 
          }}
        >
          {/* Inner ring core */}
          <div className="w-full h-full rounded-full border border-white/50 animate-ping opacity-40" />
        </div>

      </div>

      {/* Mini details strip */}
      {!hideHeaderFooter && (
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-emerald-950/20">
          <span>Attack Direction: {isHomeAttacking ? `${match.homeCode} ➔` : `← ${match.awayCode}`}</span>
          <span className="text-emerald-500/90 font-bold uppercase">Dynamic Match Monitor</span>
        </div>
      )}

    </div>
  );
};
