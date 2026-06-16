const https = require('https');
const http = require('http');

let cache = {};
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(204).end();

    const server = req.query.server || '1';
    const cacheKey = 'server' + server;

    if (cache && cache[cacheKey] && Date.now() - cacheTime < CACHE_TTL) {
        res.setHeader('Cache-Control', 's-maxage=60');
        return res.status(200).json(cache[cacheKey]);
    }

    try {
            let m3uUrl;
            if (server === '2') {
                m3uUrl = 'https://raw.githubusercontent.com/sanjoykb/-KB-TV-Playlist/refs/heads/main/Github%20Auto%20Update%20Channel.m3u';
            } else if (server === '3') {
                m3uUrl = 'https://raw.githubusercontent.com/johnvaibsl-blip/Ozzy-TV/main/channels.m3u';
            } else if (server === '4') {
                m3uUrl = 'https://raw.githubusercontent.com/johnvaibsl-blip/Ozzy-TV/main/fifa-worldcup.m3u';
            } else {
                m3uUrl = 'https://raw.githubusercontent.com/johnvaibsl-blip/Ozzy-TV/main/world-cup-sports.m3u';
            }
        const text = await fetchUrl(m3uUrl);
        const channels = parseM3U(text);

        const results = await Promise.allSettled(
            channels.map(async (ch) => {
                const ok = await testUrl(ch.url);
                return { ...ch, working: ok };
            })
        );

        const all = results.map(r => r.status === 'fulfilled' ? r.value : { ...r.reason, working: false });
        const working = all.filter(c => c.working).sort((a, b) => (b.views || 0) - (a.views || 0));
        const broken = all.filter(c => !c.working);

        if (!cache) cache = {};
        cache[cacheKey] = [...working, ...broken];
        cacheTime = Date.now();

        res.setHeader('Cache-Control', 's-maxage=60');
        return res.status(200).json(cache[cacheKey]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

function parseM3U(text) {
    const lines = text.split('\n');
    const channels = [];
    let info = null;

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;

        if (line.startsWith('#EXTINF:')) {
            const nameM = line.match(/,(.+)$/);
            const logoM = line.match(/tvg-logo="([^"]*)"/);
            let cats = ['Other'];
            const gM = line.match(/group-title="([^"]*)"/);
            if (gM) {
                cats = gM[1].split(',').map(c => c.trim()).filter(c => c);
            } else {
                const gM2 = line.match(/group-title="([^"]*)/);
                if (gM2) {
                    const p = gM2[1].split(',');
                    cats = p.length > 1 ? [p[0].trim()] : [gM2[1].trim()];
                }
            }
            info = {
                name: nameM ? nameM[1].trim() : 'Unknown',
                logo: logoM ? logoM[1] : '',
                cats
            };
        } else if (line.startsWith('http') && info && line.startsWith('https')) {
            const dup = channels.find(c => c.url === line);
            if (!dup) {
                channels.push({ ...info, url: line });
            }
            info = null;
        }
    }
    return channels;
}

async function testUrl(url) {
    try {
        const client = url.startsWith('https') ? https : http;
        await new Promise((resolve, reject) => {
            const req = client.request(url, {
                method: 'HEAD',
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            }, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 400) resolve();
                else reject(new Error(res.statusCode));
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
            req.end();
        });
        return true;
    } catch {
        return false;
    }
}

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*' },
            timeout: 15000
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchUrl(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('Timeout')); });
    });
}
