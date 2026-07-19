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
    shakaPlayer: null,
    wtClient: null,
    searchTimeout: null,
    searchResults: []
};

const $ = id => document.getElementById(id);

// ─── INIT ────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    initShaka();
    loadHome();

    window.addEventListener("scroll", () => {
        const tb = $("topbar");
        if (tb) tb.style.opacity = window.scrollY > 100 ? "1" : ".85";
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            if ($("playerOverlay").style.display !== "none") closePlayer();
            else if ($("detailModal").style.display !== "none") $("detailModal").style.display = "none";
            else if ($("searchResults").style.display !== "none") hideSearch();
        }
    });
});

function initShaka() {
    if (typeof shaka !== "undefined" && shaka.Player.isBrowserSupported()) {
        shaka.polyfill.installAll();
        state.shakaPlayer = new shaka.Player($("video"));
        state.shakaPlayer.addEventListener("error", e => {
            console.error("Shaka error", e);
            toast("Playback error");
        });
    }
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────
function toggleSidebar() {
    $("sidebar").classList.toggle("open");
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────
function navigate(section) {
    state.section = section;
    document.querySelectorAll(".sidebar-item").forEach(l => l.classList.toggle("active", l.dataset.section === section));
    $("globalSearch").value = "";
    hideSearch();
    $("sidebar").classList.remove("open");

    if (section === "home") {
        $("homeView").style.display = "";
        $("browseView").style.display = "none";
        $("searchResults").style.display = "none";
    } else if (section === "search") {
        focusSearch();
        return;
    } else {
        $("homeView").style.display = "none";
        $("browseView").style.display = "";
        $("searchResults").style.display = "none";
        loadBrowse(section);
    }
    window.scrollTo(0, 0);
}

function goHome() { navigate("home"); }

function focusSearch() {
    $("sidebar").classList.remove("open");
    const s = $("globalSearch");
    s.focus();
    s.scrollIntoView({ behavior: "smooth" });
}

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
    $("hero").innerHTML = `
        <div class="hero-bg" style="background-image:url('${bg}')"></div>
        <div class="hero-content">
            <div class="hero-tag">${tag}</div>
            <div class="hero-title">${esc(item.name)}</div>
            <div class="hero-desc">${esc(item.description || "")}</div>
            <div class="hero-btns">
                <button class="hero-btn hero-btn-play" onclick="playFromHero()">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Play
                </button>
                <button class="hero-btn hero-btn-info" onclick="showDetailModal('${esc(item.id || item.tmdbId)}', '${item.type || "movie"}')">
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

    const continueWatching = getContinueWatching();
    if (continueWatching.length) {
        html += `<div class="row">
            <div class="row-header"><span class="row-title">Continue Watching</span></div>
            <div class="row-scroll">${continueWatching.map(item => posterCard(item, item.type)).join("")}</div>
        </div>`;
    }

    if (movies.length) {
        html += `<div class="row">
            <div class="row-header"><span class="row-title">Movies</span><span class="row-more" onclick="navigate('movies')">View All &rarr;</span></div>
            <div class="row-scroll">${movies.filter(m => m.poster).slice(0, 30).map(m => posterCard(m, "movie")).join("")}</div>
        </div>`;
    }

    if (series.length) {
        html += `<div class="row">
            <div class="row-header"><span class="row-title">Series</span><span class="row-more" onclick="navigate('series')">View All &rarr;</span></div>
            <div class="row-scroll">${series.filter(s => s.poster).slice(0, 30).map(s => posterCard(s, "series")).join("")}</div>
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
            <div class="row-header"><span class="row-title">${esc(group)}</span><span class="row-more" onclick="navigate('live')">View All &rarr;</span></div>
            <div class="row-scroll">${chs.slice(0, 20).map(ch => channelCard(ch)).join("")}</div>
        </div>`;
    }

    container.innerHTML = html;
}

function posterCard(item, type) {
    const year = item.releaseInfo || "";
    const id = item.id || item.tmdbId || "";
    const name = esc(item.name || "");
    return `<div class="card" onclick="showDetailModal('${esc(id)}', '${type}')">
        <img class="card-poster" src="${item.poster}" alt="${name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22 fill=%22%23242424%22%3E%3Crect width=%22200%22 height=%22300%22/%3E%3Ctext x=%22100%22 y=%22150%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%2214%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        <div class="card-info">
            <div class="card-title">${name}</div>
            <div class="card-meta">${year}</div>
        </div>
    </div>`;
}

function channelCard(ch) {
    const initial = (ch.name || "?")[0].toUpperCase();
    return `<div class="card card-live" onclick="playChannel('${esc(ch.id)}', '${esc(ch.name)}', '${esc(ch.url)}')">
        <div class="live-badge">LIVE</div>
        ${ch.logo ? `<img class="card-poster" src="${ch.logo}" alt="${esc(ch.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : `<div class="card-poster" style="display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:var(--ac);background:var(--bg4)">${initial}</div>`}
        <div class="card-info">
            <div class="card-title">${esc(ch.name)}</div>
            <div class="card-meta">${esc(ch.group || "")}</div>
        </div>
    </div>`;
}

// ─── DETAIL MODAL ────────────────────────────────────────────────────────
async function showDetailModal(id, type) {
    const modal = $("detailModal");
    const content = $("detailContent");
    modal.style.display = "";
    content.innerHTML = '<div style="padding:60px;text-align:center;color:var(--tx3)">Loading...</div>';

    let item = null;
    if (type === "movie") {
        item = state.movies.find(m => String(m.id || m.tmdbId) === String(id));
        if (!item) {
            try { item = await fetchJSON(`/api/site/movies/search?q=${encodeURIComponent(id)}`); item = item[0]; } catch(_) {}
        }
    } else if (type === "series") {
        item = state.series.find(s => String(s.id) === String(id));
        if (!item) {
            try { item = await fetchJSON(`/api/site/series/search?q=${encodeURIComponent(id)}`); item = item[0]; } catch(_) {}
        }
    }

    if (!item) {
        content.innerHTML = '<div style="padding:60px;text-align:center;color:var(--tx3)">Not found</div>';
        return;
    }

    const backdrop = item.background || item.poster || "";
    const poster = item.poster || "";
    const name = esc(item.name || "");
    const desc = esc(item.description || "No description available.");
    const year = item.releaseInfo || "";
    const genres = (item.genres || []).map(g => `<span class="tag">${esc(g)}</span>`).join("");
    const imdb = item.imdbId || "";
    const tmdb = item.tmdbId || item.id || "";

    content.innerHTML = `
        <button class="detail-btn-close" onclick="document.getElementById('detailModal').style.display='none'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        ${backdrop ? `<img class="detail-backdrop" src="${backdrop}" onerror="this.outerHTML='<div class=\\'detail-backdrop-placeholder\\'></div>'">` : '<div class="detail-backdrop-placeholder"></div>'}
        <div class="detail-body">
            <div class="detail-poster-row">
                ${poster ? `<img class="detail-poster" src="${poster}" onerror="this.style.display='none'">` : ""}
                <div class="detail-info">
                    <div class="detail-title">${name}</div>
                    <div class="detail-meta">
                        ${year ? `<span>${year}</span>` : ""}
                        ${genres}
                    </div>
                    <div class="detail-desc">${desc}</div>
                    <div class="detail-btns">
                        <button class="detail-btn detail-btn-play" onclick="playFromDetail('${esc(tmdb)}', '${esc(imdb)}', '${type}', '${name}')">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Play
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}

function playFromDetail(tmdbId, imdbId, type, name) {
    $("detailModal").style.display = "none";
    if (type === "series") playSeries(imdbId || tmdbId, name);
    else playMovie(tmdbId, name);
}

function closeDetail(e) {
    if (e.target === $("detailModal")) $("detailModal").style.display = "none";
}

// ─── BROWSE ──────────────────────────────────────────────────────────────
async function loadBrowse(type) {
    $("browseTitle").textContent = type === "movies" ? "Movies" : type === "series" ? "Series" : "Live TV";
    const grid = $("browseGrid");
    grid.innerHTML = '<div class="grid-loading">Loading...</div>';

    if (type === "live") {
        const channels = await cached("channels", () => fetchJSON("/api/site/channels"));
        state.channels = channels;
        renderBrowseGrid(channels.map(ch => ({ ...ch, type: "channel", poster: ch.logo })), "channel");
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
        renderStreams(list, name, "movie", id);
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
        renderStreams(list, name, "series", imdbId);
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

function renderStreams(streams, name, type, contentId) {
    $("playerLoader").classList.remove("active");
    if (!streams.length) {
        $("streamsPanel").innerHTML = '<div style="color:var(--tx3);font-size:.85rem;padding:8px">No streams available</div>';
        return;
    }

    $("streamsPanel").innerHTML = streams.map((s, i) => {
        const label = s.name || s.title || `Stream ${i + 1}`;
        const url = s.url || "";
        const quality = detectQuality(url, s);
        const streamType = detectStreamType(url);
        return `<button class="stream-chip${i === 0 ? " active" : ""}" onclick="selectStream(this, '${esc(url)}', '${esc(label)}', '${type}', '${esc(contentId)}', '${esc(name)}')">
            <span class="stream-label">${esc(label)}</span>
            <span class="stream-quality">${quality}</span>
            <span class="stream-type">${streamType}</span>
        </button>`;
    }).join("");

    if (streams[0] && streams[0].url) {
        startPlayback(streams[0].url, name);
        addContinueWatching(name, type, contentId);
    }
}

function selectStream(btn, url, label, type, contentId, name) {
    document.querySelectorAll(".stream-chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    $("playerTitle").textContent = label;
    startPlayback(url, name);
}

function detectQuality(url, stream) {
    if (stream && (stream.quality || stream.res)) return stream.quality || stream.res;
    const u = (url || "").toLowerCase();
    if (u.includes("2160") || u.includes("4k")) return "4K";
    if (u.includes("1080")) return "1080p";
    if (u.includes("720")) return "720p";
    if (u.includes("480")) return "480p";
    if (u.includes("360")) return "360p";
    return "";
}

function detectStreamType(url) {
    const u = (url || "").toLowerCase();
    if (u.includes("magnet:") || u.includes(".torrent")) return "Torrent";
    if (u.includes(".m3u8") || u.includes("hls") || u.includes("playlist")) return "HLS";
    if (u.includes(".mpd")) return "DASH";
    if (u.includes(".mp4")) return "MP4";
    if (u.includes(".mkv")) return "MKV";
    if (u.includes(".webm")) return "WebM";
    return "Stream";
}

// ─── PLAYBACK ENGINE ─────────────────────────────────────────────────────
function startPlayback(url, name) {
    $("playerLoader").classList.add("active");
    const video = $("video");

    cleanupPlayer();

    if (url.includes("magnet:") || url.includes(".torrent")) {
        playTorrent(url, name);
        return;
    }

    if (url.includes(".m3u8") || url.includes(".ts") || url.includes("hls-proxy") || url.includes("playlist")) {
        playHLS(url, video);
        return;
    }

    if (url.includes(".mpd")) {
        playDASH(url, video);
        return;
    }

    playDirect(url, video);
}

function playHLS(url, video) {
    if (state.shakaPlayer) {
        state.shakaPlayer.load(url).then(() => {
            $("playerLoader").classList.remove("active");
            video.play().catch(() => {});
        }).catch(e => {
            console.error("Shaka HLS error", e);
            fallbackHLS(url, video);
        });
        return;
    }
    fallbackHLS(url, video);
}

function fallbackHLS(url, video) {
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
                else { $("playerLoader").classList.remove("active"); toast("Stream error"); }
            }
        });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.onloadedmetadata = () => { $("playerLoader").classList.remove("active"); video.play().catch(() => {}); };
    } else {
        $("playerLoader").classList.remove("active");
        toast("HLS not supported");
    }
}

function playDASH(url, video) {
    if (state.shakaPlayer) {
        state.shakaPlayer.load(url).then(() => {
            $("playerLoader").classList.remove("active");
            video.play().catch(() => {});
        }).catch(e => {
            console.error("Shaka DASH error", e);
            $("playerLoader").classList.remove("active");
            toast("DASH playback failed");
        });
    } else {
        $("playerLoader").classList.remove("active");
        toast("DASH requires Shaka Player");
    }
}

function playDirect(url, video) {
    video.src = url;
    video.onloadedmetadata = () => {
        $("playerLoader").classList.remove("active");
        video.play().catch(() => {});
    };
    video.onerror = () => {
        $("playerLoader").classList.remove("active");
        toast("Failed to load video");
    };
}

function playTorrent(url, name) {
    if (typeof WebTorrent === "undefined") {
        $("playerLoader").classList.remove("active");
        toast("WebTorrent not loaded");
        return;
    }

    if (!state.wtClient) {
        state.wtClient = new WebTorrent();
        state.wtClient.on("error", err => {
            console.error("WebTorrent error", err);
            toast("Torrent error: " + err.message);
        });
    }

    toast("Connecting to torrent...");
    state.wtClient.add(url, torrent => {
        $("playerLoader").classList.remove("active");
        const file = torrent.files.find(f => {
            const ext = f.name.split(".").pop().toLowerCase();
            return ["mp4", "webm", "mkv", "avi", "mov"].includes(ext);
        }) || torrent.files[0];

        if (!file) {
            toast("No playable file in torrent");
            return;
        }

        file.renderTo($("video"), { autoplay: true, controls: true }, err => {
            if (err) {
                console.error("Torrent render error", err);
                toast("Torrent playback failed");
            }
        });

        toast("Streaming: " + file.name);
    });
}

function cleanupPlayer() {
    const video = $("video");
    if (state.hls) { state.hls.destroy(); state.hls = null; }
    if (state.shakaPlayer) {
        try { state.shakaPlayer.unload(); } catch(_) {}
    }
    if (state.wtClient) {
        try { state.wtClient.destroy(); state.wtClient = null; } catch(_) {}
    }
    video.pause();
    video.removeAttribute("src");
    video.load();
}

function closePlayer() {
    $("playerOverlay").style.display = "none";
    cleanupPlayer();
}

// ─── CONTINUE WATCHING ───────────────────────────────────────────────────
function addContinueWatching(name, type, id) {
    try {
        let list = JSON.parse(localStorage.getItem("ozzy_continue") || "[]");
        list = list.filter(i => i.id !== id);
        list.unshift({ name, type, id, ts: Date.now() });
        if (list.length > 20) list = list.slice(0, 20);
        localStorage.setItem("ozzy_continue", JSON.stringify(list));
    } catch(_) {}
}

function getContinueWatching() {
    try {
        return JSON.parse(localStorage.getItem("ozzy_continue") || "[]").slice(0, 15);
    } catch(_) { return []; }
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

function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
}
