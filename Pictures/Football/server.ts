// Polyfill check to prevent read-only fetch assignment crashes (e.g. in sandboxed JS environments/crawlers)
try {
  const g = (typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}) as any;
  if (g && g.fetch) {
    const desc = Object.getOwnPropertyDescriptor(g, 'fetch');
    if (desc) {
      const isReadOnly = (desc.writable === false) || (desc.get !== undefined && desc.set === undefined);
      if (isReadOnly && desc.configurable !== false) {
        let currentFetch = g.fetch;
        Object.defineProperty(g, 'fetch', {
          get: () => currentFetch,
          set: (val) => {
            console.warn("Intercepted fetch reassignment to prevent crash on server:", val);
            currentFetch = val;
          },
          configurable: true,
          enumerable: true
        });
      }
    }
  }
} catch (err) {
  console.warn("Warning: Could not patch global fetch descriptor:", err);
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// API-Football configuration (via RapidAPI)
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const API_FOOTBALL_HOST = "api-football-v1.p.rapidapi.com";
const API_FOOTBALL_BASE = "https://api-football-v1.p.rapidapi.com/v3";

// FIFA World Cup 2026 competition ID in API-Football
const WORLD_CUP_2026_ID = 1; // Will be dynamically resolved

// Cache mechanism to avoid hitting rate limits
interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string, ttl: number = CACHE_TTL): any | null {
  const entry = apiCache[key];
  if (entry && Date.now() - entry.timestamp < ttl) {
    return entry.data;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  apiCache[key] = { data, timestamp: Date.now() };
}

// Normalize team codes from external APIs to match internal dashboard codes
function normalizeTeamCode(code: string): string {
  if (!code) return code;
  const upper = code.toUpperCase().trim();
  const map: Record<string, string> = {
    'MAR': 'MOR', // Morocco
    'HTI': 'HAI', // Haiti
    'HRV': 'CRO', // Croatia
    'DEU': 'GER', // Germany
    'NED': 'NLD', // Netherlands (if needed)
    'DEN': 'DNK', // Denmark (if needed)
  };
  return map[upper] || upper;
}

// Generic fetch wrapper for API-Football with rate limiting
async function fetchFromAPIFootball(endpoint: string, params: Record<string, string> = {}, customKey?: string, bypassCache = false): Promise<any> {
  const apiKey = customKey || API_FOOTBALL_KEY;
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}&key=${apiKey}`;
  
  // Cache live fixtures and events for only 5 seconds, others for 5 minutes
  const isLiveOrFixture = endpoint.includes('/fixtures') || endpoint.includes('/events');
  const ttl = isLiveOrFixture ? 5 * 1000 : CACHE_TTL;

  if (!bypassCache) {
    const cached = getCachedData(cacheKey, ttl);
    if (cached) {
      console.log(`[Cache HIT] API-Football: ${endpoint}`);
      return cached;
    }
  }

  if (!apiKey) {
    console.log(`[API-Football] No API key configured, skipping: ${endpoint}`);
    return null;
  }

  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_FOOTBALL_BASE}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    console.log(`[API-Football] Fetching: ${endpoint}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': API_FOOTBALL_HOST
      }
    });

    if (!response.ok) {
      throw new Error(`API-Football returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    setCachedData(cacheKey, result);
    
    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return result;
  } catch (error) {
    console.error(`[API-Football] Error fetching ${endpoint}:`, error);
    return null;
  }
}

// Resolve World Cup 2026 league ID dynamically
let worldCupLeagueId: number | null = null;

async function resolveWorldCupLeagueId(apiKey: string, bypassCache = false): Promise<number | null> {
  if (worldCupLeagueId) return worldCupLeagueId;
  
  try {
    const result = await fetchFromAPIFootball('/leagues', { name: 'World Cup' }, apiKey, bypassCache);
    if (!result || !result.response || result.response.length === 0) {
      const altResult = await fetchFromAPIFootball('/leagues', { name: 'FIFA World Cup' }, apiKey, bypassCache);
      if (altResult && altResult.response && altResult.response.length > 0) {
        return extractLeagueId(altResult.response);
      }
      return 1; // standard ID for World Cup in API-Football
    }
    return extractLeagueId(result.response);
  } catch (error) {
    console.error('[Error] Failed to resolve World Cup league ID:', error);
    return 1; // Fallback to 1
  }
}

function extractLeagueId(response: any[]): number {
  for (const item of response) {
    const league = item.league;
    const seasons = item.seasons || [];
    
    const has2026 = seasons.some((s: any) => s.year === 2026);
    const nameMatches = league.name?.toLowerCase().includes("world cup");
    
    if (nameMatches && has2026) {
      worldCupLeagueId = league.id;
      console.log(`[Resolved] World Cup 2026 League ID: ${worldCupLeagueId}`);
      return worldCupLeagueId;
    }
  }
  
  if (response[0] && response[0].league) {
    worldCupLeagueId = response[0].league.id;
    console.log(`[Fallback] Using first league ID: ${worldCupLeagueId}`);
    return worldCupLeagueId;
  }
  return 1;
}

// Fetch live match events from API-Football
async function fetchLiveMatchEvents(fixtureId: number, apiKey: string, bypassCache = false): Promise<any[]> {
  try {
    const result = await fetchFromAPIFootball('/fixtures/events', {
      fixture: fixtureId.toString()
    }, apiKey, bypassCache);
    
    if (!result || !result.response) return [];
    
    return result.response.map((evt: any) => {
      let type: "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "KICKOFF" | "ACTION" = "ACTION";
      if (evt.type === "Goal") {
        type = "GOAL";
      } else if (evt.type === "Card") {
        type = evt.detail?.toLowerCase().includes("red") ? "RED_CARD" : "YELLOW_CARD";
      } else if (evt.type?.toLowerCase().includes("subst")) {
        type = "SUBSTITUTION";
      }
      
      return {
        minute: evt.time?.elapsed || 0,
        type,
        team: evt.team?.name || "Unknown",
        player: evt.player?.name || "Unknown Player",
        detail: evt.detail || `${evt.type} by ${evt.player?.name}`
      };
    });
  } catch (error) {
    console.error(`[API-Football] Error fetching events for fixture ${fixtureId}:`, error);
    return [];
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

// Initialize Gemini client with safety checks
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI client successfully initialized server-side.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.log("GEMINI_API_KEY is missing or using placeholder; running on high-quality simulated data engine.");
}

// Fallback high-quality analytical registry for popular matchups
const FALLBACK_INSIGHTS: Record<string, any> = {
  "brazil_vs_morocco": {
    tacticalBattle: "Brazil looks to utilize high vertical transitions, operating their wings in half-spaces to break Morocco's rigid low-block. Morocco relies heavily on a solid defensive screen anchored by Amrabat, utilizing electric wide counters spearheaded by Hakimi and Ziyech to bypass Brazil's high fullbacks.",
    starMatchup: "Vinícius Júnior vs. Achraf Hakimi: An explosive confrontation down the left flank. Hakimi's recovery pace will test Vinícius's dribbling variations in 1v1 situations.",
    predictedScore: "2 - 1",
    winProbability: { home: 68, draw: 19, away: 13 },
    keyFactor: "Midfield counter-pressing transition speed",
    confidenceRating: 82
  },
  "england_vs_croatia": {
    tacticalBattle: "England's tactical blueprint revolves around high-possession sustainment, leveraging dynamic overlapping runs from Jude Bellingham into the penalty box. Croatia counters with their traditional veteran midfield engine, attempting to slow the game down, dictate tempo, and exploit defensive spaces with pinpoint long distributions.",
    starMatchup: "Declan Rice vs. Luka Modrić: Modrić will try to orchestrate play from deep, while Rice's primary objective is to disrupt central passing lanes and transition play forward.",
    predictedScore: "2 - 1",
    winProbability: { home: 55, draw: 25, away: 20 },
    keyFactor: "Sustained positional pressure vs. tempo control",
    confidenceRating: 78
  },
  "argentina_vs_france": {
    tacticalBattle: "Argentina utilizes a fluid central diamond to maintain numerical superiority in the core of the park, unleashing Lionel Messi to drift creatively. France adopts a lethal direct approach, leveraging Tchouaméni to absorb pressure and instantly feed Mbappé’s transition sprints into wide defensive blindspots.",
    starMatchup: "Cristian Romero vs. Kylian Mbappé: A battle of physical aggression against raw, elite velocity in transitions.",
    predictedScore: "2 - 2",
    winProbability: { home: 38, draw: 30, away: 32 },
    keyFactor: "Vulnerability of wide channels vs central overload efficiency",
    confidenceRating: 88
  },
  "portugal_vs_germany": {
    tacticalBattle: "Germany establishes a wide possession structure under Julian Nagelsmann, utilizing inverted playmakers to choke the internal channels. Portugal counters with a devastatingly dynamic attacking vanguard, using Bruno Fernandes to ping early diagonals into isolated winger matchups.",
    starMatchup: "Rúben Dias vs. Florian Wirtz: Tactical positioning from Dias vs. Wirtz's elite agility in turn-and-run pockets.",
    predictedScore: "1 - 1",
    winProbability: { home: 42, draw: 28, away: 30 },
    keyFactor: "Counter-pressing organization vs space utilization behind fullbacks",
    confidenceRating: 74
  }
};

// Dynamic key override helper to fetch user-provided API key from request headers securely
const getAIClient = (req: express.Request): GoogleGenAI | null => {
  const customKey = req.headers["x-gemini-api-key"] as string;
  if (customKey && customKey.trim() !== "" && customKey !== "null" && customKey !== "undefined") {
    try {
      return new GoogleGenAI({
        apiKey: customKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.error("Failed to initialize dynamic client:", e);
    }
  }
  return ai;
};

function isMatchConcludedInCache(home: string, away: string): boolean {
  const homeNorm = home.toLowerCase().trim();
  const awayNorm = away.toLowerCase().trim();
  
  for (const key in apiCache) {
    const entry = apiCache[key];
    if (!entry || !entry.data) continue;
    
    if (key.includes('/competitions/WC/matches') && Array.isArray(entry.data.matches)) {
      const match = entry.data.matches.find((m: any) => {
        const hName = (m.homeTeam?.name || "").toLowerCase().trim();
        const aName = (m.awayTeam?.name || "").toLowerCase().trim();
        return (hName === homeNorm && aName === awayNorm) || (hName === awayNorm && aName === homeNorm);
      });
      if (match) return ['FINISHED', 'AET', 'PEN'].includes(match.status);
    }
    
    if (Array.isArray(entry.data)) {
      const match = entry.data.find((m: any) => {
        const hName = (m.homeTeam || "").toLowerCase().trim();
        const aName = (m.awayTeam || "").toLowerCase().trim();
        return (hName === homeNorm && aName === awayNorm) || (hName === awayNorm && aName === homeNorm);
      });
      if (match) return match.status === "FT" || match.played === true;
    }
  }
  return false;
}

// Tactical analytics endpoint powered by real-time Gemini AI
app.post("/api/ai-insight", async (req, res) => {
  const { homeTeam = "Brazil", awayTeam = "Morocco", customInstructions = "", isFinished = false } = req.body;
  const matchKey = `${homeTeam.toLowerCase().trim()}_vs_${awayTeam.toLowerCase().trim()}`;

  if (isFinished || isMatchConcludedInCache(homeTeam, awayTeam)) {
    return res.json({
      tacticalBattle: "Match has concluded. AI tactical analysis is only available for live or upcoming matches.",
      starMatchup: "Not applicable (match completed)",
      predictedScore: "—",
      winProbability: { home: 0, draw: 0, away: 0 },
      keyFactor: "Not applicable (match completed)",
      confidenceRating: 0
    });
  }

  const activeAi = getAIClient(req);

  // If Gemini client is active, call real-time analytical engine
  if (activeAi) {
    try {
      console.log(`Querying Gemini to analyze Matchup: ${homeTeam} vs ${awayTeam}...`);
      const response = await activeAi.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an elite football tactical analyst and data science lead. Analyze the upcoming FIFA World Cup 2026 match: ${homeTeam} (Home) vs ${awayTeam} (Away).
        Provide a detailed tactical match preview including:
        1. Core Tactical Battle (focusing on formations, pressing, and positional structure).
        2. Star Player Matchup (highlighting individual rivalries defines the outcome).
        3. Predicted Scoreline (realistic football score e.g., "2 - 1" or "0 - 0").
        4. Win Probabilities: home, draw, and away probabilities in percentage (%) summing strictly to 100.
        5. Key Match-defining Factor.
        6. Confidence score rating (0-100%).
        
        ${customInstructions ? `IMPORTANT TACTICAL INPUTS TO INCORPORATE: "${customInstructions}" - Factor these directives into your formations and outcome metrics.` : ""}
        
        Strictly format your response as JSON matching the requested schema. Return only the JSON object.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tacticalBattle: {
                type: Type.STRING,
                description: "A professional and detailed 1-2 paragraph tactical analysis of how both teams play and counter each other."
              },
              starMatchup: {
                type: Type.STRING,
                description: "A detailed paragraph about the key individual 1v1 on-field matchup that will decide the balance of power."
              },
              predictedScore: {
                type: Type.STRING,
                description: "The most statistically probable scoreline in the format 'H - A' (e.g., '2 - 1')."
              },
              winProbability: {
                type: Type.OBJECT,
                properties: {
                  home: { type: Type.INTEGER, description: "Home win probability percentage" },
                  draw: { type: Type.INTEGER, description: "Draw probability percentage" },
                  away: { type: Type.INTEGER, description: "Away win probability percentage" }
                },
                required: ["home", "draw", "away"]
              },
              keyFactor: {
                type: Type.STRING,
                description: "A singular key factor that represents the match-defining metric (e.g. 'Defensive transition speed')."
              },
              confidenceRating: {
                type: Type.INTEGER,
                description: "The AI's analytical confidence coefficient (0-100%) for this prediction."
              }
            },
            required: ["tacticalBattle", "starMatchup", "predictedScore", "winProbability", "keyFactor", "confidenceRating"]
          }
        }
      });

      if (response && response.text) {
        const result = JSON.parse(response.text.trim());
        return res.json(result);
      }
    } catch (error) {
      console.error("Gemini call failed, utilizing high-quality analytical fallback:", error);
    }
  }

  // Fallback engine block
  const defaultInsight = FALLBACK_INSIGHTS[matchKey] || {
    tacticalBattle: `${homeTeam} operates an intensive high-block framework aiming to choke space, while ${awayTeam} prefers a compact low-mid block to defend transitional depth. Expect standard tactical adjustments down the flanks.`,
    starMatchup: `Central Playmaker of ${homeTeam} vs. Defensive Anchor of ${awayTeam} in an battle of transitional positioning.`,
    predictedScore: "2 - 1",
    winProbability: { home: 52, draw: 28, away: 20 },
    keyFactor: "Sustained high-pressing efficiency",
    confidenceRating: 75
  };

  return res.json(defaultInsight);
});

// Fetch real data from API-Football
const getTeamPlayersServer = (code: string): string[] => {
  switch (code.toUpperCase().trim()) {
    case "BRA": return ["Vinícius Júnior", "Rodrygo", "Neymar Jr", "Casemiro", "Bruno Guimarães", "Marquinhos"];
    case "ARG": return ["Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Enzo Fernández", "Alexis Mac Allister", "Cristian Romero"];
    case "FRA": return ["Kylian Mbappé", "Antoine Griezmann", "Ousmane Dembélé", "Aurélien Tchouaméni", "Theo Hernandez", "William Saliba"];
    case "ENG": return ["Harry Kane", "Jude Bellingham", "Bukayo Saka", "Phil Foden", "Declan Rice", "John Stones"];
    case "POR": return ["Cristiano Ronaldo", "Bruno Fernandes", "Bernardo Silva", "Rafael Leão", "João Cancelo", "Rúben Dias"];
    case "GER": return ["Florian Wirtz", "Jamal Musiala", "Kai Havertz", "İlkay Gündoğan", "Joshua Kimmich", "Antonio Rüdiger"];
    case "MOR": return ["Hakim Ziyech", "Youssef En-Nesyri", "Sofyan Amrabat", "Achraf Hakimi", "Nayef Aguerd", "Romain Saïss"];
    case "CRO": return ["Luka Modrić", "Mateo Kovačić", "Marcelo Brozović", "Ivan Perišić", "Joško Gvardiol", "Borna Sosa"];
    default: return ["Forward A", "Midfielder B", "Defender C", "Forward D", "Midfielder E"];
  }
};

function buildEventsFromRealData(
  homeCode: string, homeTeam: string, homeScore: number,
  awayCode: string, awayTeam: string, awayScore: number,
  minute: number,
  realGoals?: Array<{minute: number; team: string; scorer: string; assist?: string}>
): any[] {
  const events: any[] = [{
    minute: 0,
    type: "KICKOFF",
    team: homeCode,
    player: "Referee",
    detail: `Kickoff! ${homeTeam} vs ${awayTeam}.`
  }];

  if (realGoals && realGoals.length > 0) {
    // Use real goal data from API
    realGoals.forEach(g => {
      const isHome = g.team === homeCode || g.team === homeTeam;
      events.push({
        minute: g.minute,
        type: "GOAL",
        team: isHome ? homeCode : awayCode,
        player: g.scorer,
        detail: `GOAL! ${g.scorer} scores for ${isHome ? homeTeam : awayTeam}!${g.assist ? ` Assisted by ${g.assist}.` : ''}`
      });
    });
  } else if (homeScore > 0 || awayScore > 0) {
    // No real goal data — generate goal markers at plausible minutes but with UNKNOWN scorer
    const totalGoals = homeScore + awayScore;
    const usedMinutes = new Set<number>();
    const spreadMin = Math.min(minute > 0 ? minute : 90, 89);
    for (let i = 0; i < totalGoals; i++) {
      let m = Math.floor((spreadMin / totalGoals) * i) + Math.floor(Math.random() * 10) + 1;
      while (usedMinutes.has(m)) m++;
      usedMinutes.add(m);
      const isHome = i < homeScore;
      events.push({
        minute: m,
        type: "GOAL",
        team: isHome ? homeCode : awayCode,
        player: isHome ? homeTeam : awayTeam,
        detail: `GOAL for ${isHome ? homeTeam : awayTeam}! (scorer data unavailable)`
      });
    }
  }

  if (minute >= 90) {
    events.push({
      minute: 90,
      type: "KICKOFF",
      team: homeCode,
      player: "Referee",
      detail: `Full time! ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}.`
    });
  }

  return events.sort((a, b) => a.minute - b.minute);
}

// --- Football-Data.org API Helper & Endpoints ---
async function fetchFromFootballDataOrg(endpoint: string, apiKey: string, bypassCache = false): Promise<any> {
  const cacheKey = `footballdata:${endpoint}&key=${apiKey}`;
  
  // Cache matches for 60 seconds (football-data.org free tier = 10 req/min), others for 5 minutes
  const isLiveOrMatch = endpoint.includes('/matches');
  const ttl = isLiveOrMatch ? 60 * 1000 : CACHE_TTL;

  if (!bypassCache) {
    const cached = getCachedData(cacheKey, ttl);
    if (cached) {
      console.log(`[Cache HIT] Football-Data: ${endpoint}`);
      return cached;
    }
  }

  try {
    const url = `https://api.football-data.org/v4${endpoint}`;
    console.log(`[Football-Data.org] Fetching: ${endpoint}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Football-Data.org returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`[Football-Data.org] Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function fetchFootballDataMatchDetail(matchId: string, apiKey: string, bypassCache = false): Promise<any> {
  return await fetchFromFootballDataOrg(`/matches/${matchId.replace('live-', '')}`, apiKey, bypassCache);
}

async function fetchFixtureStatistics(matchId: string, apiKey: string, bypassCache = false): Promise<any> {
  const data = await fetchFootballDataMatchDetail(matchId, apiKey, bypassCache);
  if (!data || !data.statistics) return { possessionHome: 50, shotsHome: 0, shotsAway: 0 };
  
  const stats: Record<string, any> = {};
  data.statistics.forEach((s: any) => {
    stats[s.type] = s;
  });
  
  return {
    possessionHome: stats.POSSESSION?.home || 50,
    shotsHome: stats.SHOTS_ON_TARGET?.home || 0,
    shotsAway: stats.SHOTS_ON_TARGET?.away || 0
  };
}

async function fetchFootballDataMatches(apiKey: string, bypassCache = false): Promise<any[]> {
  const data = await fetchFromFootballDataOrg('/competitions/WC/matches', apiKey, bypassCache);
  if (!data || !data.matches) return [];
  
  // Separately fetch scorers for real goal attribution
  const scorersData = await fetchFromFootballDataOrg('/competitions/WC/scorers?limit=50', apiKey, bypassCache);
  const realScorers: Record<string, string> = {}; // teamCode -> top scorer name
  if (scorersData?.scorers) {
    scorersData.scorers.forEach((s: any) => {
      const code = normalizeTeamCode(s.team?.tla || '');
      if (code && !realScorers[code]) realScorers[code] = s.player?.name || '';
    });
  }

  return await Promise.all(data.matches.map(async (m: any) => {
    const isLive = ['IN_PLAY', 'PAUSED'].includes(m.status);
    const isFinished = ['FINISHED', 'AET', 'PEN'].includes(m.status);
    const isRecentFinished = isFinished && m.utcDate && (Math.abs(Date.now() - new Date(m.utcDate).getTime()) < 12 * 60 * 60 * 1000);
    
    let minute = 0;
    if (isLive && m.utcDate) {
      const startTime = new Date(m.utcDate).getTime();
      const elapsedMs = Date.now() - startTime;
      const elapsedMin = Math.floor(elapsedMs / 60000);
      // Use raw elapsed time — halftime subtraction is unreliable without exact kickoff data
      minute = Math.max(1, Math.min(90, elapsedMin));
    } else if (isFinished) {
      minute = 90;
    }
    
    const homeScore = m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? 0;
    const awayScore = m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? 0;
    const homeName = m.homeTeam?.name || "To Be Determined";
    const awayName = m.awayTeam?.name || "To Be Determined";
    const homeCode = normalizeTeamCode(m.homeTeam?.tla || (m.homeTeam?.name ? m.homeTeam.name.substring(0, 3).toUpperCase() : "TBD"));
    const awayCode = normalizeTeamCode(m.awayTeam?.tla || (m.awayTeam?.name ? m.awayTeam.name.substring(0, 3).toUpperCase() : "TBD"));

    // Build real events from goals array
    const realGoals = m.goals?.map((g: any) => ({
      minute: g.minute || 0,
      team: g.team?.name || "",
      scorer: g.scorer?.name || "Unknown Scorer",
      assist: g.assist?.name
    }));

    const events = (isLive || isFinished)
      ? buildEventsFromRealData(homeCode, homeName, homeScore, awayCode, awayName, awayScore, minute, realGoals)
      : [{ minute: 0, type: "KICKOFF" as const, team: homeCode, player: "Referee", detail: `${homeName} vs ${awayName} — upcoming.` }];
    
    // Fetch live stats
    const stats = (isLive || isFinished) ? await fetchFixtureStatistics(`live-${m.id}`, apiKey, bypassCache) : { possessionHome: 50, shotsHome: 0, shotsAway: 0 };

    return {
      id: `live-${m.id}`,
      homeTeam: homeName,
      homeCode,
      awayTeam: awayName,
      awayCode,
      homeScore,
      awayScore,
      minute,
      ...stats,
      status: isLive ? "LIVE" : isFinished ? "FT" : "NS",
      isRecentFinished,
      events: events.sort((a, b) => a.minute - b.minute)
    };
  })).then(results => results.filter((m: any) => m.status === "LIVE" || (m.status === "FT" && m.isRecentFinished)));
}

async function fetchFootballDataFixtures(apiKey: string, bypassCache = false): Promise<any[]> {
  const data = await fetchFromFootballDataOrg('/competitions/WC/matches', apiKey, bypassCache);
  if (!data || !data.matches) return [];

  return data.matches.map((m: any) => {
    const isFinished = ['FINISHED', 'AET', 'PEN'].includes(m.status);
    let time = "00:00 AM";
    let dateStr = "";
    if (m.utcDate) {
      const d = new Date(m.utcDate);
      time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    const homeName = m.homeTeam?.name || "To Be Determined";
    const awayName = m.awayTeam?.name || "To Be Determined";
    const homeCode = normalizeTeamCode(m.homeTeam?.tla || (m.homeTeam?.name ? m.homeTeam.name.substring(0, 3).toUpperCase() : "TBD"));
    const awayCode = normalizeTeamCode(m.awayTeam?.tla || (m.awayTeam?.name ? m.awayTeam.name.substring(0, 3).toUpperCase() : "TBD"));

    return {
      id: `fix-${m.id}`,
      homeTeam: homeName,
      homeCode,
      awayTeam: awayName,
      awayCode,
      time,
      group: m.group?.replace('GROUP_', '') || 'A',
      played: isFinished,
      score: isFinished ? `${m.score?.fullTime?.home ?? 0} - ${m.score?.fullTime?.away ?? 0}` : undefined,
      date: dateStr,
      kickoffISO: m.utcDate || undefined
    };
  }).slice(0, 30);
}

async function fetchFootballDataStandings(apiKey: string, bypassCache = false): Promise<Record<string, any[]>> {
  const data = await fetchFromFootballDataOrg('/competitions/WC/standings', apiKey, bypassCache);
  const standings: Record<string, any[]> = { A: [], B: [], C: [], D: [] };
  if (!data || !data.standings) return standings;

  data.standings.forEach((s: any) => {
    const groupLetter = s.group?.replace('GROUP_', '') || 'A';
    if (standings[groupLetter] !== undefined) {
      standings[groupLetter] = s.table.map((teamEntry: any) => ({
        team: teamEntry.team?.name || "To Be Determined",
        code: normalizeTeamCode(teamEntry.team?.tla || (teamEntry.team?.name ? teamEntry.team.name.substring(0, 3).toUpperCase() : "TBD")),
        played: teamEntry.playedGames || 0,
        won: teamEntry.won || 0,
        drawn: teamEntry.draw || 0,
        lost: teamEntry.lost || 0,
        gd: teamEntry.goalDifference || 0,
        pts: teamEntry.points || 0
      }));
    }
  });

  return standings;
}

async function fetchFootballDataScorers(apiKey: string, bypassCache = false): Promise<any[]> {
  const data = await fetchFromFootballDataOrg('/competitions/WC/scorers', apiKey, bypassCache);
  if (!data || !data.scorers) return [];

  return data.scorers.slice(0, 10).map((s: any, idx: number) => {
    const teamName = s.team?.name || "Unknown Team";
    const teamCode = normalizeTeamCode(s.team?.tla || (s.team?.name ? s.team.name.substring(0, 3).toUpperCase() : "UNK"));
    
    return {
      id: `scorer-${idx}`,
      name: s.player.name,
      team: teamName,
      teamCode,
      position: s.player.position || 'FW',
      goals: (s.goals || 0).toString(),
      assists: (s.assists || 0).toString(),
      rating: (7.0 + Math.random() * 2.0).toFixed(1)
    };
  });
}

// --- Fetch real data from API-Football ---
async function fetchLiveMatches(apiKey: string, bypassCache = false): Promise<any[]> {
  const leagueId = await resolveWorldCupLeagueId(apiKey, bypassCache);
  if (!leagueId) return [];
  
  const result = await fetchFromAPIFootball('/fixtures', {
    league: leagueId.toString(),
    live: 'all'
  }, apiKey, bypassCache);
  
  if (!result || !result.response) return [];
  
  return Promise.all(result.response.map(async (fix: any) => {
    const statusShort = fix.fixture.status.short;
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(statusShort);
    const isFinished = ['FT', 'AET', 'PEN'].includes(statusShort);
    
    const homeCode = normalizeTeamCode(fix.teams.home.code || fix.teams.home.name.substring(0, 3).toUpperCase());
    const awayCode = normalizeTeamCode(fix.teams.away.code || fix.teams.away.name.substring(0, 3).toUpperCase());
    
    const rawEvents = isLive || isFinished 
      ? await fetchLiveMatchEvents(fix.fixture.id, apiKey, bypassCache) 
      : [];
    
    // Normalize event team field: map team names/codes to our homeCode or awayCode
    const events = rawEvents.map((evt: any) => {
      const evtTeamUpper = (evt.team || '').toUpperCase().trim();
      const normalizedEvtCode = normalizeTeamCode(evtTeamUpper);
      let teamCode: string;
      if (normalizedEvtCode === homeCode || fix.teams.home.name?.toLowerCase() === evt.team?.toLowerCase()) {
        teamCode = homeCode;
      } else if (normalizedEvtCode === awayCode || fix.teams.away.name?.toLowerCase() === evt.team?.toLowerCase()) {
        teamCode = awayCode;
      } else {
        teamCode = normalizedEvtCode || homeCode;
      }
      return { ...evt, team: teamCode };
    });
      
    // Fetch real statistics for live/finished matches
    let liveStats = { possessionHome: 50, shotsHome: 0, shotsAway: 0 };
    if (isLive || isFinished) {
      try {
        const statsResult = await fetchFromAPIFootball('/fixtures/statistics', {
          fixture: fix.fixture.id.toString()
        }, apiKey, bypassCache);
        if (statsResult?.response && statsResult.response.length >= 2) {
          const homeStats = statsResult.response[0]?.statistics || [];
          const awayStats = statsResult.response[1]?.statistics || [];
          const findStat = (arr: any[], type: string) => arr.find((s: any) => s.type === type)?.value;
          const homePoss = parseInt(findStat(homeStats, 'Ball Possession') || '50', 10);
          liveStats = {
            possessionHome: isNaN(homePoss) ? 50 : homePoss,
            shotsHome: findStat(homeStats, 'Shots on Goal') || 0,
            shotsAway: findStat(awayStats, 'Shots on Goal') || 0
          };
        }
      } catch (e) {
        // keep defaults
      }
    }

    if (events.length === 0) {
      events.push({
        minute: 0,
        type: "KICKOFF",
        team: homeCode,
        player: "Referee",
        detail: "Match has kicked off!"
      });
    }
    
    return {
      id: `live-${fix.fixture.id}`,
      homeTeam: fix.teams.home.name,
      homeCode,
      awayTeam: fix.teams.away.name,
      awayCode,
      homeScore: fix.goals.home ?? 0,
      awayScore: fix.goals.away ?? 0,
      minute: fix.fixture.status.elapsed || 0,
      possessionHome: liveStats.possessionHome,
      shotsHome: liveStats.shotsHome,
      shotsAway: liveStats.shotsAway,
      status: isLive ? "LIVE" : isFinished ? "FT" : "NS",
      events: events.sort((a: any, b: any) => a.minute - b.minute)
    };
  }));
}

async function fetchFixtures(apiKey: string, bypassCache = false): Promise<any[]> {
  const leagueId = await resolveWorldCupLeagueId(apiKey, bypassCache);
  if (!leagueId) return [];
  
  // Fetch BOTH recent played results (last 20) and upcoming fixtures (next 20)
  const [nextResult, lastResult] = await Promise.all([
    fetchFromAPIFootball('/fixtures', { league: leagueId.toString(), season: '2026', next: '20' }, apiKey, bypassCache),
    fetchFromAPIFootball('/fixtures', { league: leagueId.toString(), season: '2026', last: '20' }, apiKey, bypassCache)
  ]);

  const allFixtures: any[] = [
    ...(lastResult?.response || []),
    ...(nextResult?.response || [])
  ];

  // Deduplicate by fixture id
  const seen = new Set<string>();
  const dedupedFixtures = allFixtures.filter(fix => {
    const id = fix.fixture.id.toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  if (dedupedFixtures.length === 0) return [];
  
  return dedupedFixtures.map((fix: any) => {
    const statusShort = fix.fixture.status.short;
    const isPlayed = ['FT', 'AET', 'PEN'].includes(statusShort);
    const homeCode = normalizeTeamCode(fix.teams.home.code || fix.teams.home.name.substring(0, 3).toUpperCase());
    const awayCode = normalizeTeamCode(fix.teams.away.code || fix.teams.away.name.substring(0, 3).toUpperCase());
    return {
      id: `fix-${fix.fixture.id}`,
      homeTeam: fix.teams.home.name,
      homeCode,
      awayTeam: fix.teams.away.name,
      awayCode,
      time: new Date(fix.fixture.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      group: fix.league.round?.replace('Group ', '') || 'A',
      played: isPlayed,
      score: isPlayed ? `${fix.goals.home ?? 0} - ${fix.goals.away ?? 0}` : undefined,
      date: new Date(fix.fixture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      kickoffISO: fix.fixture.date
    };
  });
}

async function fetchStandings(apiKey: string, bypassCache = false): Promise<Record<string, any[]>> {
  const leagueId = await resolveWorldCupLeagueId(apiKey, bypassCache);
  if (!leagueId) return { A: [], B: [], C: [], D: [] };
  
  const result = await fetchFromAPIFootball('/standings', {
    league: leagueId.toString(),
    season: '2026'
  }, apiKey, bypassCache);
  
  if (!result || !result.response || !result.response[0]) {
    return { A: [], B: [], C: [], D: [] };
  }
  
  const standings: Record<string, any[]> = { A: [], B: [], C: [], D: [] };
  
  result.response[0].league.standings.forEach((groupStandings: any[]) => {
    if (groupStandings.length > 0) {
      const groupName = groupStandings[0].group?.replace('Group ', '') || 'A';
      standings[groupName] = groupStandings.map((item: any) => ({
        team: item.team.name,
        code: normalizeTeamCode(item.team.code || item.team.name.substring(0, 3).toUpperCase()),
        played: item.all?.played || 0,
        won: item.all?.win || 0,
        drawn: item.all?.draw || 0,
        lost: item.all?.lose || 0,
        gd: item.goalsDiff || 0,
        pts: item.points || 0
      }));
    }
  });
  
  return standings;
}

async function fetchTopScorers(apiKey: string, bypassCache = false): Promise<any[]> {
  const leagueId = await resolveWorldCupLeagueId(apiKey, bypassCache);
  if (!leagueId) return [];
  
  const result = await fetchFromAPIFootball('/players/topscorers', {
    league: leagueId.toString(),
    season: '2026'
  }, apiKey, bypassCache);
  
  if (!result || !result.response) return [];
  
  return result.response.slice(0, 10).map((player: any, idx: number) => ({
    id: `scorer-${idx}`,
    name: player.player.name,
    team: player.statistics[0]?.team?.name || 'Unknown',
    teamCode: normalizeTeamCode(player.statistics[0]?.team?.code || 'UNK'),
    position: player.statistics[0]?.games?.position || player.player.position || 'FW',
    goals: player.statistics[0]?.goals?.total || 0,
    assists: player.statistics[0]?.goals?.assists || 0,
    rating: player.statistics[0]?.games?.rating || '0.0'
  }));
}

async function fetchTopAssists(apiKey: string, bypassCache = false): Promise<any[]> {
  const leagueId = await resolveWorldCupLeagueId(apiKey, bypassCache);
  if (!leagueId) return [];
  
  const result = await fetchFromAPIFootball('/players/topassists', {
    league: leagueId.toString(),
    season: '2026'
  }, apiKey, bypassCache);
  
  if (!result || !result.response) return [];
  
  return result.response.slice(0, 10).map((player: any, idx: number) => ({
    id: `assist-${idx}`,
    name: player.player.name,
    team: player.statistics[0]?.team?.name || 'Unknown',
    teamCode: normalizeTeamCode(player.statistics[0]?.team?.code || 'UNK'),
    position: player.statistics[0]?.games?.position || player.player.position || 'MF',
    assists: player.statistics[0]?.goals?.assists || 0,
    keyPasses: player.statistics[0]?.passes?.key || 0,
    accuracy: player.statistics[0]?.passes?.accuracy ? `${player.statistics[0].passes.accuracy}%` : '0%'
  }));
}

async function fetchTeamRatings(apiKey: string, bypassCache = false): Promise<any[]> {
  const leagueId = await resolveWorldCupLeagueId(apiKey, bypassCache);
  if (!leagueId) return [];
  
  const result = await fetchFromAPIFootball('/teams', {
    league: leagueId.toString(),
    season: '2026'
  }, apiKey, bypassCache);
  
  if (!result || !result.response) return [];
  
  return result.response.map((team: any) => ({
    id: `team-${team.team.id}`,
    name: team.team.name,
    code: normalizeTeamCode(team.team.code || team.team.name.substring(0, 3).toUpperCase()),
    rating: 75 + Math.floor(Math.random() * 20),
    stars: team.team.fifa_ranking ? Math.ceil(team.team.fifa_ranking / 30) : 3
  }));
}

// Shared schema definition for the online World Cup dashboard
const DASHBOARD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    news: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          tag: { type: Type.STRING, description: "E.g., 'BREAKING', 'QUALIFIERS', 'REPORTS'" },
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          content: { type: Type.STRING, description: "Full informative detail of the news." },
          timeAgo: { type: Type.STRING },
          imageTheme: { type: Type.STRING, description: "Tailwind CSS gradient class, e.g., 'from-amber-600 to-green-600'" }
        },
        required: ["id", "tag", "title", "summary", "content", "timeAgo", "imageTheme"]
      }
    },
    stats: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          team: { type: Type.STRING },
          position: { type: Type.STRING },
          goals: { type: Type.STRING },
          assists: { type: Type.STRING },
          rating: { type: Type.STRING }
        },
        required: ["id", "name", "team", "position", "goals", "assists", "rating"]
      }
    },
    liveMatches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          homeTeam: { type: Type.STRING },
          homeCode: { type: Type.STRING },
          awayTeam: { type: Type.STRING },
          awayCode: { type: Type.STRING },
          homeScore: { type: Type.INTEGER },
          awayScore: { type: Type.INTEGER },
          minute: { type: Type.INTEGER },
          possessionHome: { type: Type.INTEGER },
          shotsHome: { type: Type.INTEGER },
          shotsAway: { type: Type.INTEGER },
          status: { type: Type.STRING, description: "Either 'LIVE' or 'FT'" },
          events: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                minute: { type: Type.INTEGER },
                type: { type: Type.STRING, description: "E.g., KICKOFF, GOAL, CARD" },
                team: { type: Type.STRING },
                player: { type: Type.STRING },
                detail: { type: Type.STRING }
              },
              required: ["minute", "type", "team", "player", "detail"]
            }
          }
        },
        required: ["id", "homeTeam", "homeCode", "awayTeam", "awayCode", "homeScore", "awayScore", "minute", "possessionHome", "shotsHome", "shotsAway", "status", "events"]
      }
    },
    fixtures: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          homeTeam: { type: Type.STRING },
          homeCode: { type: Type.STRING },
          awayTeam: { type: Type.STRING },
          awayCode: { type: Type.STRING },
          time: { type: Type.STRING },
          group: { type: Type.STRING },
          played: { type: Type.BOOLEAN },
          score: { type: Type.STRING }
        },
        required: ["id", "homeTeam", "homeCode", "awayTeam", "awayCode", "time", "group", "played"]
      }
    },
    standings: {
      type: Type.OBJECT,
      description: "Map of Group letter (A, B, C, D) to standard Standing table array",
      properties: {
        A: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              team: { type: Type.STRING },
              code: { type: Type.STRING },
              played: { type: Type.INTEGER },
              won: { type: Type.INTEGER },
              drawn: { type: Type.INTEGER },
              lost: { type: Type.INTEGER },
              gd: { type: Type.INTEGER },
              pts: { type: Type.INTEGER }
            },
            required: ["team", "code", "played", "won", "drawn", "lost", "gd", "pts"]
          }
        },
        B: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              team: { type: Type.STRING },
              code: { type: Type.STRING },
              played: { type: Type.INTEGER },
              won: { type: Type.INTEGER },
              drawn: { type: Type.INTEGER },
              lost: { type: Type.INTEGER },
              gd: { type: Type.INTEGER },
              pts: { type: Type.INTEGER }
            },
            required: ["team", "code", "played", "won", "drawn", "lost", "gd", "pts"]
          }
        },
        C: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              team: { type: Type.STRING },
              code: { type: Type.STRING },
              played: { type: Type.INTEGER },
              won: { type: Type.INTEGER },
              drawn: { type: Type.INTEGER },
              lost: { type: Type.INTEGER },
              gd: { type: Type.INTEGER },
              pts: { type: Type.INTEGER }
            },
            required: ["team", "code", "played", "won", "drawn", "lost", "gd", "pts"]
          }
        },
        D: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              team: { type: Type.STRING },
              code: { type: Type.STRING },
              played: { type: Type.INTEGER },
              won: { type: Type.INTEGER },
              drawn: { type: Type.INTEGER },
              lost: { type: Type.INTEGER },
              gd: { type: Type.INTEGER },
              pts: { type: Type.INTEGER }
            },
            required: ["team", "code", "played", "won", "drawn", "lost", "gd", "pts"]
          }
        }
      },
      required: ["A", "B", "C", "D"]
    }
  },
  required: ["news", "stats", "liveMatches", "fixtures", "standings"]
};

// Primary data source: ESPN API (free, no auth, real-time with exact match minutes)
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";

async function fetchESPNData(bypassCache = false): Promise<any> {
  const cacheKey = "espn:scoreboard";
  if (!bypassCache) {
    const cached = getCachedData(cacheKey, 10 * 1000); // 10 second cache for live
    if (cached) {
      console.log("[Cache HIT] ESPN scoreboard");
      return cached;
    }
  }

  try {
    console.log("[ESPN] Fetching live scoreboard...");
    const response = await fetch(`${ESPN_BASE}/scoreboard`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!response.ok) throw new Error(`ESPN returned ${response.status}`);
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("[ESPN] Error fetching scoreboard:", error);
    return null;
  }
}

function parseESPNEvents(espnData: any): { liveMatches: any[]; fixtures: any[]; news: any[]; stats: any[]; standings: Record<string, any[]> } {
  const liveMatches: any[] = [];
  const fixtures: any[] = [];
  const allGoals: any[] = [];

  if (!espnData || !espnData.events) return { liveMatches: [], fixtures: [], news: [], stats: [], standings: { A: [], B: [], C: [], D: [] } };

  for (const event of espnData.events) {
    const comp = event.competitions?.[0];
    if (!comp) continue;

    const status = comp.status?.type?.state; // "in", "post", "pre"
    const displayClock = comp.status?.displayClock || "0'";
    const isLive = status === "in";
    const isFinished = status === "post";
    const isScheduled = status === "pre";

    const homeCompetitor = comp.competitors?.find((c: any) => c.homeAway === "home");
    const awayCompetitor = comp.competitors?.find((c: any) => c.homeAway === "away");
    if (!homeCompetitor || !awayCompetitor) continue;

    const homeTeam = homeCompetitor.team?.displayName || "TBD";
    const homeCode = homeCompetitor.team?.abbreviation || "TBD";
    const awayTeam = awayCompetitor.team?.displayName || "TBD";
    const awayCode = awayCompetitor.team?.abbreviation || "TBD";
    const homeScore = parseInt(homeCompetitor.score || "0", 10);
    const awayScore = parseInt(awayCompetitor.score || "0", 10);

    // Use ESPN's displayClock directly — it already shows correct time + stoppage (e.g. "90'+7'")
    let minute = 0;
    let displayTime = "0'";
    if (isLive) {
      const totalSecs = comp.status?.clock || 0;
      minute = Math.floor(totalSecs / 60);
      displayTime = displayClock; // "87'" or "90'+3'" etc.
    } else if (isFinished) {
      minute = 90;
      displayTime = "FT";
    } else {
      displayTime = displayClock;
    }

    // Extract possession and shots from statistics
    const homeStats = homeCompetitor.statistics || [];
    const awayStats = awayCompetitor.statistics || [];
    const getStat = (stats: any[], name: string) => {
      const found = stats.find((s: any) => s.name === name);
      return found ? parseFloat(found.displayValue) || 0 : 0;
    };
    const possessionHome = Math.round(getStat(homeStats, "possessionPct"));
    const shotsHome = getStat(homeStats, "shotsOnTarget");
    const shotsAway = getStat(awayStats, "shotsOnTarget");

    // Extract match events (goals, cards, etc.)
    const events: any[] = [];
    const details = comp.details || [];
    for (const detail of details) {
      const eventType = detail.type?.text || "";
      const clockVal = detail.clock?.displayValue || "0'";
      const evtMinute = parseInt(clockVal.replace(/[^0-9]/g, ""), 10) || 0;
      const playerName = detail.athletesInvolved?.[0]?.displayName || "Unknown";
      const evtTeam = detail.team?.id === homeCompetitor.id ? homeCode : awayCode;

      let type: "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "KICKOFF" | "ACTION" = "ACTION";
      if (eventType.includes("Goal") || eventType.includes("Penalty") || eventType.includes("Own Goal")) {
        type = "GOAL";
        allGoals.push({ minute: evtMinute, team: evtTeam, scorer: playerName, homeTeam, awayTeam });
      } else if (eventType.includes("Yellow")) {
        type = "YELLOW_CARD";
      } else if (eventType.includes("Red")) {
        type = "RED_CARD";
      } else if (eventType.includes("Substitution")) {
        type = "SUBSTITUTION";
      }

      events.push({
        minute: evtMinute,
        type,
        team: evtTeam,
        player: playerName,
        detail: `${eventType} - ${playerName} (${clockVal})`
      });
    }

    // Add kickoff event if no events yet
    if (events.length === 0 || !events.some(e => e.type === "KICKOFF")) {
      events.unshift({
        minute: 0,
        type: "KICKOFF" as const,
        team: homeCode,
        player: "Referee",
        detail: isFinished ? `Full time: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}` : `${homeTeam} vs ${awayTeam}`
      });
    }

    events.sort((a: any, b: any) => a.minute - b.minute);

    const matchData = {
      id: `espn-${event.id}`,
      homeTeam,
      homeCode,
      awayTeam,
      awayCode,
      homeScore,
      awayScore,
      minute,
      displayTime,
      possessionHome: possessionHome || 50,
      shotsHome,
      shotsAway,
      status: isLive ? "LIVE" : isFinished ? "FT" : "NS",
      events
    };

    if (isLive || isFinished) {
      liveMatches.push(matchData);
    } else if (isScheduled) {
      const kickoffDate = event.date ? new Date(event.date) : null;
      fixtures.push({
        id: `fix-espn-${event.id}`,
        homeTeam,
        homeCode,
        awayTeam,
        awayCode,
        time: kickoffDate ? kickoffDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "TBD",
        group: comp.altGameNote?.replace("FIFA World Cup, ", "") || "A",
        played: false,
        date: kickoffDate ? kickoffDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "",
        kickoffISO: event.date || undefined
      });
    }
  }

  // Build news from finished matches
  const recentResults = liveMatches.filter((m: any) => m.status === "FT").slice(0, 5);
  const news = recentResults.map((match: any, idx: number) => ({
    id: `news-espn-${idx}`,
    tag: "MATCH RESULT",
    title: `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`,
    summary: `Full-time result from the FIFA World Cup 2026.`,
    content: `${match.homeTeam} faced ${match.awayTeam} in the FIFA World Cup 2026. The final score was ${match.homeScore} - ${match.awayScore}.`,
    timeAgo: "Just now",
    imageTheme: "from-emerald-600 to-blue-700"
  }));

  if (news.length === 0) {
    news.push({
      id: "news-wc2026",
      tag: "WORLD CUP 2026",
      title: "FIFA World Cup 2026 is Live!",
      summary: "Real-time data syncing from ESPN.",
      content: "Follow all the action from the FIFA World Cup 2026 with real-time updates.",
      timeAgo: "Just now",
      imageTheme: "from-amber-600 to-green-600"
    });
  }

  // Build stats from goals
  const stats = allGoals.reduce((acc: any[], goal) => {
    const existing = acc.find((s: any) => s.name === goal.scorer);
    if (existing) {
      existing.goals = (parseInt(existing.goals) + 1).toString();
    } else {
      acc.push({
        id: `scorer-${acc.length}`,
        name: goal.scorer,
        team: goal.team === goal.homeTeam ? goal.homeTeam : goal.awayTeam,
        teamCode: goal.team,
        position: "FW",
        goals: "1",
        assists: "0",
        rating: (7.0 + Math.random() * 2.0).toFixed(1)
      });
    }
    return acc;
  }, []);

  return { liveMatches, fixtures, news, stats, standings: { A: [], B: [], C: [], D: [] } };
}

// Primary data source: API-Football with Gemini fallback
app.get("/api/online-dashboard", async (req, res) => {
  console.log("[Dashboard] Fetching real-time World Cup data...");
  
  const bypassCache = req.headers["x-bypass-cache"] === "true";

  // 1. Try ESPN first (free, no auth, real-time with exact minutes)
  try {
    const espnData = await fetchESPNData(bypassCache);
    if (espnData && espnData.events && espnData.events.length > 0) {
      const parsed = parseESPNEvents(espnData);
      console.log(`[Dashboard] ESPN data loaded: ${parsed.liveMatches.length} matches, ${parsed.fixtures.length} fixtures`);
      return res.json(parsed);
    }
  } catch (error) {
    console.error("[Dashboard] ESPN sync failed, trying fallback:", error);
  }

  // 3. Fallback to Gemini AI
  const activeAi = getAIClient(req);
  if (activeAi) {
    try {
      let response;
      try {
        console.log("Querying Gemini with Google Search tool to construct real-time World Cup data...");
        response = await activeAi.models.generateContent({
          model: "gemini-3.5-flash",
          contents: "Search the web to gather the latest actual real-world news stories, team qualifier standings, group tables, top tournament/qualification stats, developments, real live match scores, recent results, and upcoming fixtures for the FIFA World Cup 2026. Return a comprehensive structured JSON payload incorporating this fresh information.",
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: DASHBOARD_SCHEMA,
          }
        });
      } catch (groundingError: any) {
        console.warn("Gemini Search Grounding tool failed or quota exhausted. Retrying without search tool...", groundingError?.message || groundingError);
        response = await activeAi.models.generateContent({
          model: "gemini-3.5-flash",
          contents: "Construct high-quality structured news lists, team standings group tables, qualifications or top tournament stats, live matches under way, and fixtures/schedules for the FIFA World Cup 2026 based on your deep football knowledge. Return a comprehensive structured JSON payload incorporating realistic but fresh tournament data, player stats, headlines, and details.",
          config: {
            responseMimeType: "application/json",
            responseSchema: DASHBOARD_SCHEMA,
          }
        });
      }

      if (response && response.text) {
        const result = JSON.parse(response.text.trim());
        return res.json(result);
      }
    } catch (error) {
      console.error("Gemini analytical dashboard generation failed completely:", error);
    }
  }

  // Final fallback: minimal empty state (no mockup data)
  console.log("[Dashboard] No API available, returning empty state");
  return res.json({
    news: [],
    stats: [],
    liveMatches: [],
    fixtures: [],
    standings: { A: [], B: [], C: [], D: [] }
  });
});

// Health check and simulation status endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "alive", system: "World Cup 2026 AI Analytical Core Engine" });
});

// Vite middleware setup or Static file server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development Server middleware mounted safely on Express.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Serving prod assets from ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-Stack Server booting successfully at http://0.0.0.0:${PORT}`);
  });
}

startServer();
