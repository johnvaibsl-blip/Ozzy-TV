import React from "react";

interface TeamFlagProps {
  code: string;
  className?: string; // e.g., 'w-6 h-4'
}

export function TeamFlag({ code, className = "w-6 h-4" }: TeamFlagProps) {
  const normCode = code.toUpperCase().trim();

  // Custom detailed vectors for national flags matching the requested teams
  switch (normCode) {
    case "BRA": // Brazil: green, yellow diamond, blue circle
      return (
        <svg viewBox="0 0 720 504" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="720" height="504" fill="#009c3b" />
          <polygon points="360,54 666,252 360,450 54,252" fill="#ffdf00" />
          <circle cx="360" cy="252" r="117" fill="#002171" />
          <path d="M243,260 Q360,210 477,260" stroke="#ffffff" strokeWidth="18" fill="none" />
        </svg>
      );

    case "ARG": // Argentina: light blue, white, light blue stripes, yellow sun
      return (
        <svg viewBox="0 0 900 600" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="900" height="200" fill="#74acdf" />
          <rect y="200" width="900" height="200" fill="#ffffff" />
          <rect y="400" width="900" height="200" fill="#74acdf" />
          <circle cx="450" cy="300" r="45" fill="#f6b426" />
          <circle cx="450" cy="300" r="15" fill="#845009" />
        </svg>
      );

    case "FRA": // France: blue, white, red vertical bands
      return (
        <svg viewBox="0 0 900 600" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="600" fill="#00209F" />
          <rect x="300" width="300" height="600" fill="#FFFFFF" />
          <rect x="600" width="300" height="600" fill="#ED2939" />
        </svg>
      );

    case "ENG": // England: White with bold red cross
      return (
        <svg viewBox="0 0 500 300" className={`${className} border border-slate-800 rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="500" height="300" fill="#FFFFFF" />
          <rect x="220" width="60" height="300" fill="#CE1126" />
          <rect y="120" width="500" height="60" fill="#CE1126" />
        </svg>
      );

    case "POR": // Portugal: green (2/5) & red (3/5), gold emblem
      return (
        <svg viewBox="0 0 600 400" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="240" height="400" fill="#006600" />
          <rect x="240" width="360" height="400" fill="#FF0000" />
          <circle cx="240" cy="200" r="55" fill="#EAD152" />
          <rect x="230" y="185" width="20" height="30" fill="#CE1126" />
        </svg>
      );

    case "GER": // Germany: black, red, gold horizontal stripes
      return (
        <svg viewBox="0 0 500 300" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="500" height="100" fill="#000000" />
          <rect y="100" width="500" height="100" fill="#D50000" />
          <rect y="200" width="500" height="100" fill="#FFCC00" />
        </svg>
      );

    case "MOR": // Morocco: red with green pentagram in center
      return (
        <svg viewBox="0 0 900 600" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="900" height="600" fill="#C1272D" />
          <polygon
            points="450,220 488,340 380,265 520,265 412,340"
            fill="none"
            stroke="#006233"
            strokeWidth="11"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "CRO": // Croatia: red, white, blue stripes + crest outline
      return (
        <svg viewBox="0 0 600 400" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="133.3" fill="#FF0000" />
          <rect y="133.3" width="600" height="133.3" fill="#FFFFFF" />
          <rect y="266.6" width="600" height="133.4" fill="#171796" />
          {/* Visual approximation of the cute crown shield in the center */}
          <polygon points="275,110 325,110 325,160 300,185 275,160" fill="#FF0000" stroke="#FFFFFF" strokeWidth="4" />
          <polygon points="285,120 315,120 315,150 300,165 285,150" fill="#FFFFFF" />
        </svg>
      );

    case "ESP": // Spain: red, yellow (double), red horizontal
      return (
        <svg viewBox="0 0 750 500" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="750" height="125" fill="#C60B1E" />
          <rect y="125" width="750" height="250" fill="#FABD00" />
          <rect y="375" width="750" height="125" fill="#C60B1E" />
          {/* Crest approximation */}
          <rect x="180" y="200" width="50" height="60" fill="#C60B1E" rx="3" />
        </svg>
      );

    case "HAI": // Haiti: blue, red + white rectangle in center
      return (
        <svg viewBox="0 0 900 600" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="900" height="300" fill="#00209F" />
          <rect y="300" width="900" height="300" fill="#D21034" />
          <rect x="400" y="250" width="100" height="100" fill="#FFFFFF" rx="2" />
          <circle cx="450" cy="300" r="15" fill="#006600" />
        </svg>
      );

    case "SCO": // Scotland: blue with white saltire diagonal cross
      return (
        <svg viewBox="0 0 500 300" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="500" height="300" fill="#0065BD" />
          <polygon points="0,0 45,0 500,270 500,300 455,300 0,30" fill="#FFFFFF" />
          <polygon points="455,0 500,0 500,30 45,300 0,300 0,270" fill="#FFFFFF" />
        </svg>
      );

    case "QAT": // Qatar: maroon with serrated 9 points white Hoist side
      return (
        <svg viewBox="0 0 1100 435" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="1100" height="435" fill="#8A1538" />
          <polygon
            points="0,0 280,0 350,24 280,48 350,72 280,96 350,120 280,144 350,168 280,192 350,216 280,240 350,264 280,288 350,312 280,336 350,360 280,384 350,408 280,432 0,432"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "SUI": // Switzerland: red square, white cross
      return (
        <svg viewBox="0 0 500 500" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="500" height="500" fill="#D52B1E" />
          <rect x="215" y="100" width="70" height="300" fill="#FFFFFF" />
          <rect x="100" y="215" width="300" height="70" fill="#FFFFFF" />
        </svg>
      );

    case "AUS": // Australia: blue background + Union Jack + white stars
      return (
        <svg viewBox="0 0 600 300" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="300" fill="#00008B" />
          {/* Union Jack mini-approximation */}
          <rect width="150" height="100" fill="#00008B" />
          <rect width="150" height="100" fill="#FFFFFF" />
          <rect x="60" width="30" height="100" fill="#CE1126" />
          <rect y="35" width="150" height="30" fill="#CE1126" />
          {/* White stars circles */}
          <circle cx="450" cy="150" r="12" fill="#FFFFFF" />
          <circle cx="400" cy="180" r="8" fill="#FFFFFF" />
          <circle cx="500" cy="120" r="8" fill="#FFFFFF" />
          <circle cx="420" cy="80" r="10" fill="#FFFFFF" />
          <circle cx="480" cy="220" r="11" fill="#FFFFFF" />
        </svg>
      );

    case "TUR": // Türkiye: red with white crescent and star
      return (
        <svg viewBox="0 0 1200 800" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="800" fill="#E30A17" />
          <circle cx="400" cy="400" r="200" fill="#FFFFFF" />
          <circle cx="450" cy="400" r="160" fill="#E30A17" />
          <polygon points="630,320 650,380 710,380 660,415 680,475 630,440 580,475 600,415 550,380 610,380" fill="#FFFFFF" />
        </svg>
      );

    default: // generic fallback (globe/sports style flag)
      return (
        <svg viewBox="0 0 600 400" className={`${className} rounded shadow-sm`} xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="400" fill="#1e293b" />
          <circle cx="300" cy="200" r="80" fill="none" stroke="#475569" strokeWidth="4" />
          <line x1="300" y1="0" x2="300" y2="400" stroke="#475569" strokeWidth="4" />
        </svg>
      );
  }
}
