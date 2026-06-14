import React from "react";
import { Trophy, ArrowRight, Brain, Sparkle, RefreshCw, Tv, Calendar, Users, Newspaper, Target, Star, ShieldAlert, ChevronLeft, ChevronRight, Volume2, VolumeX, Coins, Award } from "lucide-react";
import { motion } from "motion/react";
import { TeamFlag } from "./TeamFlag";
import { LiveMatch, Fixture, NewsArticle, PlayerProfile, TEAMS, Team } from "../data";
import { LiveMatchTracker } from "./LiveMatchTracker";
import { TransparentTrophy } from "./TransparentTrophy";

interface OverviewViewProps {
  biggestMatchKey: string;
  setBiggestMatchKey: (key: string) => void;
  biggestMatchesList: any[];
  currentSelectedBiggest: any;
  currentProb: any;
  handleFetchFullAnalysis: (home: string, away: string) => void;
  liveMatches: LiveMatch[];
  TODAY_FIXTURES: Fixture[];
  GROUP_STANDINGS: any;
  syncedNews: NewsArticle[];
  setSelectedNews: (news: NewsArticle | null) => void;
  setSelectedPlayer: (player: PlayerProfile | null) => void;
  PLAYER_PROFILES: PlayerProfile[];
  onlineLoading: boolean;
  onlineSynced: boolean;
  handleSyncOnlineData: () => void;
}

const getNewsThumbnail = (id: string, title: string) => {
  const normId = id.toLowerCase();
  const normTitle = title.toLowerCase();
  // Match specific static IDs only — avoid matching synced IDs like 'news-live-1'
  if (normId === "news-1" || normId.includes("brazil") || normTitle.includes("brazil") || normTitle.includes("opening")) {
    return "/assets/brazil_player_celebrating.png";
  }
  if (normId === "news-2" || normId.includes("contenders") || normTitle.includes("contenders") || normTitle.includes("pochettino") || normTitle.includes("usa")) {
    return "/assets/stadium_aerial_view.png";
  }
  if (normId === "news-3" || normId.includes("mbappé") || normId.includes("mbappe") || normTitle.includes("mbappé") || normTitle.includes("mbappe") || normTitle.includes("germany")) {
    return "/assets/mbappe_style_player.png";
  }
  return null;
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  biggestMatchKey,
  setBiggestMatchKey,
  biggestMatchesList,
  currentSelectedBiggest,
  currentProb,
  handleFetchFullAnalysis,
  liveMatches,
  TODAY_FIXTURES,
  GROUP_STANDINGS,
  syncedNews,
  setSelectedNews,
  setSelectedPlayer,
  PLAYER_PROFILES,
  onlineLoading,
  onlineSynced,
  handleSyncOnlineData
}) => {
  // Local state to filter group standings inside Overview dynamically
  const [selectedGroup, setSelectedGroup] = React.useState<string>("C");

  // Check if the current selected biggest match is active is currently simulating live
  const matchingLiveMatch = currentSelectedBiggest ? liveMatches.find(
    m => (m.homeCode === currentSelectedBiggest.homeCode && m.awayCode === currentSelectedBiggest.awayCode) ||
         (m.awayCode === currentSelectedBiggest.homeCode && m.homeCode === currentSelectedBiggest.awayCode)
  ) : undefined;
  
  const isCurrentlyLive = matchingLiveMatch ? matchingLiveMatch.status === "LIVE" : false;

  // Compute top 5 teams based on overall ratings
  const topTeams = Object.keys(TEAMS).map(code => {
    const base = TEAMS[code];
    return { ...base };
  }).sort((a, b) => b.rating - a.rating).slice(0, 5);

  const realLiveMatch = liveMatches.find(m => m.status === "LIVE");
  const matchedSyncedMatch = currentSelectedBiggest ? liveMatches.find(
    m => (m.homeCode === currentSelectedBiggest.homeCode && m.awayCode === currentSelectedBiggest.awayCode) ||
         (m.awayCode === currentSelectedBiggest.homeCode && m.homeCode === currentSelectedBiggest.awayCode)
  ) : undefined;

  // Derive the active live match: Real synced API data always wins
  // Priority: 1) exact tab-matched synced match 2) any real live match 3) empty placeholder
  const activeLiveMatch: LiveMatch = matchedSyncedMatch || realLiveMatch || {
    id: `live-demo-${currentSelectedBiggest?.homeCode || "TBD"}-${currentSelectedBiggest?.awayCode || "TBD"}`,
    homeTeam: currentSelectedBiggest?.home || "To Be Determined",
    homeCode: currentSelectedBiggest?.homeCode || "TBD",
    awayTeam: currentSelectedBiggest?.away || "To Be Determined",
    awayCode: currentSelectedBiggest?.awayCode || "TBD",
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    possessionHome: 50,
    shotsHome: 0,
    shotsAway: 0,
    status: "NS" as const,
    events: [
      { minute: 0, type: "KICKOFF" as const, team: currentSelectedBiggest?.homeCode || "TBD", player: "Referee", detail: `Waiting for kickoff.` }
    ]
  };
  const isLiveActive = activeLiveMatch.status === "LIVE";

  // Find current active fixture index for the standby banner slider
  const [activeFixtureIndex, setActiveFixtureIndex] = React.useState<number>(1);
  const activeFixture = TODAY_FIXTURES && TODAY_FIXTURES.length > 0 
    ? TODAY_FIXTURES[activeFixtureIndex] || TODAY_FIXTURES[0] 
    : null;
  const currentBannerMatch = isLiveActive ? activeLiveMatch : (activeFixture ? {
    id: activeFixture.id,
    homeTeam: activeFixture.homeTeam,
    homeCode: activeFixture.homeCode,
    awayTeam: activeFixture.awayTeam,
    awayCode: activeFixture.awayCode,
    homeScore: activeFixture.played ? parseInt((activeFixture.score || "0-0").split("-")[0]) : 0,
    awayScore: activeFixture.played ? parseInt((activeFixture.score || "0-0").split("-")[1]) : 0,
    minute: activeFixture.played ? 90 : 0,
    possessionHome: 50,
    shotsHome: 0,
    shotsAway: 0,
    status: activeFixture.played ? "FT" as const : "NS" as const,
    events: [],
    played: activeFixture.played,
    time: activeFixture.kickoffISO && !isNaN(new Date(activeFixture.kickoffISO).getTime())
      ? new Date(activeFixture.kickoffISO).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      : activeFixture.time,
    group: activeFixture.group
  } : activeLiveMatch);

  const isFinished = currentBannerMatch.status === "FT" || (currentBannerMatch as any).played === true;

  // Voice commentary state and SpeechSynthesis effect
  const [isVoiceEnabled, setIsVoiceEnabled] = React.useState<boolean>(false);
  const lastSpokenRef = React.useRef<string>("");

  // Auto-fetch analysis states
  const [autoAnalysis, setAutoAnalysis] = React.useState<{
    loading: boolean;
    tacticalBattle: string;
    predictedScore: string;
    confidenceRating: number;
    keyFactor: string;
    starMatchup: string;
  } | null>(null);

  React.useEffect(() => {
    if (!currentBannerMatch) {
      setAutoAnalysis(null);
      return;
    }

    let isSubscribed = true;
    setAutoAnalysis(prev => ({ ...prev, loading: true, tacticalBattle: "" } as any));

    const loadAnalysis = async () => {
      if (isFinished) {
        if (isSubscribed) {
          setAutoAnalysis({
            loading: false,
            tacticalBattle: "Match has concluded. AI tactical analysis is only available for live or upcoming matches.",
            predictedScore: "—",
            confidenceRating: 0,
            keyFactor: "Not applicable (match completed)",
            starMatchup: "Not applicable (match completed)"
          });
        }
        return;
      }

      try {
        const home = currentBannerMatch.homeTeam;
        const away = currentBannerMatch.awayTeam;
        const response = await fetch("/api/ai-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ homeTeam: home, awayTeam: away, isFinished: isFinished }),
        });
        const data = await response.json();
        
        if (isSubscribed) {
          setAutoAnalysis({
            loading: false,
            tacticalBattle: data.tacticalBattle || "",
            predictedScore: data.predictedScore || "",
            confidenceRating: data.confidenceRating || 75,
            keyFactor: data.keyFactor || "",
            starMatchup: data.starMatchup || ""
          });
        }
      } catch (err) {
        console.error("Auto-fetch analysis error:", err);
        // Fallback local registry query
        const key = `${currentBannerMatch.homeTeam.toLowerCase()}_vs_${currentBannerMatch.awayTeam.toLowerCase()}`;
        const keyReverse = `${currentBannerMatch.awayTeam.toLowerCase()}_vs_${currentBannerMatch.homeTeam.toLowerCase()}`;
        
        let localData = {
          tacticalBattle: `${currentBannerMatch.homeTeam} operates an intensive high-block structure aiming to squeeze space dynamically. ${currentBannerMatch.awayTeam} positions in an athletic low-mid defensive block to launch transitions behind high fullbacks.`,
          predictedScore: "2 - 1",
          confidenceRating: 82,
          keyFactor: "Frequencies of offensive high transitions and penalty box conversion rates",
          starMatchup: "Wing Forward (Home) vs Wingback (Away) down the left channel will determine final conversion ratios."
        };

        if (key === "brazil_vs_morocco" || keyReverse === "morocco_vs_brazil") {
          localData.tacticalBattle = "Brazil looks to utilize high vertical transitions, operating their wings in half-spaces to break Morocco's rigid low-block. Morocco relies heavily on a solid defensive screen anchored by Amrabat, utilizing electric wide counters spearheaded by Hakimi and Ziyech to bypass Brazil's high fullbacks.";
        } else if (key === "england_vs_croatia" || keyReverse === "croatia_vs_england") {
          localData.tacticalBattle = "England's tactical blueprint revolves around high-possession sustainment, leveraging dynamic overlapping runs from Jude Bellingham into the penalty box. Croatia counters with their traditional veteran midfield engine, attempting to slow the game down, dictate tempo, and exploit defensive spaces with pinpoint long distributions.";
        } else if (key === "argentina_vs_france" || keyReverse === "france_vs_argentina") {
          localData.tacticalBattle = "An extremely balanced elite matchup loaded with transition threats. Argentina relies on structural compactness and quick combinational plays through Messi, while France utilizes surgical vertical transitions led by Mbappé.";
        } else if (key === "portugal_vs_germany" || keyReverse === "germany_vs_portugal") {
          localData.tacticalBattle = "Tactical positioning duel down the wings determines superiority. Portugal controls tempo through technical midfielders, while Germany tries to overload half-spaces using high fullbacks.";
        }

        if (isSubscribed) {
          setAutoAnalysis({
            loading: false,
            ...localData
          });
        }
      }
    };

    loadAnalysis();

    return () => {
      isSubscribed = false;
    };
  }, [currentBannerMatch?.homeTeam, currentBannerMatch?.awayTeam]);

  React.useEffect(() => {
    if (!activeLiveMatch || !isVoiceEnabled) return;
    const events = activeLiveMatch.events || [];
    if (events.length === 0) return;
    const latestEvent = events[events.length - 1];
    const eventKey = `${latestEvent.minute}-${latestEvent.type}-${latestEvent.player}`;
    
    if (lastSpokenRef.current !== eventKey) {
      lastSpokenRef.current = eventKey;
      
      let speechText = "";
      if (latestEvent.type === "GOAL") {
        const isHomeGoal = (
          latestEvent.team.toLowerCase() === 'home' ||
          latestEvent.team.toLowerCase() === activeLiveMatch.homeCode.toLowerCase() ||
          latestEvent.team.toLowerCase() === activeLiveMatch.homeTeam.toLowerCase()
        );
        const scoringTeam = isHomeGoal ? activeLiveMatch.homeTeam : activeLiveMatch.awayTeam;
        speechText = `Goal! Goal for ${scoringTeam}. ${latestEvent.player} scores in the ${latestEvent.minute}th minute. ${latestEvent.detail}`;
      } else if (latestEvent.type === "YELLOW_CARD" || latestEvent.type === "RED_CARD") {
        speechText = `Foul card. ${latestEvent.player} receives a card at the ${latestEvent.minute}th minute. ${latestEvent.detail}`;
      } else if (latestEvent.type === "SUBSTITUTION") {
        speechText = `Substitution at the ${latestEvent.minute}th minute. ${latestEvent.detail}`;
      } else {
        speechText = `${latestEvent.detail}`;
      }
      
      if (speechText) {
        window.speechSynthesis.cancel(); // cancel current speaking
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [activeLiveMatch?.events, isVoiceEnabled, activeLiveMatch]);

  // Derive active match probability details
  const getBannerMatchProbabilities = () => {
    if (!currentBannerMatch) {
      return { h: 33, d: 33, a: 34, confidence: 50, xg: "0.0 | 0.0", desc: "No scheduled fixtures available." };
    }
    const key = `${currentBannerMatch.homeTeam.toLowerCase()}_vs_${currentBannerMatch.awayTeam.toLowerCase()}`;
    const keyReverse = `${currentBannerMatch.awayTeam.toLowerCase()}_vs_${currentBannerMatch.homeTeam.toLowerCase()}`;
    
    if (key === "brazil_vs_morocco" || keyReverse === "morocco_vs_brazil") {
      return { h: 68, d: 19, a: 13, confidence: 82, xg: "BRA 2.1 | 0.8 MOR", desc: "Brazil are favorites with superior attack and recent performances." };
    }
    if (key === "england_vs_croatia" || keyReverse === "croatia_vs_england") {
      return { h: 55, d: 25, a: 20, confidence: 78, xg: "ENG 1.8 | 1.1 CRO", desc: "England carries high spatial intensity while Croatia controls tempo." };
    }
    if (key === "argentina_vs_france" || keyReverse === "france_vs_argentina") {
      return { h: 38, d: 30, a: 32, confidence: 88, xg: "ARG 2.3 | 2.1 FRA", desc: "An extremely balanced elite matchup loaded with transition threats." };
    }
    if (key === "portugal_vs_germany" || keyReverse === "germany_vs_portugal") {
      return { h: 42, d: 28, a: 30, confidence: 74, xg: "POR 1.5 | 1.4 GER", desc: "Tactical positioning duel down the wings determines superiority." };
    }

    // Fallback formula based on teams ratings in data
    const homeRating = TEAMS[currentBannerMatch.homeCode]?.rating || 75;
    const awayRating = TEAMS[currentBannerMatch.awayCode]?.rating || 75;
    const diff = homeRating - awayRating;
    const h = Math.max(10, Math.min(85, Math.round(45 + diff * 1.5)));
    const a = Math.max(10, Math.min(85, Math.round(30 - diff * 1.5)));
    const d = 100 - h - a;
    
    return {
      h,
      d,
      a,
      confidence: Math.round(70 + Math.abs(diff)),
      xg: `${currentBannerMatch.homeCode} ${(homeRating / 40).toFixed(1)} | ${(awayRating / 40).toFixed(1)} ${currentBannerMatch.awayCode}`,
      desc: `${currentBannerMatch.homeTeam} matches up against ${currentBannerMatch.awayTeam}. Our AI predicts a close tactical battle with ${homeRating > awayRating ? currentBannerMatch.homeTeam : currentBannerMatch.awayTeam} holding a slight analytical edge.`
    };
  };

  if (!currentSelectedBiggest) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-xl mx-auto my-12 flex flex-col items-center gap-4">
        <Trophy size={48} className="text-indigo-500 animate-pulse" />
        <h2 className="text-lg font-semibold text-white">No World Cup Matches Loaded</h2>
        <p className="text-xs text-slate-450 leading-relaxed">
          Please unlock the Admin panel (click the World Cup logo in the sidebar) and enter a valid API-Football or Football-Data.org key to synchronize real-world tournament matches.
        </p>
        <button
          onClick={() => handleSyncOnlineData()}
          className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-md cursor-pointer"
        >
          Retry Real-Time Sync
        </button>
      </div>
    );
  }

  const bannerProb = getBannerMatchProbabilities();

  return (
    <div className="flex flex-col gap-6" id="overview_view_parent">
      {/* FIRST ROW: TODAY'S BIGGEST MATCH BANNER (LEFT) & MATCH INSIGHT PANEL (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="first_row_banner_grid">
        {/* LEFT: TODAY'S BIGGEST MATCH HERO CARD (SLIDER OR LIVE SCOREBOARD) */}
        <div 
          className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-blue-950/60 p-6 flex flex-col justify-between shadow-2xl min-h-[520px]" 
          id="biggest_headline_banner"
          style={{ 
            backgroundImage: "linear-gradient(to right, rgba(3, 7, 18, 0.95) 55%, rgba(3, 7, 18, 0.7) 100%), url('/assets/stadium_night_floodlights.png')", 
            backgroundSize: "cover", 
            backgroundPosition: "center" 
          }}
        >
          
          {/* Dynamic Interactive Match Selector Tabs (Always visible at the top) */}
          {biggestMatchesList.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-blue-950/40 px-4 relative z-10 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent">
              {biggestMatchesList.map(m => {
                const isActive = biggestMatchKey === m.key;
                const liveMatchObj = liveMatches.find(lm => (lm.homeCode === m.homeCode && lm.awayCode === m.awayCode) || (lm.awayCode === m.homeCode && lm.homeCode === m.awayCode));
                const isLive = liveMatchObj?.status === "LIVE";
                const isMatchFinished = liveMatchObj?.status === "FT" || (m as any).played === true;
                return (
                  <button
                    key={m.key}
                    id={`match_tab_${m.key}`}
                    onClick={() => setBiggestMatchKey(m.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                      isActive
                        ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-950/60"
                        : "bg-slate-950/80 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800"
                    }`}
                  >
                    <TeamFlag code={m.homeCode} className="w-3.5 h-2 rounded-xs" />
                    <span>{m.homeCode} vs {m.awayCode}</span>
                    {isLive && (
                      <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 py-0.2 rounded font-mono uppercase tracking-widest font-extrabold scale-90 animate-pulse">
                        LIVE
                      </span>
                    )}
                    {isMatchFinished && (
                      <span className="text-[8px] bg-slate-500/10 text-slate-400 border border-slate-500/20 px-1 py-0.2 rounded font-mono uppercase tracking-widest font-semibold scale-90">
                        FT
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {isLiveActive && activeLiveMatch ? (
            /* DYNAMIC LIVE MATCH SCOREBOARD & PITCH TRACKER VISUALIZER */
            <div className="flex flex-col gap-5 w-full h-full relative z-10 animate-fade-in animate-duration-300" id="live_match_layout">
              
              {/* Top Row: Scoreboard Header */}
              <div className="flex items-center justify-between px-4" id="live_match_header">
                {/* Left: Home Team Name & Score Capsule */}
                <div className="text-left">
                  <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase flex items-center gap-3">
                    <span>{activeLiveMatch.homeTeam.toUpperCase()}</span>
                    <span className="font-mono text-white bg-[#090f1d] border border-blue-900/40 px-3.5 py-1 rounded-xl text-xl md:text-2xl shadow-md font-bold shrink-0">
                      {activeLiveMatch.homeScore} - {activeLiveMatch.awayScore}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-405 mt-2 block">
                    Playing Live • {activeLiveMatch.displayTime || `${activeLiveMatch.minute}'`}
                  </span>
                </div>

                {/* Right: Live Match Badge & Group Stage Label */}
                <div className="flex flex-col items-end">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold bg-rose-600 text-white px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    <span>LIVE MATCH</span>
                  </span>
                  <span className="text-[10px] font-mono text-blue-400 font-bold mt-2 uppercase tracking-widest">
                    Group Stage
                  </span>
                </div>
              </div>

              {/* Middle Row: Full Width Pitch Visualizer */}
              <div className="w-full flex justify-center" id="live_pitch_wrapper">
                <LiveMatchTracker match={activeLiveMatch} hideHeaderFooter={true} />
              </div>

              {/* Bottom Row: Two Columns for Possession & Live Commentary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4" id="live_match_footer_widgets">
                
                {/* Left Widget: Possession Card */}
                <div className="bg-[#0b101dd8]/90 border border-blue-900/30 rounded-xl p-4 flex flex-col gap-2.5 shadow-lg backdrop-blur-md">
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
                    <span>POSS: {activeLiveMatch.homeCode} {activeLiveMatch.possessionHome}%</span>
                    <span>{100 - activeLiveMatch.possessionHome}% {activeLiveMatch.awayCode}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex bg-slate-800 shadow-inner">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${activeLiveMatch.possessionHome}%` }} />
                    <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${100 - activeLiveMatch.possessionHome}%` }} />
                  </div>
                </div>

                {/* Right Widget: Live Commentary Card */}
                <div className="bg-[#0b101dd8]/90 border border-blue-900/30 rounded-xl p-4 flex flex-col gap-2 shadow-lg backdrop-blur-md text-left">
                  <div className="flex items-center justify-between border-b border-slate-850/50 pb-1.5 mb-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">LIVE COMMENTARY</span>
                    <button 
                      id="voice_commentary_toggle_btn"
                      onClick={() => {
                        setIsVoiceEnabled(prev => {
                          const next = !prev;
                          if (!next) window.speechSynthesis.cancel();
                          return next;
                        });
                      }}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold transition-all border cursor-pointer ${
                        isVoiceEnabled 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                      title="Toggle Voice Commentary"
                    >
                      {isVoiceEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
                      <span>VOICE: {isVoiceEnabled ? "ON" : "OFF"}</span>
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-200 font-semibold leading-normal truncate mt-1">
                    {activeLiveMatch.events && activeLiveMatch.events.length > 0 ? (
                      <span>
                        <strong className="text-amber-400">{activeLiveMatch.events[activeLiveMatch.events.length - 1].player}: </strong>
                        {activeLiveMatch.events[activeLiveMatch.events.length - 1].detail}
                      </span>
                    ) : (
                      <span>Match is underway. High tactical pressing from both squads.</span>
                    )}
                  </p>
                </div>

              </div>

            </div>
          ) : currentBannerMatch ? (
            /* STANDBY CAROUSEL SLIDER DECK */
            <div className="flex flex-col justify-between h-full gap-5 relative z-10 w-full" id="standby_match_layout">

              {/* Top Banner Metadata */}
              <div className="flex items-center justify-between text-left px-4">
                <span className="text-sm md:text-base font-black font-mono tracking-wider text-blue-400 uppercase">
                  FIFA WORLD CUP 2026
                </span>
                <span className="text-xs font-mono font-bold text-blue-400 bg-[#090f1d] border border-blue-900/40 px-3.5 py-1.5 rounded-full shadow-md shrink-0">
                  {isFinished ? "FINISHED" : (currentBannerMatch as any).time || 'LIVE'} • {isFinished ? "FT" : (currentBannerMatch as any).group ? `Group ${(currentBannerMatch as any).group}` : (currentBannerMatch as any).displayTime || `${currentBannerMatch.minute}'`}
                </span>
              </div>

              {/* Selected Standby Match Details (Left Column) */}
              <div className="w-full md:max-w-[62%] flex flex-col gap-4 text-left px-4 relative z-10" id="standby_match_left_column">
                <div>
                  {isFinished ? (
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase leading-none mt-1 flex items-center gap-3">
                      <span>{currentBannerMatch.homeTeam.toUpperCase()}</span>
                      <span className="font-mono text-white bg-[#090f1d] border border-blue-900/40 px-3 py-1 rounded-xl text-xl md:text-2xl shadow-md font-bold">
                        {currentBannerMatch.homeScore} - {currentBannerMatch.awayScore}
                      </span>
                      <span>{currentBannerMatch.awayTeam.toUpperCase()}</span>
                    </h2>
                  ) : (
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase leading-none mt-1">
                      {currentBannerMatch.homeTeam.toUpperCase()} <span className="text-slate-300 font-medium text-lg md:text-xl px-1.5">VS</span> {currentBannerMatch.awayTeam.toUpperCase()}
                    </h2>
                  )}
                </div>

                {/* AI Insight banner */}
                <div className="bg-[#0b101dd8]/90 border border-blue-900/30 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-lg backdrop-blur-md">
                  <div className="shrink-0 scale-110">
                    <TeamFlag code={currentBannerMatch.homeCode} className="w-9 h-6 rounded shadow border border-slate-800" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-[9px] font-mono font-bold text-blue-400 block tracking-wider uppercase mb-0.5">
                      AI MATCH INSIGHT
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                      {bannerProb.desc}
                    </p>
                  </div>
                  <div className="shrink-0 scale-110">
                    <TeamFlag code={currentBannerMatch.awayCode} className="w-9 h-6 rounded shadow border border-slate-800" />
                  </div>
                </div>

                {/* Probabilities Row */}
                {!isFinished && (
                  <div className="flex items-center bg-[#090d16]/90 border border-blue-900/30 px-5 py-2.5 rounded-xl gap-6 font-mono text-xs w-fit shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
                      <span className="font-extrabold text-white">{bannerProb.h}%</span>
                      <span className="font-bold text-emerald-400">{currentBannerMatch.homeCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="font-extrabold text-white">{bannerProb.d}%</span>
                      <span className="font-bold text-slate-400">DRAW</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="font-extrabold text-white">{bannerProb.a}%</span>
                      <span className="font-bold text-slate-400">{currentBannerMatch.awayCode}</span>
                    </div>
                  </div>
                )}

                {/* AI Analysis Box */}
                <div className="bg-[#0b101dd8]/90 border border-blue-900/30 rounded-xl p-5 flex flex-col gap-3 shadow-lg backdrop-blur-md w-full min-h-[220px]" id="banner_ai_analysis_box">
                  <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
                    <Brain size={16} className={isFinished ? "text-slate-500" : "text-blue-400 animate-pulse"} />
                    <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isFinished ? "text-slate-500" : "text-blue-400"}`}>
                      AI ANALYSIS
                    </span>
                    {autoAnalysis?.loading && !isFinished && (
                      <span className="text-[9px] font-mono text-slate-500 animate-pulse ml-auto">
                        Recalculating...
                      </span>
                    )}
                  </div>
                  
                  {isFinished ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                      <span className="text-sm font-semibold text-slate-400 mb-1">Match Concluded</span>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                        AI tactical analysis and outcome predictions are only available for live or upcoming matches.
                      </p>
                    </div>
                  ) : autoAnalysis?.loading ? (
                    <div className="flex-1 flex items-center justify-center py-6 text-base font-mono text-slate-500 animate-pulse">
                      Analyzing match configurations...
                    </div>
                  ) : autoAnalysis?.tacticalBattle ? (
                    <p className="text-base text-slate-200 leading-relaxed font-sans font-medium text-left">
                      {autoAnalysis.tacticalBattle}
                    </p>
                  ) : (
                    <p className="text-base text-slate-500 font-mono py-6 text-center">
                      No analysis available.
                    </p>
                  )}
                </div>
              </div>

              {/* Trophy placement (Absolutely Positioned on the Right) */}
              <div className="absolute right-0 bottom-0 top-12 w-[240px] md:w-[320px] lg:w-[380px] flex items-end justify-center select-none pointer-events-none z-0" id="trophy_placement">
                <TransparentTrophy />
              </div>

              {/* Bottom bar container with navigation controls and green indicator */}
              {TODAY_FIXTURES.length > 0 && (
                <div className="mt-2 px-4 flex items-center justify-end w-full gap-3 relative z-10" id="banner_bottom_bar">
                  <span className="text-[10px] md:text-[11px] font-mono font-bold text-[#4ade80] tracking-widest uppercase mb-2">
                    SPOTLIGHT MATCH ({biggestMatchesList.findIndex(m => m.key === biggestMatchKey) + 1}/{biggestMatchesList.length})
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/85 border border-slate-800 p-1 rounded-lg shadow-lg mb-2" id="banner_slider_controls">
                    <button 
                      id="banner_prev_match_btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const idx = biggestMatchesList.findIndex(m => m.key === biggestMatchKey);
                        const prevIdx = idx > 0 ? idx - 1 : biggestMatchesList.length - 1;
                        if (biggestMatchesList[prevIdx]) {
                          setBiggestMatchKey(biggestMatchesList[prevIdx].key);
                        }
                      }}
                      className="p-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                      title="Previous Match"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    
                    <button 
                      id="banner_next_match_btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const idx = biggestMatchesList.findIndex(m => m.key === biggestMatchKey);
                        const nextIdx = idx < biggestMatchesList.length - 1 ? idx + 1 : 0;
                        if (biggestMatchesList[nextIdx]) {
                          setBiggestMatchKey(biggestMatchesList[nextIdx].key);
                        }
                      }}
                      className="p-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                      title="Next Match"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* EMPTY FIXTURES FALLBACK */
            <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-xs gap-2 py-12 w-full min-h-[300px]" id="empty_fixtures_fallback">
              <ShieldAlert className="text-amber-500 animate-pulse" size={24} />
              <span>NO SCHEDULED FIXTURES AVAILABLE</span>
            </div>
          )}

        </div>

        {/* RIGHT: AI MATCH INSIGHT / LIVE TRANSITIONS CONTROL PANEL */}
        <div className="bg-[#0b101dd8] border border-blue-900/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between" id="ai_match_insight_side_widget">
          
          <div className="flex flex-col gap-4">
            
            {/* Widget Title Header */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                <Brain size={16} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-xs md:text-sm tracking-tight uppercase">
                  {isFinished ? "MATCH CONCLUDED" : isLiveActive && activeLiveMatch ? "LIVE TRANSITION MONITOR" : "AI MATCH INSIGHT"}
                </h3>
                <span className="text-[9px] font-mono text-indigo-400/80 font-bold block">
                  {isFinished ? "FINAL TOURNAMENT DATA" : "TACTICAL MATRIX CORE"}
                </span>
              </div>
            </div>

            {isFinished ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-950/20 border border-slate-800/40 rounded-lg min-h-[300px]">
                <Award size={36} className="text-amber-500 mb-3" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Predictions Disabled</span>
                <p className="text-[11px] text-slate-450 mt-2 leading-relaxed">
                  This matchup has concluded with a final score of <strong className="text-white">{currentBannerMatch.homeScore} - {currentBannerMatch.awayScore}</strong>.
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  AI predictions, live probability gauges, and expected goals (xG) metrics are only calculated for active live games or upcoming scheduled fixtures.
                </p>
              </div>
            ) : (
              <>
                {/* Quick description summary */}
                <p className="text-xs text-slate-350 text-left leading-relaxed font-sans font-medium bg-slate-950/20 p-3 rounded-lg border border-slate-800/40">
                  {isLiveActive && activeLiveMatch ? (
                    <span><strong>Live Match Action:</strong> Underway at World Stadium. Possession variables recalculate tick-by-tick based on attacker positions.</span>
                  ) : (
                    <span>{bannerProb.desc}</span>
                  )}
                </p>

                {/* Circular Donut Win Probability Chart (SVG Powered, Highly Tech Stacked) */}
                {(() => {
                  const r = 36;
                  const circ = 2 * Math.PI * r; // ~226.19
                  // determine probabilities based on whether Live Match is running
                  let hPercent = bannerProb.h;
                  let dPercent = bannerProb.d;
                  let aPercent = bannerProb.a;
                  
                  if (isLiveActive && activeLiveMatch) {
                    // If live: dynamically adjust circular slices on the fly to simulate active shifts
                    const baseH = bannerProb.h;
                    const adjustment = Math.sin(activeLiveMatch.minute / 3) * 6;
                    hPercent = Math.max(10, Math.min(85, Math.round(baseH + adjustment)));
                    aPercent = Math.max(10, Math.min(85, Math.round(bannerProb.a - adjustment)));
                    dPercent = 100 - hPercent - aPercent;
                  }

                  const hLen = circ * (hPercent / 100);
                  const dLen = circ * (dPercent / 100);
                  const aLen = circ * (aPercent / 100);

                  const hOff = 0;
                  const dOff = -hLen;
                  const aOff = -(hLen + dLen);
                  
                  return (
                    <div className="flex items-center justify-between gap-4 bg-slate-950/50 p-4 border border-slate-850/60 rounded-xl" id="probability_donut_graph">
                      <div className="flex flex-col gap-2.5 text-xs text-left">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                          <span className="font-semibold text-slate-350">{currentBannerMatch?.homeCode || "HOME"}:</span>
                          <span className="font-mono text-white font-bold">{hPercent}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                          <span className="font-semibold text-slate-350">Draw:</span>
                          <span className="font-mono text-white font-bold">{dPercent}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                          <span className="font-semibold text-slate-350">{currentBannerMatch?.awayCode || "AWAY"}:</span>
                          <span className="font-mono text-white font-bold">{aPercent}%</span>
                        </div>
                      </div>
                      
                      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                        <svg width="84" height="84" viewBox="0 0 100 100" className="transform -rotate-90">
                          {/* Base shadow ring */}
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#101524" strokeWidth="8.5" />
                          {/* Home segment */}
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#10b981" strokeWidth="8.5" 
                            strokeDasharray={`${hLen} ${circ}`} strokeDashoffset={hOff} strokeLinecap={hPercent > 3 ? "round" : "butt"} />
                          {/* Draw segment */}
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#3b82f6" strokeWidth="8.5" 
                            strokeDasharray={`${dLen} ${circ}`} strokeDashoffset={dOff} strokeLinecap={dPercent > 3 ? "round" : "butt"} />
                          {/* Away segment */}
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#f43f5e" strokeWidth="8.5" 
                            strokeDasharray={`${aLen} ${circ}`} strokeDashoffset={aOff} strokeLinecap={aPercent > 3 ? "round" : "butt"} />
                        </svg>
                        <div className="absolute flex flex-col items-center select-none">
                          <span className="text-[8px] font-mono text-slate-450 uppercase tracking-widest font-extrabold">CONF</span>
                          <span className="text-xs font-black text-white leading-tight">{bannerProb.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Confidence block grid gauge resembling athletic tactical console details */}
                <div className="text-left" id="confidence_panel">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-350 mb-1.5">
                    <span>Confidence</span>
                    <span className="font-mono text-blue-400 text-xs font-bold">{bannerProb.confidence}%</span>
                  </div>
                  <div className="flex gap-0.5 h-3 items-center" id="confidence_blocks_row">
                    {Array.from({ length: 15 }).map((_, idx) => {
                      const isFilled = idx < Math.round((bannerProb.confidence / 100) * 15);
                      return (
                        <span 
                          key={idx} 
                          className={`w-2.5 h-2 rounded-xs transition-all duration-300 ${
                            isFilled 
                              ? "bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]" 
                              : "bg-slate-850"
                          }`} 
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Expected goals comparison card row */}
          {!isFinished && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-left" id="expected_goals_row">
              <span className="font-semibold text-slate-450 uppercase tracking-wider text-[10px] font-mono">Expected Goals (xG)</span>
              <span className="font-mono font-bold text-white bg-slate-900 border border-slate-805 px-2.5 py-1 rounded-lg">
                {(() => {
                  const parts = bannerProb.xg.split("|");
                  if (parts.length === 2) {
                    return (
                      <>
                        <span className="text-emerald-400">{parts[0].trim()}</span>
                        <span className="text-slate-500 mx-1.5">|</span>
                        <span className="text-rose-400">{parts[1].trim()}</span>
                      </>
                    );
                  }
                  return <span className="text-white">{bannerProb.xg}</span>;
                })()}
              </span>
            </div>
          )}

          {/* Betting Odds Comparison Section */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3 text-left" id="betting_odds_comparison">
            <div className="flex items-center gap-1.5 text-slate-450 font-semibold uppercase tracking-wider text-[10px] font-mono">
              <Coins size={12} className="text-amber-500" />
              <span>Betting Odds Comparison</span>
            </div>

            <div className="flex flex-col gap-2.5 bg-slate-950/45 p-3 border border-slate-850/50 rounded-xl" id="bookmakers_odds_grid">
              
              {/* Header metrics */}
              <div className="grid grid-cols-4 text-center text-[9px] font-mono font-bold text-slate-500 uppercase pb-1 border-b border-slate-900">
                <span className="text-left pl-1">Site</span>
                <span>Home</span>
                <span>Draw</span>
                <span>Away</span>
              </div>

              {[
                { name: "Bet365", logoColor: "text-emerald-400", margin: 0.95 },
                { name: "1xBet", logoColor: "text-blue-400", margin: 0.96 },
                { name: "Betfair", logoColor: "text-amber-400", margin: 0.98 }
              ].map((site) => {
                // Determine probabilities based on whether Live Match is running
                let hPercent = bannerProb.h;
                let dPercent = bannerProb.d;
                let aPercent = bannerProb.a;
                
                if (isLiveActive && activeLiveMatch) {
                  const baseH = bannerProb.h;
                  const adjustment = Math.sin(activeLiveMatch.minute / 3) * 6;
                  hPercent = Math.max(10, Math.min(85, Math.round(baseH + adjustment)));
                  aPercent = Math.max(10, Math.min(85, Math.round(bannerProb.a - adjustment)));
                  dPercent = 100 - hPercent - aPercent;
                }

                const oddHome = hPercent > 0 ? ((1 / (hPercent / 100)) * site.margin).toFixed(2) : "10.00";
                const oddDraw = dPercent > 0 ? ((1 / (dPercent / 100)) * site.margin).toFixed(2) : "10.00";
                const oddAway = aPercent > 0 ? ((1 / (aPercent / 100)) * site.margin).toFixed(2) : "10.00";

                return (
                  <div key={site.name} className="grid grid-cols-4 items-center text-center text-xs font-mono font-semibold py-0.5">
                    {/* Site name */}
                    <div className="text-left flex items-center gap-1.5 pl-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${site.logoColor} bg-current`} />
                      <span className="text-slate-300 font-bold font-sans text-[11px]">{site.name}</span>
                    </div>

                    {/* Home odd */}
                    <div className="px-1">
                      <span className="block bg-slate-900 border border-slate-850 hover:border-slate-700 py-1 rounded text-emerald-450 text-[10px] transition-colors">
                        {oddHome}
                      </span>
                    </div>

                    {/* Draw odd */}
                    <div className="px-1">
                      <span className="block bg-slate-900 border border-slate-850 hover:border-slate-700 py-1 rounded text-slate-300 text-[10px] transition-colors">
                        {oddDraw}
                      </span>
                    </div>

                    {/* Away odd */}
                    <div className="px-1">
                      <span className="block bg-slate-900 border border-slate-850 hover:border-slate-700 py-1 rounded text-rose-400 text-[10px] transition-colors">
                        {oddAway}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

        </div></div>

      {/* SECOND ROW: TODAY'S FIXTURES (1/3) & TOP TEAMS (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="second_row_bento_grid">
        
        {/* TODAY'S FIXTURES */}
        <div className="bg-[#0b101dd8] border border-blue-900/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between" id="bento_fixtures_list">
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                <h3 className="font-bold text-white text-xs md:text-sm tracking-tight uppercase">Today's Fixtures</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">4 DAILY MATCHES</span>
            </div>

            <div className="flex flex-col gap-2.5" id="fixtures_items_list">
              {TODAY_FIXTURES.length > 0 ? TODAY_FIXTURES.map(fixture => (
                <div key={fixture.id} className="bg-slate-950/70 border border-slate-900/60 hover:border-slate-800 p-3 rounded-xl flex items-center justify-between transition-all">
                  <div className="flex flex-col gap-1.5 flex-1 select-none">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <TeamFlag code={fixture.homeCode} className="w-4.5 h-3 rounded border border-slate-900" />
                      <span>{fixture.homeTeam}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <TeamFlag code={fixture.awayCode} className="w-4.5 h-3 rounded border border-slate-900" />
                      <span>{fixture.awayTeam}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-right shrink-0 ml-3">
                    <span className="text-[11px] font-mono font-bold bg-blue-900/15 text-blue-400 border border-blue-900/20 px-2 py-0.5 rounded">
                      {fixture.time}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 font-bold mt-1 uppercase">
                      Group {fixture.group}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">
                  SYNCING REAL FIXTURE DATA...
                </div>
              )}
            </div>
            </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block text-left font-bold uppercase">
              All times set to UTC Local clock
            </span>
          </div>

        </div>

        {/* TOP TEAMS (AI RATING) */}
        <div className="lg:col-span-2 bg-[#0b101dd8] border border-blue-900/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between" id="bento_top_teams_block">
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-yellow-500" />
                <h3 className="font-bold text-white text-xs md:text-sm tracking-tight uppercase">Top Teams (AI Rating)</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">DYNAMIC WEIGHTS UPDATED</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" id="top_teams_grid_layout">
              {topTeams.map((team, index) => (
                <div
                  key={team.id}
                  onClick={() => {
                    const found = PLAYER_PROFILES.find(p => p.team === team.name);
                    if (found) setSelectedPlayer(found);
                  }}
                  className="bg-slate-950/50 p-3.5 border border-slate-900 hover:border-blue-500/30 rounded-xl relative overflow-hidden transition-all text-center flex flex-col justify-between cursor-pointer group"
                  id={`top_team_rank_${index + 1}`}
                >
                  {/* Small Rank Badge */}
                  <span className="absolute top-2.5 left-2.5 w-5 h-5 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 font-mono text-[9px] font-bold text-slate-400">
                    {index + 1}
                  </span>

                  <div className="mt-4">
                    <TeamFlag code={team.code} className="w-10 h-7 mx-auto rounded shadow-sm border border-slate-800/40" />
                    <h4 className="font-bold text-xs text-slate-100 mt-2.5 truncate w-full group-hover:text-white transition-colors">
                      {team.name}
                    </h4>
                    <span className="text-sm font-black font-mono text-emerald-400 mt-1 block">
                      {team.rating}
                    </span>
                  </div>

                  {/* Mini-star representation */}
                  <div className="flex justify-center gap-0.5 text-amber-500 my-1.5 select-none">
                    {Array.from({ length: team.stars }).map((_, i) => (
                      <Star key={i} size={8} fill="currentColor" />
                    ))}
                  </div>

                  <div className="text-[9px] font-mono text-slate-500 font-semibold tracking-tight uppercase leading-none border-t border-slate-850 pt-2 mt-1">
                    Attack {team.attack} | Defense {team.defense}
                  </div>

                  {/* Aesthetic glowing neon green chart wave line similar to mockup 1 */}
                  <div className="h-4 mt-2.5 relative overflow-hidden select-none pointer-events-none">
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full text-emerald-500/80">
                      <path 
                        d={`M 0 25 Q 25 ${12 + (index * 2) % 10} 50 ${15 - (index * 3) % 10} T 100 ${10 + (index * 1) % 8}`} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        className="drop-shadow-[0_1.5px_3px_rgba(16,185,129,0.5)]"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-805 select-none">
            <p className="text-[10px] font-mono text-slate-505 font-bold uppercase">
              Tweak team power attributes using weights inside the sidebar SLIDERS view
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

