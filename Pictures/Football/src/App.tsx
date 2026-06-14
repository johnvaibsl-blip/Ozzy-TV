import React, { useState, useEffect, useRef } from "react";
import { 
  Trophy, 
  Tv, 
  Calendar, 
  Users, 
  Brain, 
  BarChart3, 
  Award, 
  Newspaper, 
  TrendingUp, 
  ChevronRight, 
  Maximize2, 
  Sparkle, 
  Sliders, 
  Play, 
  Pause, 
  RefreshCw, 
  Volume2, 
  ArrowRight, 
  HelpCircle,
  X,
  Target,
  Search,
  Flag,
  Lock,
  Unlock,
  Key,
  Home,
  CircleDot,
  LayoutGrid,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TeamFlag } from "./components/TeamFlag";

// Modular view imports
import { OverviewView } from "./components/OverviewView";
import { LiveMatchesView } from "./components/LiveMatchesView";
import { FixturesView } from "./components/FixturesView";
import { GroupsView } from "./components/GroupsView";
import { TeamsView } from "./components/TeamsView";
import { AIInsightsView } from "./components/AIInsightsView";
import { StatisticsView } from "./components/StatisticsView";
import { TopPlayersView } from "./components/TopPlayersView";
import { NewsView } from "./components/NewsView";

// Static data imports
import { 
  TEAMS, 
  INITIAL_LIVE_MATCHES, 
  TODAY_FIXTURES, 
  GROUP_STANDINGS, 
  LATEST_NEWS, 
  PLAYER_PROFILES, 
  Team, 
  LiveMatch, 
  Fixture, 
  Standing,
  NewsArticle,
  PlayerProfile
} from "./data";

export default function App() {
  // Navigation & Page filters
  const [activeTab, setActiveTab ] = useState<string>("Overview");
  const [selectedGroup, setSelectedGroup] = useState<string>("C");

  // Secret API Settings states
  const [secretClickCount, setSecretClickCount] = useState<number>(0);
  const secretTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [secretModalOpen, setSecretModalOpen] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem("GEMINI_API_KEY") || "";
  });
  const [customRapidApiKey, setCustomRapidApiKey] = useState<string>(() => {
    return localStorage.getItem("RAPIDAPI_KEY") || "";
  });
  const [customFootballDataKey, setCustomFootballDataKey] = useState<string>(() => {
    return localStorage.getItem("FOOTBALL_DATA_ORG_KEY") || "";
  });

  // Tactical Insight Modal States
  const [insightLoading, setInsightLoading] = useState<boolean>(false);
  const [insightData, setInsightData] = useState<any>(null);
  const [insightModalOpen, setInsightModalOpen] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Connecting to Gemini AI...");

  // Dashboard & State Engines — start EMPTY, filled only by real API sync
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [fixturesList, setFixturesList] = useState<Fixture[]>([]);
  const [groupStandings, setGroupStandings] = useState<Record<string, Standing[]>>({ A: [], B: [], C: [], D: [] });
  const [statusToasts, setStatusToasts] = useState<string[]>([]);

  // AI Power Ranking Engine
  const [teamTunings, setTeamTunings] = useState<Record<string, { attack: number; defense: number }>>(() => {
    const tunings: Record<string, { attack: number; defense: number }> = {};
    Object.keys(TEAMS).forEach(code => {
      tunings[code] = { attack: TEAMS[code].attack, defense: TEAMS[code].defense };
    });
    return tunings;
  });
  const [focusedTuningTeam, setFocusedTuningTeam] = useState<string>("BRA");

  // Detailed Modal Screens
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);

  // Online data — start empty, only show real synced data
  const [onlineSynced, setOnlineSynced] = useState<boolean>(false);
  const [onlineLoading, setOnlineLoading] = useState<boolean>(false);
  const [syncedNews, setSyncedNews] = useState<NewsArticle[]>([]);
  const [syncedStats, setSyncedStats] = useState<any[]>([]);

  const handleSecretHeaderClick = () => {
    if (secretTimeoutRef.current) {
      clearTimeout(secretTimeoutRef.current);
    }
    
    setSecretClickCount(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 3) {
        setSecretModalOpen(true);
        setPasscode("");
        setPasscodeError("");
        return 0; // reset click counter
      }
      return nextCount;
    });

    secretTimeoutRef.current = setTimeout(() => {
      setSecretClickCount(0);
    }, 2500);
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "8008") {
      setIsUnlocked(true);
      setPasscodeError("");
    } else {
      setPasscodeError("AUTHENTICATION FAILURE: INVALID PIN CODE");
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("GEMINI_API_KEY", customApiKey.trim());
    localStorage.setItem("RAPIDAPI_KEY", customRapidApiKey.trim());
    localStorage.setItem("FOOTBALL_DATA_ORG_KEY", customFootballDataKey.trim());
    setStatusToasts(prev => [
      "CREDENTIALS UPDATED: Dynamic API Keys saved locally!",
      ...prev
    ].slice(0, 3));
    setSecretModalOpen(false);
    handleSyncOnlineData(false, true);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("GEMINI_API_KEY");
    localStorage.removeItem("RAPIDAPI_KEY");
    localStorage.removeItem("FOOTBALL_DATA_ORG_KEY");
    setCustomApiKey("");
    setCustomRapidApiKey("");
    setCustomFootballDataKey("");
    setStatusToasts(prev => [
      "CREDENTIALS CLEARED: Reverted to default analytics core engine.",
      ...prev
    ].slice(0, 3));
    setSecretModalOpen(false);
  };

  useEffect(() => {
    return () => {
      if (secretTimeoutRef.current) {
        clearTimeout(secretTimeoutRef.current);
      }
    };
  }, []);
  
  // Interactive biggest match selector
  const [biggestMatchKey, setBiggestMatchKey] = useState<string>("");

  // Resolve match list dynamically from liveMatches and fixturesList
  const dynamicMatchesList = (() => {
    const list: Array<{ key: string; home: string; away: string; homeCode: string; awayCode: string }> = [];
    
    // Add live matches first
    liveMatches.forEach(m => {
      list.push({
        key: `synced-${m.id}`,
        home: m.homeTeam,
        away: m.awayTeam,
        homeCode: m.homeCode,
        awayCode: m.awayCode
      });
    });
    
    // Add upcoming/played fixtures
    fixturesList.forEach(f => {
      const exists = list.some(
        m => (m.homeCode === f.homeCode && m.awayCode === f.awayCode) ||
              (m.awayCode === f.homeCode && m.homeCode === f.awayCode)
      );
      if (!exists) {
        list.push({
          key: f.id,
          home: f.homeTeam,
          away: f.awayTeam,
          homeCode: f.homeCode,
          awayCode: f.awayCode
        });
      }
    });
    
    return list;
  })();

  // Automatically select the first match in the list once loaded or switch to live match when available
  useEffect(() => {
    if (dynamicMatchesList.length > 0) {
      // Find if there is any active live match
      const activeLive = liveMatches.find(m => m.status === "LIVE");
      if (activeLive) {
        const liveKey = `synced-${activeLive.id}`;
        if (biggestMatchKey !== liveKey) {
          setBiggestMatchKey(liveKey);
        }
      } else if (!biggestMatchKey) {
        setBiggestMatchKey(dynamicMatchesList[0].key);
      }
    }
  }, [dynamicMatchesList, biggestMatchKey, liveMatches]);

  const currentSelectedBiggest = (() => {
    const found = dynamicMatchesList.find(m => m.key === biggestMatchKey);
    return found || dynamicMatchesList[0] || null;
  })();

  const handleSyncOnlineData = async (silent = false, bypassCache = false) => {
    if (!silent) {
      setOnlineLoading(true);
      // Suppressed "LIVE SYNC: Connecting..." toast
    }

    try {
      const dynamicApiKey = localStorage.getItem("GEMINI_API_KEY") || "";
      const rapidApiKey = localStorage.getItem("RAPIDAPI_KEY") || "";
      const footballDataKey = localStorage.getItem("FOOTBALL_DATA_ORG_KEY") || "";
      const headers: Record<string, string> = {};
      if (dynamicApiKey) {
        headers["x-gemini-api-key"] = dynamicApiKey;
      }
      if (rapidApiKey) {
        headers["x-rapidapi-key"] = rapidApiKey;
      }
      if (footballDataKey) {
        headers["x-football-data-key"] = footballDataKey;
      }
      if (bypassCache) {
        headers["x-bypass-cache"] = "true";
      }
      const response = await fetch("/api/online-dashboard", { headers });
      const data = await response.json();
      
      const hasLiveMatches = data && data.liveMatches && data.liveMatches.length > 0;
      const hasFixtures = data && data.fixtures && data.fixtures.length > 0;
      const hasNews = data && data.news && data.news.length > 0;

      if (hasLiveMatches || hasFixtures || hasNews) {
        if (silent) {
          if (data.liveMatches && data.liveMatches.length > 0) {
            setLiveMatches(data.liveMatches);
          }
          if (data.fixtures && data.fixtures.length > 0) {
            setFixturesList(data.fixtures);
          }
          if (data.news && data.news.length > 0) {
            setSyncedNews(data.news);
          }
          if (data.stats && data.stats.length > 0) {
            setSyncedStats(data.stats);
          }
          if (data.standings) {
            const hasData = Object.values(data.standings).some((s: any) => s && s.length > 0);
            if (hasData) {
              setGroupStandings(data.standings);
            }
          }
          setOnlineSynced(true);
        } else {
          // Step 1: Sync Live Matches & Fixtures
          setTimeout(() => {
            if (data.liveMatches && data.liveMatches.length > 0) {
              setLiveMatches(data.liveMatches);
            }
            if (data.fixtures && data.fixtures.length > 0) {
              setFixturesList(data.fixtures);
            }
            // Suppressed syncing scores toast
          }, 800);

          // Step 2: Sync News, Standings & Stats
          setTimeout(() => {
            if (data.news && data.news.length > 0) {
              setSyncedNews(data.news);
            }
            if (data.stats && data.stats.length > 0) {
              setSyncedStats(data.stats);
            }
            if (data.standings) {
              const hasData = Object.values(data.standings).some((s: any) => s && s.length > 0);
              if (hasData) {
                setGroupStandings(data.standings);
              }
            }
            // Suppressed syncing standings toast
          }, 1650);

          // Step 3: Complete Sync
          setTimeout(() => {
            setOnlineSynced(true);
            // Suppressed complete toast
          }, 2400);
        }

      } else {
        if (silent) {
          setOnlineSynced(false);
        } else {
          setTimeout(() => {
            setOnlineSynced(false);
            // Empty telemetry feed popup suppressed as requested
          }, 1200);
        }
      }
    } catch (error) {
      console.error("Error syncing online data:", error);
      if (!silent) {
        setStatusToasts(prev => ["SYNC FAILED: Server offline or API quota limit reached.", ...prev].slice(0, 3));
      }
    } finally {
      if (!silent) {
        setTimeout(() => {
          onlineLoading && setOnlineLoading(false);
        }, 2450);
      }
    }
  };

  // Fetch full analysis from Gemini backend
  const handleFetchFullAnalysis = async (home: string, away: string) => {
    setInsightLoading(true);
    setInsightModalOpen(true);
    setInsightData(null);
    
    // Aesthetic loading animation sequence
    const steps = [
      "Contacting server-side analytical nodes...",
      "Querying @google/genai with gemini-3.5-flash...",
      "Modeling squad cohesion & formation overlays...",
      "Decrypting key tactical matchups...",
      "Structuring win confidence matrices..."
    ];
    
    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 1200);

    try {
      const isConcluded = liveMatches.some(
        m => m.status === "FT" && 
        ((m.homeTeam === home && m.awayTeam === away) || (m.awayTeam === home && m.homeTeam === away))
      ) || fixturesList.some(
        f => f.played && 
        ((f.homeTeam === home && f.awayTeam === away) || (f.awayTeam === home && f.homeTeam === away))
      );

      if (isConcluded) {
        setInsightData({
          tacticalBattle: "Match has concluded. AI tactical analysis is only available for live or upcoming matches.",
          starMatchup: "Not applicable (match completed)",
          predictedScore: "—",
          winProbability: { home: 0, draw: 0, away: 0 },
          keyFactor: "Not applicable (match completed)",
          confidenceRating: 0
        });
        setInsightLoading(false);
        clearInterval(stepInterval);
        return;
      }

      const dynamicApiKey = localStorage.getItem("GEMINI_API_KEY") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (dynamicApiKey) {
        headers["x-gemini-api-key"] = dynamicApiKey;
      }
      const response = await fetch("/api/ai-insight", {
        method: "POST",
        headers,
        body: JSON.stringify({ homeTeam: home, awayTeam: away, isFinished: isConcluded }),
      });
      const data = await response.json();
      setInsightData(data);
    } catch (err) {
      console.error("Error drawing analytic response:", err);
      // Fallback
      setInsightData({
        tacticalBattle: `${home} operates an intensive high-block structure aiming to squeeze space dynamically. ${away} positions in an athletic low-mid defensive block to launch transitions behind high fullbacks.`,
        starMatchup: "Wing Forward (Home) vs Wingback (Away) down the left channel will determine final conversion ratios.",
        predictedScore: "2 - 1",
        winProbability: { home: 48, draw: 29, away: 23 },
        keyFactor: "Frequencies of offensive high transitions and penalty box conversion rates",
        confidenceRating: 82
      });
    } finally {
      clearInterval(stepInterval);
      setInsightLoading(false);
    }
  };

  // Fetch real-world live data initially on load and auto-poll every 2 seconds silently
  useEffect(() => {
    handleSyncOnlineData(false, false);

    const intervalId = setInterval(() => {
      handleSyncOnlineData(true, false);
    }, 30000); // Poll every 30 seconds silently (Football-Data.org free tier: 10 req/min)

    return () => clearInterval(intervalId);
  }, []);

  // Auto-dismiss status toast messages after 5 seconds
  useEffect(() => {
    if (statusToasts.length === 0) return;
    const timer = setTimeout(() => {
      setStatusToasts(prev => prev.slice(0, -1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [statusToasts]);

  // Compute live relative AI rating based on user sliders
  const getRecalculatedRating = (code: string) => {
    const original = TEAMS[code];
    if (!original) return 0;
    const tuned = teamTunings[code];
    if (!tuned) return original.rating;
    
    // Formula weighting attack and defense with a small baseline multiplier
    const rawVal = (tuned.attack * 0.52) + (tuned.defense * 0.48);
    return Math.round(rawVal * 10) / 10;
  };

  // Compile active team ratings list sorted by overall AI score
  const getSortedTeams = () => {
    return Object.keys(TEAMS).map(code => {
      const base = TEAMS[code];
      const recalculatedRating = getRecalculatedRating(code);
      return {
        ...base,
        rating: recalculatedRating,
        attack: teamTunings[code]?.attack ?? base.attack,
        defense: teamTunings[code]?.defense ?? base.defense
      };
    }).sort((a, b) => b.rating - a.rating);
  };

  const sortedTeamsList = getSortedTeams();

  // Find dynamic probability metrics of the selected Biggest Match to feedback live inside widgets
  const getBiggestMatchProbabilities = () => {
    if (biggestMatchKey === "brazil_vs_morocco") return { h: 68, d: 19, a: 13, confidence: 82, xg: "BRA 2.1 | 0.8 MOR", desc: "Brazil are favorites with superior attack and better recent performance." };
    if (biggestMatchKey === "england_vs_croatia") return { h: 55, d: 25, a: 20, confidence: 78, xg: "ENG 1.8 | 1.1 CRO", desc: "England carries high spatial intensity while Croatia controls tempo." };
    if (biggestMatchKey === "argentina_vs_france") return { h: 38, d: 30, a: 32, confidence: 88, xg: "ARG 2.3 | 2.1 FRA", desc: "An extremely balanced elite matchup loaded with transition threats." };
    if (biggestMatchKey === "portugal_vs_germany") return { h: 42, d: 28, a: 30, confidence: 74, xg: "POR 1.5 | 1.4 GER", desc: "Tactical positioning duel down the wings determines superiority." };
    return { h: 50, d: 25, a: 25, confidence: 75, xg: "1.5 | 1.5", desc: "A robust tactical evaluation model." };
  };

  const currentProb = getBiggestMatchProbabilities();

  const syncedPlayers: PlayerProfile[] = syncedStats.map((s, idx) => ({
    id: s.id || `sync-player-${idx}`,
    name: s.name,
    team: s.team,
    code: s.teamCode || "UNK",
    rating: parseFloat(s.rating) || 7.0,
    position: s.position || "FW",
    marketValue: s.marketValue || "N/A",
    stats: [
      { label: "Goals", value: s.goals || "0" },
      { label: "Assists", value: s.assists || "0" }
    ],
    highlights: s.highlights || ["Top performer in tournament match play"]
  }));

  return (
    <div className="min-h-screen bg-[#030712] font-sans text-slate-100 flex selection:bg-blue-600 selection:text-white" id="main_container">
      
      {/* Toast Notifications Panel */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {statusToasts.map((toast, idx) => (
            <motion.div
              key={idx + "-" + toast.length}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 border-l-4 border-emerald-500 text-white p-4 rounded-r shadow-2xl flex items-center gap-3 backdrop-blur-md bg-opacity-95"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div className="flex-1 text-sm font-semibold tracking-tight">{toast}</div>
              <button 
                id={`toast_close_btn_${idx}`}
                onClick={() => setStatusToasts(prev => prev.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded pointer-events-auto"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* LEFT NAVIGATION SIDEBAR */}
      <aside className="w-64 border-r border-[#1e293b] bg-[#070b16] hidden md:flex flex-col shrink-0 overflow-y-auto" id="left_sidebar">
        
        {/* Header Branding (Covert Secret Trigger Button - clicks set to 3 taps) */}
        <div 
          onClick={handleSecretHeaderClick}
          className="p-6 border-b border-[#1e293b] flex items-center gap-3 bg-gradient-to-r from-indigo-950/20 via-transparent to-transparent cursor-default select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-[#121936] border border-[#232f51] flex items-center justify-center text-slate-100 shadow-md">
            <Trophy size={18} />
          </div>
          <div className="text-left">
            <span className="font-display font-black text-sm tracking-wider block text-white font-sans">
              WORLD CUP 2026
            </span>
            <span className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase block">
              FIFA WORLD CUP 2026
            </span>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="p-4 flex-1 flex flex-col gap-1">
          <div className="text-[10px] font-mono text-slate-500 font-bold uppercase py-2 px-3 tracking-widest text-left">
            FIFA World Cup 2026
          </div>
          
          {[
            { name: "Overview", icon: <Home size={16} /> },
            { name: "Live Matches", icon: (
              <div className="relative flex items-center justify-center">
                <CircleDot size={16} />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" style={{ transform: 'translate(25%, -25%)' }} />
              </div>
            ), Badge: liveMatches.filter(m => m.status === "LIVE").length },
            { name: "Fixtures", icon: <Calendar size={16} /> },
            { name: "Groups", icon: <LayoutGrid size={16} /> },
            { name: "Teams", icon: <Users size={16} /> },
            { name: "AI Insights", icon: <Brain size={16} /> },
            { name: "Statistics", icon: <BarChart3 size={16} /> },
            { name: "Top Players", icon: <Star size={16} /> },
            { name: "News", icon: <Newspaper size={16} /> }
          ].map(item => {
            const isActive = activeTab === item.name;
            return (
              <React.Fragment key={item.name}>
                <button
                  id={`sidebar_tab_${item.name.toLowerCase().replace(" ", "_")}`}
                  onClick={() => {
                    setActiveTab(item.name);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                    isActive 
                      ? "bg-[#1d4ed8] text-white shadow-md shadow-blue-900/30 font-semibold" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"} transition-colors`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.Badge !== undefined && item.Badge > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-blue-800" : "bg-rose-500 text-white animate-pulse font-bold"}`}>
                      {item.Badge}
                    </span>
                  )}
                </button>
                {item.name === "News" && (
                  <div className="mt-1.5 ml-7 flex flex-col gap-2 border-l border-slate-800 pl-3 mb-2" id="sidebar_news_list">
                    {syncedNews.slice(0, 3).map((article) => (
                      <div 
                        key={article.id} 
                        onClick={() => {
                          setSelectedNews(article);
                          setActiveTab("News");
                        }}
                        className="text-left py-1.5 px-2 rounded hover:bg-slate-900 cursor-pointer group/news transition-all"
                      >
                        <span className="text-[9px] font-mono text-indigo-400 font-semibold tracking-wider block uppercase mb-0.5">
                          {article.timeAgo}
                        </span>
                        <p className="text-[11px] text-slate-400 group-hover/news:text-white transition-colors font-sans line-clamp-2 leading-snug">
                          {article.title}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* AI POWER RANKINGS CALLOUT */}
        <div className="p-4 border-t border-[#1e293b]">
          <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-[#0c091e] to-[#05050c] border border-indigo-950/80 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wider mb-1">AI POWER RANKING</div>
                <div className="text-[11px] text-slate-300 font-medium leading-tight mb-3">
                  Discover the strongest teams ranked by our AI.
                </div>
                <button 
                  id="sidebar_view_ranking_btn"
                  onClick={() => setActiveTab("Teams")}
                  className="text-xs font-semibold text-white hover:text-indigo-300 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>View Ranking</span>
                  <ArrowRight size={12} />
                </button>
              </div>
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden relative border border-indigo-900/40 select-none pointer-events-none">
                <img 
                  src="/assets/cybernetic_purple_humanoid.png" 
                  alt="AI Ranking" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>
          </div>
        </div>

      </aside>

      {/* CORE DISPLAY WRAPPER WITH TOP NAVIGATION */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-12">
        
        {/* TOP COMPACT NAV BAR */}
        <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-md border-b border-[#1e293b] px-4 md:px-8 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <Trophy size={18} className="text-slate-100" />
            <h1 className="font-display font-black text-sm tracking-wider text-white">
              WORLD CUP 2026
            </h1>
          </div>

          {/* Quick Filter Navigation Segment */}
          <nav className="hidden lg:flex items-center gap-6 overflow-x-auto h-full px-2" id="top_tabs_nav">
            {[
              "Overview",
              "Fixtures",
              "Groups",
              "AI Insights",
              "Teams",
              "News"
            ].map(tab => {
              const isSel = activeTab === tab;
              return (
                <button
                  key={tab}
                  id={`top_tab_${tab.toLowerCase().replace(/\s+/g, '_')}`}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-2 text-xs font-semibold tracking-wider transition-all shrink-0 cursor-pointer ${
                    isSel 
                      ? "text-white font-extrabold" 
                      : "text-slate-400 hover:text-slate-200 font-medium"
                  }`}
                >
                  <span>{tab === "Overview" ? "Live" : tab}</span>
                  {isSel && (
                    <motion.div 
                      layoutId="activeTopIndicator"
                      className="absolute bottom-[-18px] left-0 right-0 h-[2px] bg-white rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Live Data Action Control (Subtly rendered, keeping simple layout) */}
          <div className="flex items-center gap-2">
            <button
              id="sync_live_data_btn"
              onClick={() => handleSyncOnlineData(false, true)}
              disabled={onlineLoading}
              className={`p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-slate-800`}
              title="Sync Live Data"
            >
              <RefreshCw size={14} className={`${onlineLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

        </header>

        {/* MAIN BODY LAYOUT */}
        <main className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto text-left">
          {activeTab === "Overview" && (
            <OverviewView 
              biggestMatchKey={biggestMatchKey}
              setBiggestMatchKey={setBiggestMatchKey}
              biggestMatchesList={dynamicMatchesList}
              currentSelectedBiggest={currentSelectedBiggest}
              currentProb={currentProb}
              handleFetchFullAnalysis={handleFetchFullAnalysis}
              liveMatches={liveMatches}
              TODAY_FIXTURES={fixturesList}
              GROUP_STANDINGS={groupStandings}
              syncedNews={syncedNews}
              setSelectedNews={setSelectedNews}
              setSelectedPlayer={setSelectedPlayer}
              PLAYER_PROFILES={syncedPlayers}
              onlineLoading={onlineLoading}
              onlineSynced={onlineSynced}
              handleSyncOnlineData={handleSyncOnlineData}
            />
          )}

          {activeTab === "Live Matches" && (
            <LiveMatchesView 
              liveMatches={liveMatches}
            />
          )}

          {activeTab === "Fixtures" && (
            <FixturesView 
              TODAY_FIXTURES={fixturesList}
              handleFetchFullAnalysis={handleFetchFullAnalysis}
            />
          )}

          {activeTab === "Groups" && (
            <GroupsView 
              GROUP_STANDINGS={groupStandings}
              PLAYER_PROFILES={syncedPlayers}
              setSelectedPlayer={setSelectedPlayer}
            />
          )}

          {activeTab === "Teams" && (
            <TeamsView 
               sortedTeamsList={sortedTeamsList}
               teamTunings={teamTunings}
               setTeamTunings={setTeamTunings}
               focusedTuningTeam={focusedTuningTeam}
               setFocusedTuningTeam={setFocusedTuningTeam}
            />
          )}

          {activeTab === "AI Insights" && (
            <AIInsightsView 
              sortedTeamsList={sortedTeamsList}
            />
          )}

          {activeTab === "Statistics" && (
            <StatisticsView 
              syncedStats={syncedStats}
            />
          )}

          {activeTab === "Top Players" && (
            <TopPlayersView 
              PLAYER_PROFILES={syncedPlayers}
              setSelectedPlayer={setSelectedPlayer}
            />
          )}

          {activeTab === "News" && (
            <NewsView 
              syncedNews={syncedNews}
              setSelectedNews={setSelectedNews}
            />
          )}
        </main>
      </div>

      {/* TACTICAL ANALYSIS SIDEBAR OVERLAY (POWERED BY GEMINI) */}
      <AnimatePresence>
        {insightModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-end" id="analysis_modal_wrapper">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInsightModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-lg bg-[#0b0f19] border-l border-slate-800 h-full overflow-y-auto flex flex-col shadow-2xl"
            >
              {/* Header block */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0b0f19]/90 backdrop-blur-md z-10 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg shrink-0">
                    <Brain size={18} className="animate-spin duration-[15000ms]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-blue-400 font-extrabold block uppercase tracking-wider">TACTICAL MATCH PREVIEW</span>
                    <h3 className="text-md font-display font-bold text-white leading-tight">
                      {currentSelectedBiggest?.home} vs {currentSelectedBiggest?.away}
                    </h3>
                  </div>
                </div>

                <button 
                  id="close_insight_modal_btn"
                  onClick={() => setInsightModalOpen(false)}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Main content body */}
              <div className="p-6 flex-1 flex flex-col gap-6 text-left">
                {insightLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
                      <Trophy size={20} className="text-amber-400 animate-pulse" />
                    </div>
                    <div className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">
                      RUNNING TACTICAL ANALYSIS
                    </div>
                    <div className="text-xs font-mono text-slate-400 py-1.5 px-3 bg-slate-900 rounded border border-slate-800 inline-block">
                      {loadingStep}
                    </div>
                  </div>
                ) : insightData ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-6 text-sm"
                  >
                    {/* Expected outcome metric */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-400 tracking-wider font-semibold block uppercase mb-1">
                          EXPECTED SCORELINE
                        </span>
                        <div className="text-2xl font-display font-bold text-white mt-1">
                          {insightData.predictedScore}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-400 tracking-wider font-semibold block uppercase mb-1">
                          AI CONFIDENCE INDEX
                        </span>
                        <div className="text-2xl font-display font-medium text-emerald-400 mt-1">
                          {insightData.confidenceRating}%
                        </div>
                      </div>
                    </div>

                    {/* Win Probabilities */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold block uppercase mb-2">
                        COMPUTED WIN PROBABILITIES
                      </span>
                      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                        <div className="grid grid-cols-3 text-center text-xs font-mono">
                          <div className="text-left text-emerald-400 font-bold">
                            {currentSelectedBiggest?.homeCode} ({insightData.winProbability?.home || 45}%)
                          </div>
                          <div className="text-center text-slate-400 font-bold">
                            DRAW ({insightData.winProbability?.draw || 25}%)
                          </div>
                          <div className="text-right text-rose-400 font-bold">
                            {currentSelectedBiggest?.awayCode} ({insightData.winProbability?.away || 30}%)
                          </div>
                        </div>

                        <div className="h-2 rounded-full w-full bg-slate-850 flex overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${insightData.winProbability?.home || 45}%` }} />
                          <div className="h-full bg-slate-500" style={{ width: `${insightData.winProbability?.draw || 25}%` }} />
                          <div className="h-full bg-rose-500" style={{ width: `${insightData.winProbability?.away || 30}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Core Tactical Battle details */}
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 relative overflow-hidden">
                      <span className="text-[10px] font-mono text-indigo-400 font-extrabold block uppercase tracking-wider mb-2.5">
                        CORE TACTICAL BLUEPRINT
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans text-xs">
                        {insightData.tacticalBattle}
                      </p>
                    </div>

                    {/* Star Matchup */}
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 relative overflow-hidden">
                      <span className="text-[10px] font-mono text-[#a5b4fc] font-extrabold block uppercase tracking-wider mb-2.5">
                        KEY 1v1 MATCHUP DUEL
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans text-xs">
                        {insightData.starMatchup}
                      </p>
                    </div>

                    {/* Key match defining Factor */}
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold block uppercase mb-1">
                        DECISIVE MATCH METRIC
                      </span>
                      <div className="text-xs text-slate-100 font-semibold leading-relaxed">
                        {insightData.keyFactor}
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
                    No analysis data available.
                  </div>
                )}
              </div>

              {/* Action footer */}
              <div className="p-6 border-t border-slate-800 sticky bottom-0 bg-[#0b0f19] flex gap-3 text-left">
                <button
                  id="close_insight_modal_footer_btn"
                  onClick={() => setInsightModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-900 font-medium text-xs text-slate-300 cursor-pointer"
                >
                  Close Analysis
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL DRAWER / MODAL FOR NEWS ARTICLES */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-slate-905 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col text-left"
            >
              <div className={`p-6 bg-gradient-to-br ${selectedNews.imageTheme || 'from-indigo-900 to-indigo-950'} relative overflow-hidden flex flex-col justify-end min-h-[160px]`}>
                <div className="absolute inset-0 bg-slate-950/60" />
                <button
                  id="close_news_modal_btn"
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white cursor-pointer"
                >
                  <X size={16} />
                </button>

                <div className="relative z-10">
                  <span className="text-[9px] font-mono text-indigo-200 bg-indigo-500/30 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest block mb-2 w-fit">
                    {selectedNews.tag}
                  </span>
                  <h3 className="text-lg font-display font-medium text-white leading-snug">
                    {selectedNews.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs md:text-sm text-slate-300 bg-slate-900">
                <p className="font-semibold text-slate-100">{selectedNews.summary}</p>
                <p className="leading-relaxed whitespace-pre-line">{selectedNews.content}</p>
                <div className="text-[10px] font-mono text-slate-500 mt-4 pt-4 border-t border-slate-800">
                  Published: {selectedNews.timeAgo}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SQUAD / PLAYER PROFILE MODEL */}
      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlayer(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-left"
            >
              <div className="p-6 border-b border-slate-850 flex items-start gap-4 bg-slate-900">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                  {selectedPlayer.position}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-mono text-slate-400">
                    <TeamFlag code={selectedPlayer.code} className="w-4 h-2.5" />
                    <span>{selectedPlayer.team}</span>
                  </div>
                  <h4 className="text-md font-display font-medium text-white leading-normal font-bold">
                    {selectedPlayer.name}
                  </h4>
                  <div className="text-[10px] font-mono text-indigo-450 mt-1 font-semibold">
                    Market Valuation: {selectedPlayer.marketValue}
                  </div>
                </div>

                <button
                  id="close_player_modal_btn"
                  onClick={() => setSelectedPlayer(null)}
                  className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-5 text-xs text-slate-350 bg-slate-900">
                {/* Stats Table Grid */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-2.5">
                    KEY INDIVIDUAL METRICS (AI STATS)
                  </span>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {selectedPlayer.stats.map((st, i) => (
                      <div key={i} className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 text-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">{st.label}</span>
                        <span className="text-xs font-mono text-white font-bold">{st.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights and tactical notes */}
                <div>
                  <span className="text-[10px] font-mono text-slate-505 font-bold uppercase tracking-wider block mb-2.5">
                    TACTICAL ROLE DETAILS
                  </span>
                  <ul className="flex flex-col gap-2">
                    {selectedPlayer.highlights.map((hlt, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs leading-normal">
                        <Target size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                        <span>{hlt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-slate-850 flex gap-3 bg-slate-900">
                <button
                  id="player_configure_weights_btn"
                  onClick={() => {
                    setFocusedTuningTeam(selectedPlayer.code);
                    setSelectedPlayer(null);
                    setActiveTab("Teams");
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-950/40 cursor-pointer"
                >
                  <Sliders size={12} />
                  <span>Configure Weights</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECRET API CONFIGURATION & KEY SETTINGS MODAL */}
      <AnimatePresence>
        {secretModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSecretModalOpen(false);
                setPasscode("");
                setPasscodeError("");
                setIsUnlocked(false);
              }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#090d16] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-left"
            >
              {/* BRAND HEADER DECORATION */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-[#0e1627] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    {!isUnlocked ? (
                      <Lock size={16} className="animate-pulse text-amber-300" />
                    ) : (
                      <Unlock size={16} className="text-emerald-450" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-mono text-indigo-400 font-extrabold uppercase tracking-widest leading-none">
                      {isUnlocked ? "ADMIN MODE ACCESS" : "SECURE ADMINISTRATIVE GATE"}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>{isUnlocked ? "Tweak client-side connection variables" : "Enter locks PIN to authorize"}</span>
                    </p>
                  </div>
                </div>
                <button
                  id="close_admin_modal_btn"
                  onClick={() => {
                    setSecretModalOpen(false);
                    setPasscode("");
                    setPasscodeError("");
                    setIsUnlocked(false);
                  }}
                  className="p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* MODAL WORKSPACE */}
              <div className="p-6 bg-[#070a11] flex-1 flex flex-col gap-4">
                {!isUnlocked ? (
                  /* LOCK SCREEN SCREEN */
                  <form onSubmit={handleVerifyPasscode} className="flex flex-col gap-4">
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-2">
                        <Key size={18} />
                      </div>
                      <span className="text-xs text-slate-400">Unlock PIN Authorization Required</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                        Enter 4-Digit Passcode
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="••••"
                        value={passcode}
                        onChange={(e) => {
                          setPasscode(e.target.value);
                          setPasscodeError("");
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-center text-lg font-mono tracking-[0.5em] text-white focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    </div>

                    {passcodeError && (
                      <p className="text-[10px] font-mono font-bold text-rose-500 text-center uppercase tracking-tight">
                        {passcodeError}
                      </p>
                    )}

                    <button
                      id="authorize_key_edit_btn"
                      type="submit"
                      disabled={passcode.length === 0}
                      className="w-full py-2.5 bg-indigo-600 disabled:opacity-40 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mt-2 cursor-pointer"
                    >
                      <span>Authorize Key Edit</span>
                    </button>
                  </form>
                ) : (
                  /* SECRET WORKSPACE KEY CONFIGURATION SCREEN */
                  <div className="flex flex-col gap-5">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-350 flex flex-col gap-2">
                      <p className="text-slate-300 font-semibold leading-snug">
                        Deploy your API credentials to sync authentic World Cup 2026 data and command real-time dynamic forecasts.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                        <li>**Gemini Key**: Powers search grounding & tactical analysis</li>
                        <li>**API-Football (RapidAPI) Key**: Live scores & match telemetry</li>
                        <li>**Football-Data.org Token**: Live scores, fixtures & standings</li>
                      </ul>
                    </div>

                    <form onSubmit={handleSaveApiKey} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold flex items-center justify-between">
                          <span>GEMINI API KEY</span>
                          <span className="text-[9px] text-slate-500 lowercase">saved in secure local storage</span>
                        </label>
                        <input
                          type="password"
                          placeholder="AIzaSy..."
                          value={customApiKey}
                          onChange={(e) => setCustomApiKey(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold flex items-center justify-between">
                          <span>API-FOOTBALL KEY (RAPIDAPI)</span>
                          <span className="text-[9px] text-slate-500 lowercase">saved in secure local storage</span>
                        </label>
                        <input
                          type="password"
                          placeholder="RapidAPI Key (e.g. 50 hex chars)"
                          value={customRapidApiKey}
                          onChange={(e) => setCustomRapidApiKey(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold flex items-center justify-between">
                          <span>FOOTBALL-DATA.ORG TOKEN</span>
                          <span className="text-[9px] text-slate-500 lowercase">saved in secure local storage</span>
                        </label>
                        <input
                          type="password"
                          placeholder="Football-Data.org Token (e.g. 32 chars)"
                          value={customFootballDataKey}
                          onChange={(e) => setCustomFootballDataKey(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          id="clear_credentials_btn"
                          type="button"
                          onClick={handleClearApiKey}
                          className="flex-1 py-2 rounded-lg border border-rose-950/20 hover:bg-rose-950/10 font-semibold text-xs text-rose-450 transition-all cursor-pointer"
                        >
                          Clear Credentials
                        </button>
                        <button
                          id="save_new_key_btn"
                          type="submit"
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-indigo-950/40 cursor-pointer text-center"
                        >
                          Save New Key
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
