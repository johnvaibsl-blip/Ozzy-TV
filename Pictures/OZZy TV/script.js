const SERVERS = {
    "Server 1": {
        label: "World Cup Sports",
        sources: [
            "/world-cup-sports.m3u"
        ]
    },
    "Server 2": {
        label: "Auto Renew",
        sources: [
            "https://raw.githubusercontent.com/sanjoykb/-KB-TV-Playlist/refs/heads/main/Github%20Auto%20Update%20Channel.m3u"
        ]
    },
    "Server 3": {
        label: "Manual",
        sources: [
            "/channels.m3u"
        ]
    },
    "Server 4": {
        label: "FIFA Worldcup",
        sources: [
            "/fifa-worldcup.m3u"
        ]
    },
    "Server 5": {
        label: "BDIX",
        sources: [
            "/bdix.m3u"
        ]
    }
};

const ASIMX_CHANNELS = [
    {name:"CazéTV FIFA (1080P)",logo:"https://images.seeklogo.com/logo-png/61/1/cazetv-logo-png_seeklogo-619708.png",url:"https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/1080p-vtt/index.m3u8",cat:"Sports",views:2489},
    {name:"UNITE8 (1080P)",logo:"https://akamaividz2.zee5.com/image/upload/w_720,h_405,c_scale,f_webp,q_auto:eco/resources/0-9-channel_2105335046/list/1920x1080list88f79d7c74df4d998da1bbd448f465ff.jpg",url:"https://live9.asimxtech.online/unite8/unite8.m3u8",cat:"Sports",views:2083}
];

const REFRESH_INTERVAL = 10 * 60 * 1000;

let channels = [];
let filtered = [];
let current = null;
let hls = null;
let activeCat = "all";
let activeServer = "All";

const video = document.getElementById("video");
const placeholder = document.getElementById("placeholder");
const loader = document.getElementById("loader");
const chList = document.getElementById("chList");
const cats = document.getElementById("cats");
const search = document.getElementById("search");
const npName = document.getElementById("npName");
const npCat = document.getElementById("npCat");
const npLogo = document.getElementById("npLogo");
const channelCount = document.getElementById("channelCount");
const toast = document.getElementById("toast");

init();

function init() {
    fetchChannels();
    search.addEventListener("input", () => filterChannels(activeCat));
    setInterval(fetchChannels, REFRESH_INTERVAL);
}

function toggleMenu() {}

function switchServer(key) {
    if (activeServer === key) return;
    activeServer = key;
    document.getElementById("srvAllbtn").classList.toggle("active", key === "All");
    document.getElementById("srv1btn").classList.toggle("active", key === "Server 1");
    document.getElementById("srv2btn").classList.toggle("active", key === "Server 2");
    document.getElementById("srv3btn").classList.toggle("active", key === "Server 3");
    document.getElementById("srv4btn").classList.toggle("active", key === "Server 4");
    document.getElementById("srv5btn").classList.toggle("active", key === "Server 5");
    filterChannels(activeCat);
}

async function fetchChannels() {
    channels = [];

    const allSources = [];
    for (const key of Object.keys(SERVERS)) {
        for (const url of SERVERS[key].sources) {
            allSources.push({ url, server: key });
        }
    }

    for (const { url, server } of allSources) {
        try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 15000);
            const res = await fetch(url, { signal: ctrl.signal });
            clearTimeout(t);
            if (res.ok) {
                const txt = await res.text();
                if (txt.includes("#EXTINF")) {
                    parseM3U(txt, server);
                }
            }
        } catch (e) {}
    }

    ASIMX_CHANNELS.forEach(ch => {
        if (ch.url.startsWith("https")) {
            const duplicate = channels.find(c => c.url === ch.url);
            if (!duplicate) {
                channels.unshift({
                    name: ch.name,
                    logo: ch.logo,
                    cats: [ch.cat],
                    url: ch.url,
                    views: ch.views,
                    working: true,
                    server: "ASIMX"
                });
            }
        }
    });

    if (channels.length === 0) {
        chList.innerHTML = '<div class="loading-msg">Cannot load channels.<br>Try again later.</div>';
        return;
    }

    const isWorldCup = (ch) => {
        const name = (ch.name || '').toLowerCase();
        const cats = (ch.cats || []).map(c => c.toLowerCase());
        return name.includes('fifa') || name.includes('world cup') || name.includes('worldcup') ||
               cats.includes('fifa') || cats.includes('fifa world cup') || cats.includes('fifa 2026') || cats.includes('fifa26');
    };

    channels.sort((a, b) => {
        const aWC = isWorldCup(a);
        const bWC = isWorldCup(b);
        if (aWC && !bWC) return -1;
        if (!aWC && bWC) return 1;
        return (b.views || 0) - (a.views || 0);
    });

    buildCats();
    filterChannels("all");
    document.querySelectorAll(".srv-btn").forEach(b => b.classList.remove("switching"));
    toastMsg(channels.length + " channels loaded (All Servers)");
}

function parseM3U(text, server) {
    const lines = text.split("\n");
    let info = null;

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;

        if (line.startsWith("#EXTINF:")) {
            const nameM = line.match(/,(.+)$/);
            const logoM = line.match(/tvg-logo="([^"]*)"/);
            let catsArr = ["Other"];

            const gM = line.match(/group-title="([^"]*)"/);
            if (gM) {
                catsArr = gM[1].split(",").map(c => c.trim()).filter(c => c);
            } else {
                const gM2 = line.match(/group-title="([^"]*)/);
                if (gM2) {
                    const p = gM2[1].split(",");
                    catsArr = p.length > 1 ? [p[0].trim()] : [gM2[1].trim()];
                }
            }

            info = {
                name: nameM ? nameM[1].trim() : "Unknown",
                logo: logoM ? logoM[1] : "",
                cats: catsArr,
                server: server || "Unknown"
            };
        } else if (line.startsWith("http") && info) {
            const duplicate = channels.find(ch => ch.url === line);
            if (!duplicate) {
                channels.push({ ...info, url: line });
            }
            info = null;
        }
    }
}

function buildCats() {
    const set = new Set();
    channels.forEach(ch => ch.cats.forEach(c => set.add(c)));

    const order = ["FIFA 2026","FIFA26","Sports","Bangla","Bangladesh","News","Kids","Cartoon","Entertainment","Movies","English","Hindi","Indian Bangla","Drama","Religious","Infotainment","Musics","Music","Documentary","Weather","Other"];
    const sorted = [...set].sort((a, b) => {
        const ai = order.indexOf(a), bi = order.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });

    cats.innerHTML = `<button class="cat-pill active" onclick="filterChannels('all')">All (${channels.length})</button>`;
    sorted.forEach(c => {
        const n = channels.filter(ch => ch.cats.includes(c)).length;
        cats.innerHTML += `<button class="cat-pill" onclick="filterChannels('${c}')">${c} (${n})</button>`;
    });
}

function filterChannels(cat) {
    activeCat = cat;
    const q = search.value.toLowerCase();
    filtered = channels.filter(ch => {
        const matchCat = cat === "all" || ch.cats.includes(cat);
        const matchQ = ch.name.toLowerCase().includes(q);
        return matchCat && matchQ;
    });

    if (activeServer !== "All") {
        filtered = filtered.filter(ch => ch.server === activeServer);
    }

    cats.querySelectorAll(".cat-pill").forEach(b => {
        b.classList.toggle("active",
            (cat === "all" && b.textContent.startsWith("All")) ||
            b.textContent.startsWith(cat + " (")
        );
    });

    renderChannels();
}

function renderChannels() {
    if (!filtered.length) {
        chList.innerHTML = '<div class="loading-msg">No channels found</div>';
        return;
    }
    const fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23444"%3E%3Cpath d="M23 7l-7 5 7 5V7z"/%3E%3Crect x="1" y="5" width="15" height="14" rx="2"/%3E%3C/svg%3E';
    chList.innerHTML = filtered.map(ch => {
        const idx = channels.indexOf(ch);
        const isActive = current && current.url === ch.url;
        const isBroken = ch.working === false;
        let logo = ch.logo || "";
        if (logo && !logo.startsWith('http') && !logo.startsWith('data:')) {
            if (logo.match(/^fifa\d+\.svg$/)) {
                logo = 'logos/' + logo;
            } else {
                logo = 'https://tv.alonekaium.com/' + logo;
            }
        }
        const initial = ch.name.charAt(0).toUpperCase();
        const badge = isBroken ? '<div class="ch-badge-offline">Offline</div>' : '';
        return `<div class="ch-card${isActive ? ' active' : ''}${isBroken ? ' broken' : ''}" onclick="play(${idx})">
            <img class="ch-logo" src="${logo}" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="ch-logo-fallback" style="display:none">${initial}</div>
            ${badge}
            <div class="ch-info">
                <div class="ch-name">${ch.name}</div>
                <div class="ch-cat">${ch.cats.join(", ")}</div>
            </div>
        </div>`;
    }).join("");
}

function play(idx) {
    current = channels[idx];
    placeholder.style.display = "none";
    loader.classList.add("active");
    npName.textContent = current.name;
    npCat.textContent = current.cats[0];
    let logo = current.logo || "";
    if (logo && !logo.startsWith('http') && !logo.startsWith('data:')) {
        if (logo.match(/^fifa\d+\.svg$/)) {
            logo = 'logos/' + logo;
        } else {
            logo = 'https://tv.alonekaium.com/' + logo;
        }
    }
    npLogo.src = logo;
    channelCount.textContent = (idx + 1) + "/" + channels.length;

    document.querySelectorAll(".ch-card").forEach((c, i) => c.classList.toggle("active", filtered[i] && channels.indexOf(filtered[i]) === idx));

    if (hls) { hls.destroy(); hls = null; }

    if (current.url.includes(".m3u8") || current.url.includes(".ts")) {
        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                backBufferLength: 30,
                startLevel: -1,
                maxSeekHole: 10,
                stretchShortVideoTrack: true,
                appendErrorMaxRetry: 5,
                manifestLoadingTimeOut: 15000,
                manifestLoadingMaxRetry: 5,
                levelLoadingTimeOut: 15000,
                levelLoadingMaxRetry: 5,
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 5
            });
            hls.loadSource(current.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => { loader.classList.remove("active"); video.play().catch(() => {}); });
            hls.on(Hls.Events.ERROR, (_, d) => {
                if (d.fatal) {
                    if (d.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        loader.classList.remove("active");
                        toastMsg("Stream error");
                    }
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = current.url;
            video.onloadedmetadata = () => { loader.classList.remove("active"); video.play().catch(() => {}); };
        } else {
            loader.classList.remove("active");
            toastMsg("HLS not supported");
        }
    } else {
        video.src = current.url;
        video.onloadedmetadata = () => { loader.classList.remove("active"); video.play().catch(() => {}); };
    }
}

function toastMsg(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}
