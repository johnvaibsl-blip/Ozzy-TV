const ADDON = "https://ozzytvstremio.vercel.app";
const CACHE_TTL = 10 * 60 * 1000;

let state = {
    section: "home",
    movies: [],
    series: [],
    channels: [],
    heroItem: null,
    heroIdx: 0,
    hls: null,
    searchTimeout: null,
    searchResults: []
};

const $ = id => document.getElementById(id);

// ─── INIT ────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadHome();
    window.addEventListener("scroll", () => {
        document.querySelector(".navbar").classList.toggle("scrolled", window.scrollY > 50);
    });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            if ($("playerOverlay").style.display !== "none") closePlayer();
            else if ($("searchResults").style.display !== "none") hideSearch();
            else $("globalSearch").blur();
        }
    });
});

// ─── NAVIGATION ──────────────────────────────────────────────────────────
function navigate(section) {
    state.section = section;
    document.querySelectorAll(".nav-link").forEach(l => l.classList.toggle("active", l.dataset.section === section));
    $("globalSearch").value = "";
    hideSearch();

    if (section === "home") {
        $("homeView").style.display = "";
        $("browseView").style.display = "none";
    } else {
        $("homeView").style.display = "none";
        $("browseView").style.display = "";
        loadBrowse(section);
    }
    window.scrollTo(0, 0);
}

function goHome() { navigate("home"); }

// ─── HOME ────────────────────────────────────────────────────────────────
async function loadHome() {
    const [movies, series, channels] = await Promise.all([
        cached("movies", () => fetchJSON("/api/site/movies")),
        cached("series", () => fetchJSON("/api/site/series")),
        cached("channels", () => fetchJSON("/api/site/channels"))
    ]);
    state.movies = movies;
    state.series = series;
    state.channels = channels;

    renderHero(movies, series);
    renderRows(movies, series, channels);
}

function renderHero(movies, series) {
    const featured = [...movies.filter(m => m.poster && m.background), ...series.filter(s => s.poster && s.background)];
    if (!featured.length) { $("hero").innerHTML = ""; return; }

    state.heroItem = featured[0];
    state.heroIdx = 0;
    updateHero(featured[0]);

    setInterval(() => {
        state.heroIdx = (state.heroIdx + 1) % featured.length;
        updateHero(featured[state.heroIdx]);
    }, 8000);
}

function updateHero(item) {
    state.heroItem = item;
    const bg = item.background || item.poster || "";
    const tag = item.type === "series" ? "Series" : "Movie";
    const isChannel = item.type === "channel";
    $("hero").innerHTML = `
        <div class="hero-bg" style="background-image:url('${bg}')"></div>
        <div class="hero-content">
            <div class="hero-tag">${tag}</div>
            <div class="hero-title">${item.name || ""}</div>
            <div class="hero-desc">${item.description || ""}</div>
            <div class="hero-btns">
                <button class="hero-btn hero-btn-play" onclick="playFromHero()">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Play
                </button>
                <button class="hero-btn hero-btn-info" onclick="showDetail('${item.id || item.tmdbId}', '${item.type || 'movie'}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    More Info
                </button>
            </div>
        </div>`;
}

function playFromHero() {
    if (!state.heroItem) return;
    const item = state.heroItem;
    if (item.type === "series") playSeries(item.id, item.name);
    else playMovie(item.tmdbId || item.id, item.name);
}

function renderRows(movies, series, channels) {
    const container = $("rowsContainer");
    let html = "";

    if (movies.length) {
        html += `<div class="row">
            <div class="row-header"><span class="row-title">Movies</span><span class="row-more" onclick="navigate('movies')">View All &rarr;</span></div>
            <div class="row-scroll">${movies.filter(m => m.poster).slice(0, 30).map(m => posterCard(m, 'movie')).join("")}</div>
        </div>`;
    }

    if (series.length) {
        html += `<div class="row">
            <div class="row-header"><span class="row-title">Series</span><span class="row-more" onclick="navigate('series')">View All &rarr;</span></div>
            <div class="row-scroll">${series.filter(s => s.poster).slice(0, 30).map(s => posterCard(s, 'series')).join("")}</div>
        </div>`;
    }

    const groups = {};
    channels.forEach(ch => {
        const g = ch.group || ch.category || "Live TV";
        if (!groups[g]) groups[g] = [];
        groups[g].push(ch);
    });

    const topGroups = Object.entries(groups).sort((a, b) => b[1].length - a[1].length).slice(0, 6);
    for (const [group, chs] of topGroups) {
        html += `<div class="row">
            <div class="row-header"><span class="row-title">${group}</span><span class="row-more" onclick="navigate('live')">View All &rarr;</span></div>
            <div class="row-scroll">${chs.slice(0, 20).map(ch => channelCard(ch)).join("")}</div>
        </div>`;
    }

    container.innerHTML = html;
}

function posterCard(item, type) {
    const year = item.releaseInfo || "";
    return `<div class="card" onclick="play${type === 'series' ? 'Series' : 'Movie'}('${item.id || item.tmdbId}', '${(item.name||'').replace(/'/g,"\\'")}')">
        <img class="card-poster" src="${item.poster}" alt="${item.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22 fill=%22%23222%22%3E%3Crect width=%22200%22 height=%22300%22/%3E%3Ctext x=%22100%22 y=%22150%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%2214%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        <div class="card-info">
            <div class="card-title">${item.name || ""}</div>
            <div class="card-meta">${year}</div>
        </div>
    </div>`;
}

function channelCard(ch) {
    const initial = (ch.name || "?")[0].toUpperCase();
    return `<div class="card card-live" onclick="playChannel('${ch.id}', '${(ch.name||'').replace(/'/g,"\\'")}', '${(ch.url||'').replace(/'/g,"\\'")}')">
        <div class="live-badge">LIVE</div>
        ${ch.logo ? `<img class="card-poster" src="${ch.logo}" alt="${ch.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : `<div class="card-poster" style="display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:var(--ac);background:var(--bg3)">${initial}</div>`}
        <div class="card-info">
            <div class="card-title">${ch.name}</div>
            <div class="card-meta">${ch.group || ""}</div>
        </div>
    </div>`;
}

// ─── BROWSE ──────────────────────────────────────────────────────────────
async function loadBrowse(type) {
    $("browseTitle").textContent = type === "movies" ? "Movies" : type === "series" ? "Series" : "Live TV";
    $("browseSearch").value = "";
    const grid = $("browseGrid");
    grid.innerHTML = '<div class="grid-loading">Loading...</div>';

    if (type === "live") {
        const channels = await cached("channels", () => fetchJSON("/api/site/channels"));
        state.channels = channels;
        renderBrowseGrid(channels.map(ch => ({...ch, type: "channel", poster: ch.logo})), "channel");
    } else if (type === "movies") {
        const movies = await cached("movies", () => fetchJSON("/api/site/movies"));
        state.movies = movies;
        renderBrowseGrid(movies, "movie");
    } else {
        const series = await cached("series", () => fetchJSON("/api/site/series"));
        state.series = series;
        renderBrowseGrid(series, "series");
    }
}

function renderBrowseGrid(items, type) {
    const grid = $("browseGrid");
    grid.innerHTML = items.map(item => {
        if (type === "channel") return channelCard(item);
        return posterCard(item, type);
    }).join("");
}

function filterBrowse(query) {
    const q = query.toLowerCase();
    const type = state.section;
    let items;
    if (type === "live") items = state.channels.filter(ch => ch.name.toLowerCase().includes(q) || (ch.group||"").toLowerCase().includes(q));
    else if (type === "movies") items = state.movies.filter(m => m.name.toLowerCase().includes(q));
    else items = state.series.filter(s => s.name.toLowerCase().includes(q));
    renderBrowseGrid(items, type === "live" ? "channel" : type === "movies" ? "movie" : "series");
}

// ─── SEARCH ──────────────────────────────────────────────────────────────
function handleSearch(query) {
    clearTimeout(state.searchTimeout);
    if (!query.trim()) { hideSearch(); return; }
    state.searchTimeout = setTimeout(() => doSearch(query.trim()), 350);
}

async function doSearch(query) {
    $("homeView").style.display = "none";
    $("browseView").style.display = "none";
    $("searchResults").style.display = "";
    $("searchGrid").innerHTML = '<div class="grid-loading">Searching...</div>';

    const [movies, series] = await Promise.all([
        fetchJSON(`/api/site/movies/search?q=${encodeURIComponent(query)}`),
        fetchJSON(`/api/site/series/search?q=${encodeURIComponent(query)}`)
    ]);

    let html = "";
    if (movies.length) html += movies.map(m => posterCard(m, "movie")).join("");
    if (series.length) html += series.map(s => posterCard(s, "series")).join("");
    if (!html) html = '<div class="grid-loading">No results found</div>';
    $("searchGrid").innerHTML = html;
}

function hideSearch() {
    $("searchResults").style.display = "none";
    if (state.section === "home") $("homeView").style.display = "";
    else $("browseView").style.display = "";
}

// ─── PLAYER ──────────────────────────────────────────────────────────────
async function playMovie(tmdbId, name) {
    const id = String(tmdbId).replace("tmdb:", "");
    $("playerOverlay").style.display = "";
    $("playerTitle").textContent = name;
    $("playerLoader").classList.add("active");
    $("streamsPanel").innerHTML = "";

    try {
        const streams = await fetchJSON(`/api/site/movies/${id}/stream`);
        const list = Array.isArray(streams) ? streams : (streams.streams || []);
        renderStreams(list, name, "movie");
    } catch (e) {
        $("playerLoader").classList.remove("active");
        toast("Failed to load streams");
    }
}

async function playSeries(imdbId, name) {
    $("playerOverlay").style.display = "";
    $("playerTitle").textContent = name;
    $("playerLoader").classList.add("active");
    $("streamsPanel").innerHTML = "";

    try {
        const streams = await fetchJSON(`/api/site/series/${imdbId}/stream`);
        const list = Array.isArray(streams) ? streams : (streams.streams || []);
        renderStreams(list, name, "series");
    } catch (e) {
        $("playerLoader").classList.remove("active");
        toast("Failed to load streams");
    }
}

function playChannel(id, name, url) {
    $("playerOverlay").style.display = "";
    $("playerTitle").textContent = name;
    $("playerLoader").classList.add("active");
    $("streamsPanel").innerHTML = "";

    startPlayback(url, name);
}

function renderStreams(streams, name, type) {
    $("playerLoader").classList.remove("active");
    if (!streams.length) {
        $("streamsPanel").innerHTML = '<div style="color:var(--tx3);font-size:.85rem;padding:8px">No streams available</div>';
        return;
    }

    $("streamsPanel").innerHTML = streams.map((s, i) => {
        const label = s.name || s.title || `Stream ${i + 1}`;
        return `<button class="stream-chip${i === 0 ? ' active' : ''}" onclick="selectStream(this, '${(s.url||'').replace(/'/g,"\\'")}', '${label.replace(/'/g,"\\'")}')">${label}</button>`;
    }).join("");

    if (streams[0] && streams[0].url) {
        startPlayback(streams[0].url, name);
    }
}

function selectStream(btn, url, label) {
    document.querySelectorAll(".stream-chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    $("playerTitle").textContent = label;
    startPlayback(url, label);
}

function startPlayback(url, name) {
    $("playerLoader").classList.add("active");
    const video = $("video");
    if (state.hls) { state.hls.destroy(); state.hls = null; }

    if (url.includes(".m3u8") || url.includes(".ts") || url.includes("hls-proxy") || url.includes("playlist")) {
        if (Hls.isSupported()) {
            state.hls = new Hls({
                enableWorker: true,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                startLevel: -1,
                manifestLoadingTimeOut: 20000,
                manifestLoadingMaxRetry: 5,
                fragLoadingTimeOut: 30000,
                fragLoadingMaxRetry: 5
            });
            state.hls.loadSource(url);
            state.hls.attachMedia(video);
            state.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                $("playerLoader").classList.remove("active");
                video.play().catch(() => {});
            });
            state.hls.on(Hls.Events.ERROR, (_, d) => {
                if (d.fatal) {
                    if (d.type === Hls.ErrorTypes.NETWORK_ERROR) state.hls.startLoad();
                    else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) state.hls.recoverMediaError();
                    else {
                        $("playerLoader").classList.remove("active");
                        toast("Stream error");
                    }
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.onloadedmetadata = () => { $("playerLoader").classList.remove("active"); video.play().catch(() => {}); };
        } else {
            $("playerLoader").classList.remove("active");
            toast("HLS not supported");
        }
    } else {
        video.src = url;
        video.onloadedmetadata = () => { $("playerLoader").classList.remove("active"); video.play().catch(() => {}); };
    }
}

function closePlayer() {
    $("playerOverlay").style.display = "none";
    $("video").pause();
    $("video").src = "";
    if (state.hls) { state.hls.destroy(); state.hls = null; }
}

function showDetail(id, type) {
    if (type === "series") playSeries(id, state.heroItem?.name || "");
    else playMovie(id || state.heroItem?.tmdbId, state.heroItem?.name || "");
}

// ─── UTILS ───────────────────────────────────────────────────────────────
async function fetchJSON(path) {
    try {
        const r = await fetch(ADDON + path);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return await r.json();
    } catch (e) {
        console.error("Fetch error:", path, e.message);
        return [];
    }
}

async function cached(key, fn) {
    try {
        const c = JSON.parse(sessionStorage.getItem("ozzy_" + key));
        if (c && Date.now() - c.ts < CACHE_TTL) return c.data;
    } catch (_) {}
    const data = await fn();
    try { sessionStorage.setItem("ozzy_" + key, JSON.stringify({ ts: Date.now(), data })); } catch (_) {}
    return data;
}

function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}
