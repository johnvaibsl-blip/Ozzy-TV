const http = require('http');
const fs = require('fs');
const path = require('path');

const CHANNELS = [
    { id: '1LIVE', name: 'FIFA World Cup Live', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live', name: 'FIFA World Cup Live 2', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live-1', name: 'FIFA World Cup Live 3', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live-2', name: 'FIFA World Cup Live 4', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live-3', name: 'FIFA World Cup Live 5', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live-4', name: 'FIFA World Cup Live 6', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live-5', name: 'FIFA World Cup Live 7', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live-6', name: 'FIFA World Cup Live 8', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live-7', name: 'FIFA World Cup Live 9', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live-8', name: 'FIFA World Cup Live 10', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: 'FIFA-World-Cup-Live-9', name: 'FIFA World Cup Live 11', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/FIFA-2026.jpg' },
    { id: '2LIVE', name: 'Live 2', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/Live2.jpeg' },
    { id: 'LIVE-CRICKET', name: 'Live Cricket', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/LIVE-CRICKET.jpg' },
    { id: 'LIVE-CRICKET-1', name: 'Live Cricket 2', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/LIVE-CRICKET.jpg' },
    { id: 'LIVE-FOOTBALL', name: 'Live Football', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/LIVE-FOOTBALL.jpg' },
    { id: 'LIVE-FOOTBALL-1', name: 'Live Football 2', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/LIVE-FOOTBALL.jpg' },
    { id: 'LIVE-FOOTBALL-2', name: 'Live Football 3', cat: 'Live Sports', logo: 'https://tv.bdiptv.net/assets/images/LIVE-FOOTBALL.jpg' },
    { id: 'STAR-SPORTS-1', name: 'Star Sports 1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/starsports1.jpg' },
    { id: 'STAR-SPORTS-2', name: 'Star Sports 2', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/starsports2.jpg' },
    { id: 'PTV', name: 'PTV Sports', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/ptvsports.jpg' },
    { id: 'Bein-hd', name: 'BeIN Sports 1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/bein1.jpg' },
    { id: 'ESPN-1', name: 'ESPN', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/espnhd.jpg' },
    { id: 'TNT-Sports-1', name: 'TNT Sports 1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/tntsports1.jpeg' },
    { id: 'TNT-Sports-2', name: 'TNT Sports 2', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/tntsports2.jpeg' },
    { id: 'TNT-Sports-3', name: 'TNT Sports 3', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/tntsports3.jpeg' },
    { id: 'FOX-SPORTS', name: 'Fox Sports', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/fox.jpg' },
    { id: 'Sky-Sports-Main-Event', name: 'Sky Sports Main Event', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/skymainevent.jpg' },
    { id: 'Sony-TEN-1', name: 'Sony TEN 1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/sonyten-1.png' },
    { id: 'A-SPORTS', name: 'A Sports', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/a-sports.jpg' },
    { id: 'willow', name: 'Willow Cricket', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/willowhd.jpg' },
    { id: 'BBC-NEWS', name: 'BBC News', cat: 'News', logo: 'https://tv.bdiptv.net/assets/images/bbcnews.jpg' },
    { id: 'CNN', name: 'CNN', cat: 'News', logo: 'https://tv.bdiptv.net/assets/images/cnnnews.jpg' },
    { id: 'Star_jalsha', name: 'Star Jalsha', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/starjalsha.jpg' },
    { id: 'zee-bangla', name: 'Zee Bangla', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/zeebanglahd.jpg' },
    { id: 'STAR-PLUS', name: 'Star Plus', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/starplushd.jpg' },
    { id: 'SONY-TV', name: 'Sony TV', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/sonytv.jpg' },
    { id: 'Colors-HD', name: 'Colors HD', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/colorshd.jpg' },
    { id: 'HBO', name: 'HBO', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/hbohd.jpg' },
    { id: 'Zee-Cinema-HD', name: 'Zee Cinema HD', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/zee cinema.jpeg' },
    { id: 'SONY-MAX', name: 'Sony Max', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/sonymaxhd.jpg' },
    { id: 'cn', name: 'Cartoon Network', cat: 'Kids', logo: 'https://tv.bdiptv.net/assets/images/cartoonnetwork.jpg' },
    { id: 'DISCOVERY-HD', name: 'Discovery HD', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/discoveryhd.jpg' },
    { id: 'National-geo-graphy-bangla', name: 'Nat Geo Bangla', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/nationalgeo.jpg' }
];

function fetchStreamUrl(streamId) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { req.destroy(); reject(new Error('timeout')); }, 8000);
        const req = http.get(`http://tv.bdiptv.net/play.php?stream=${streamId}`, {
            headers: { 'Referer': 'http://tv.bdiptv.net/', 'User-Agent': 'Mozilla/5.0' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                clearTimeout(timer);
                const m = data.match(/src="([^"]+)"/);
                if (!m) return reject(new Error('no iframe'));
                const url = m[1];
                const sm = url.match(/^(https?:\/\/[^/]+)\/([^/]+)\/embed\.html\?.*token=([^&]+)/);
                if (!sm) return reject(new Error('no token'));
                const baseUrl = sm[1];
                const name = sm[2];
                const token = sm[3];
                const extra = url.includes('remote=') ? '&remote=no_check_ip' : '';
                resolve(`${baseUrl}/${name}/index.m3u8?token=${token}${extra}`);
            });
        });
        req.on('error', (e) => { clearTimeout(timer); reject(e); });
        req.on('timeout', () => { clearTimeout(timer); req.destroy(); reject(new Error('timeout')); });
    });
}

async function main() {
    console.log('Fetching stream URLs from bdiptv.net...');
    const results = await Promise.allSettled(CHANNELS.map(ch => fetchStreamUrl(ch.id)));

    let m3u = '#EXTM3U\n';
    let count = 0;
    for (let i = 0; i < CHANNELS.length; i++) {
        const ch = CHANNELS[i];
        const r = results[i];
        if (r.status === 'fulfilled' && r.value) {
            m3u += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="${ch.cat}",${ch.name}\n`;
            m3u += r.value + '\n';
            count++;
        } else {
            console.log(`  FAILED: ${ch.name} (${r.reason})`);
        }
    }

    const outPath = path.join(__dirname, 'dsat.m3u');
    fs.writeFileSync(outPath, m3u, 'utf8');
    console.log(`Done! ${count}/${CHANNELS.length} channels written to dsat.m3u`);
}

main().catch(console.error);
