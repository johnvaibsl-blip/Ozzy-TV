export interface Team {
  id: string;
  name: string;
  code: string;
  rating: number;
  stars: number;
  attack: number;
  defense: number;
  group: string;
}

export interface LiveMatch {
  id: string;
  homeTeam: string;
  homeCode: string;
  awayTeam: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  displayTime?: string;
  possessionHome: number;
  shotsHome: number;
  shotsAway: number;
  status: "LIVE" | "FT" | "NS";
  events: MatchEvent[];
}

export interface MatchEvent {
  minute: number;
  type: "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "KICKOFF" | "ACTION";
  team: string; // home, away, or team code
  player: string;
  detail: string;
}

export interface Fixture {
  id: string;
  homeTeam: string;
  homeCode: string;
  awayTeam: string;
  awayCode: string;
  time: string;
  group: string;
  played: boolean;
  score?: string;
  date?: string;
  kickoffISO?: string;
}

export interface Standing {
  team: string;
  code: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalDiff: number;
  points: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  timeAgo: string;
  imageTheme: string; // Gradient style for illustration fallback
  tag: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  team: string;
  code: string;
  rating: number;
  position: string;
  stats: { label: string; value: string }[];
  marketValue: string;
  highlights: string[];
}

export const TEAMS: Record<string, Team> = {
  BRA: { id: "bra", name: "Brazil", code: "BRA", rating: 91.2, stars: 5, attack: 92, defense: 88, group: "C" },
  ARG: { id: "arg", name: "Argentina", code: "ARG", rating: 89.1, stars: 5, attack: 90, defense: 86, group: "A" },
  FRA: { id: "fra", name: "France", code: "FRA", rating: 87.3, stars: 5, attack: 88, defense: 85, group: "B" },
  ENG: { id: "eng", name: "England", code: "ENG", rating: 85.7, stars: 5, attack: 87, defense: 83, group: "C" },
  POR: { id: "por", name: "Portugal", code: "POR", rating: 84.2, stars: 5, attack: 86, defense: 82, group: "D" },
  GER: { id: "ger", name: "Germany", code: "GER", rating: 83.9, stars: 4, attack: 85, defense: 81, group: "D" },
  MOR: { id: "mor", name: "Morocco", code: "MOR", rating: 82.5, stars: 4, attack: 81, defense: 84, group: "C" },
  CRO: { id: "cro", name: "Croatia", code: "CRO", rating: 81.0, stars: 4, attack: 79, defense: 83, group: "B" },
  ESP: { id: "esp", name: "Spain", code: "ESP", rating: 83.5, stars: 4, attack: 84, defense: 82, group: "A" },
  HAI: { id: "hai", name: "Haiti", code: "HAI", rating: 65.4, stars: 3, attack: 64, defense: 66, group: "C" },
  SCO: { id: "sco", name: "Scotland", code: "SCO", rating: 73.1, stars: 3, attack: 71, defense: 75, group: "C" },
  QAT: { id: "qat", name: "Qatar", code: "QAT", rating: 71.5, stars: 3, attack: 73, defense: 70, group: "C" },
  SUI: { id: "sui", name: "Switzerland", code: "SUI", rating: 78.4, stars: 4, attack: 77, defense: 79, group: "C" },
  AUS: { id: "aus", name: "Australia", code: "AUS", rating: 75.2, stars: 3, attack: 74, defense: 76, group: "C" },
  TUR: { id: "tur", name: "Türkiye", code: "TUR", rating: 79.1, stars: 4, attack: 80, defense: 78, group: "C" }
};

export const INITIAL_LIVE_MATCHES: LiveMatch[] = [];

export const TODAY_FIXTURES: Fixture[] = [
  { id: "fix-1", homeTeam: "Qatar", homeCode: "QAT", awayTeam: "Switzerland", awayCode: "SUI", time: "01:00 AM", group: "C", played: false },
  { id: "fix-2", homeTeam: "Brazil", homeCode: "BRA", awayTeam: "Morocco", awayCode: "MOR", time: "04:00 AM", group: "C", played: false },
  { id: "fix-3", homeTeam: "Haiti", homeCode: "HAI", awayTeam: "Scotland", awayCode: "SCO", time: "07:00 AM", group: "C", played: false },
  { id: "fix-4", homeTeam: "Australia", homeCode: "AUS", awayTeam: "Türkiye", awayCode: "TUR", time: "10:00 AM", group: "C", played: false }
];

export const GROUP_STANDINGS: Record<string, Standing[]> = {
  C: [
    { team: "Brazil", code: "BRA", played: 1, win: 1, draw: 0, loss: 0, goalDiff: 2, points: 3 },
    { team: "Morocco", code: "MOR", played: 1, win: 1, draw: 0, loss: 0, goalDiff: 1, points: 3 },
    { team: "Haiti", code: "HAI", played: 1, win: 0, draw: 0, loss: 1, goalDiff: -1, points: 0 },
    { team: "Scotland", code: "SCO", played: 1, win: 0, draw: 0, loss: 1, goalDiff: -2, points: 0 }
  ],
  A: [
    { team: "Argentina", code: "ARG", played: 1, win: 1, draw: 0, loss: 0, goalDiff: 3, points: 3 },
    { team: "Spain", code: "ESP", played: 1, win: 1, draw: 0, loss: 0, goalDiff: 1, points: 3 },
    { team: "Canada", code: "CAN", played: 1, win: 0, draw: 0, loss: 1, goalDiff: -1, points: 0 },
    { team: "Chile", code: "CHI", played: 1, win: 0, draw: 0, loss: 1, goalDiff: -3, points: 0 }
  ],
  B: [
    { team: "France", code: "FRA", played: 1, win: 1, draw: 0, loss: 0, goalDiff: 2, points: 3 },
    { team: "Croatia", code: "CRO", played: 1, win: 0, draw: 1, loss: 0, goalDiff: 0, points: 1 },
    { team: "Mexico", code: "MEX", played: 1, win: 0, draw: 1, loss: 0, goalDiff: 0, points: 1 },
    { team: "Nigeria", code: "NGA", played: 1, win: 0, draw: 0, loss: 1, goalDiff: -2, points: 0 }
  ],
  D: [
    { team: "Portugal", code: "POR", played: 1, win: 1, draw: 0, loss: 0, goalDiff: 1, points: 3 },
    { team: "Germany", code: "GER", played: 1, win: 0, draw: 1, loss: 0, goalDiff: 0, points: 1 },
    { team: "USA", code: "USA", played: 1, win: 0, draw: 1, loss: 0, goalDiff: 0, points: 1 },
    { team: "Japan", code: "JPN", played: 1, win: 0, draw: 0, loss: 1, goalDiff: -1, points: 0 }
  ]
};

export const LATEST_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    tag: "MATCH DAY",
    title: "Brazil Show Strength in Opening Match Win",
    summary: "Vinícius Júnior inspires the Seleção to a commanding performance with tactical insights showing superiority on high transition counters.",
    content: "The Seleção sent a clear warning signal to fellow heavyweights with a tactical showcase. Coach Dorival emphasized vertical transitions and continuous overload on the flanks, forcing the opponent to retreat into a narrow shell. Analytical records showed 64% territory control inside the decisive third.",
    timeAgo: "2h ago",
    imageTheme: "from-amber-600 to-green-600"
  },
  {
    id: "news-2",
    tag: "ANALYSIS",
    title: "World Cup 2026: Top Contenders Analysis",
    summary: "Deep numerical breakdown of squad metrics, tactical frameworks, and projected progression routes using regression prediction models.",
    content: "Our AI model identifies France, Argentina, and Brazil as the primary title contenders. Behind them, England and Portugal possess the highest vertical efficiency metrics but struggle with defensive transition speed, indicating high risk against robust counter-attacking opposition.",
    timeAgo: "5h ago",
    imageTheme: "from-blue-600 to-indigo-800"
  },
  {
    id: "news-3",
    tag: "INTERVIEW",
    title: "Mbappé: 'We Are Ready for the Challenge'",
    summary: "The French captain speaks exclusively about squad harmony, adaptive tactical layouts, and the drive to secure historic silverware.",
    content: "Speaking post-training, Kylian Mbappé declared that the current locker room dynamics are the absolute strongest he has experienced. 'We aren't just here to execute static set plays; our team thrives on dynamic organic movement that breaks typical low defensive lines,' he stated.",
    timeAgo: "8h ago",
    imageTheme: "from-rose-600 to-indigo-800"
  }
];

export const PLAYER_PROFILES: PlayerProfile[] = [
  {
    id: "p-1",
    name: "Vinícius Júnior",
    team: "Brazil",
    code: "BRA",
    rating: 92,
    position: "LW",
    marketValue: "€200M",
    stats: [
      { label: "Goals", value: "6" },
      { label: "Sprints", value: "34 / Match" },
      { label: "Dribble Success", value: "68%" }
    ],
    highlights: ["Exceptional acceleration on wide breaks", "Unlocks tight low-blocks with inverted dribble turns"]
  },
  {
    id: "p-2",
    name: "Lionel Messi",
    team: "Argentina",
    code: "ARG",
    rating: 90,
    position: "CAM",
    marketValue: "€30M",
    stats: [
      { label: "Assists", value: "8" },
      { label: "Key Passes", value: "4.5 / 90'" },
      { label: "Shot accuracy", value: "72%" }
    ],
    highlights: ["Unrivaled vision matching vertical channels", "Masterful set-piece orchestration"]
  },
  {
    id: "p-3",
    name: "Kylian Mbappé",
    team: "France",
    code: "FRA",
    rating: 91,
    position: "ST / LW",
    marketValue: "€180M",
    stats: [
      { label: "Goals", value: "8" },
      { label: "Max Velocity", value: "36.2 km/h" },
      { label: "Shots / 90'", value: "5.1" }
    ],
    highlights: ["Lethal counter-attack transition burst", "Surgical finish in pressure sequences"]
  },
  {
    id: "p-4",
    name: "Jude Bellingham",
    team: "England",
    code: "ENG",
    rating: 89,
    position: "CM / CAM",
    marketValue: "€180M",
    stats: [
      { label: "Tackles", value: "2.8 / 90'" },
      { label: "Box Recoveries", value: "6.2 / Match" },
      { label: "Pass Efficiency", value: "91%" }
    ],
    highlights: ["Elite box-to-box physical recovery rate", "Surgical spatial runs breaking deep lines"]
  },
  {
    id: "p-5",
    name: "Bruno Fernandes",
    team: "Portugal",
    code: "POR",
    rating: 87,
    position: "CAM",
    marketValue: "€75M",
    stats: [
      { label: "Key Targets", value: "3.8 / Match" },
      { label: "Distance Covered", value: "11.2 km / Match" },
      { label: "Cross accuracy", value: "52%" }
    ],
    highlights: ["Masterful long diagonal switches", "Aggressive counter-pressing instigator"]
  }
];
