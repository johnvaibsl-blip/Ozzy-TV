import React, { useState } from "react";
import { Newspaper, Search, ArrowRight, HelpCircle } from "lucide-react";
import { NewsArticle } from "../data";

interface NewsViewProps {
  syncedNews: NewsArticle[];
  setSelectedNews: (news: NewsArticle | null) => void;
}

const getNewsThumbnail = (id: string, title: string) => {
  const normId = id.toLowerCase();
  const normTitle = title.toLowerCase();
  // Exact static ID matches only — avoid false positives on synced IDs like 'news-live-1'
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

export const NewsView: React.FC<NewsViewProps> = ({
  syncedNews,
  setSelectedNews
}) => {
  const [newsQuery, setNewsQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const filteredNews = syncedNews.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(newsQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(newsQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(newsQuery.toLowerCase());

    const matchesTag = selectedTag === "All" || article.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  // Dynamically extract unique tags from news articles
  const availableTags = ["All", ...Array.from(new Set(syncedNews.map(a => a.tag).filter(Boolean)))];

  return (
    <div className="flex flex-col gap-6" id="news_view_parent">
      
      {/* HEADER CONTROL AND SEARCH BAR */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Search */}
        <div className="w-full sm:max-w-xs relative text-left">
          <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search news titles or articles..."
            value={newsQuery}
            onChange={(e) => setNewsQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Categories togglers */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl overflow-x-auto w-full sm:w-auto">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                selectedTag === tag
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tag === "All" ? "All Stories" : tag}
            </button>
          ))}
        </div>
      </div>

      {/* ARTICLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="news_bulletins_cards_grid">
        {filteredNews.length > 0 ? (
          filteredNews.map(article => (
            <div
              key={article.id}
              onClick={() => setSelectedNews(article)}
              className="group bg-[#0b101d]/60 border border-slate-850 hover:border-indigo-500/30 rounded-2xl overflow-hidden flex flex-col justify-between transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <div>
                {/* Image placeholder or real thumbnail */}
                {(() => {
                  const thumb = getNewsThumbnail(article.id, article.title);
                  if (thumb) {
                    return (
                      <div className="h-36 relative overflow-hidden bg-slate-900 border-b border-slate-800 flex flex-col justify-between p-4">
                        <img src={thumb} alt={article.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
                        
                        <span className="relative z-10 self-start text-[9px] font-mono font-bold tracking-widest bg-slate-900/90 text-indigo-400 border border-indigo-900/35 py-1 px-2 rounded">
                          {article.tag}
                        </span>

                        <span className="relative z-10 self-end text-[10px] font-mono font-bold text-white bg-slate-900/60 py-0.5 px-2 rounded backdrop-blur-md">
                          {article.timeAgo}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className={`h-36 relative overflow-hidden bg-gradient-to-r ${article.imageTheme || 'from-indigo-600 to-indigo-900'} p-4 flex flex-col justify-between`}>
                      {/* Glassmorphic card overlay */}
                      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] pointer-events-none" />
                      
                      <span className="relative z-10 self-start text-[9px] font-mono font-bold tracking-widest bg-slate-900/90 text-indigo-400 border border-indigo-900/35 py-1 px-2 rounded">
                        {article.tag}
                      </span>

                      <span className="relative z-10 self-end text-[10px] font-mono font-bold text-white bg-slate-900/60 py-0.5 px-2 rounded backdrop-blur-md">
                        {article.timeAgo}
                      </span>
                    </div>
                  );
                })()}

                <div className="p-5 text-left">
                  <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors text-sm line-clamp-2 leading-snug mb-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>
              </div>

              {/* Action read more */}
              <div className="mx-5 mb-5 mt-2 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-semibold text-indigo-450 group-hover:text-indigo-300">
                <span>Read Full Bulletin</span>
                <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-950/40 border border-dashed border-slate-850 py-16 px-4 rounded-2xl text-center">
            <HelpCircle size={36} className="text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No Bulletins Located</h4>
            <p className="text-xs text-slate-500 mt-1">Refine your search parameters or select a different story tag.</p>
          </div>
        )}
      </div>

    </div>
  );
};
