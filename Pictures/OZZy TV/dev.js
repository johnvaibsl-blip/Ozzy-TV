const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml'
};

function fetchUrl(target) {
    return new Promise((resolve, reject) => {
        const client = target.startsWith('https') ? https : http;
        client.get(target, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*' },
            timeout: 15000
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchUrl(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    const parsed = url.parse(req.url, true);

    // API route
    if (parsed.pathname === '/api/channels') {
        try {
            const server = parsed.query.server || '1';
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
            const m3u = await fetchUrl(m3uUrl);
            res.writeHead(200, { 'Content-Type': 'application/x-mpegurl; charset=utf-8' });
            return res.end(m3u);
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: e.message }));
        }
    }

    // Static files
    let fp = path.join(ROOT, parsed.pathname === '/' ? 'index.html' : parsed.pathname);
    if (!fs.existsSync(fp)) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(fp);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    fs.createReadStream(fp).pipe(res);
});

server.listen(PORT, () => console.log('http://localhost:' + PORT));
