const https = require('https');
const http = require('http');

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
    { id: 'Afgan-Sports', name: 'Afghan Sports', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/AFGAN.jpg' },
    { id: 'SUPERSPORTS-CRICKET', name: 'SuperSports Cricket', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/Supersportscricket.jpeg' },
    { id: 'SUPERSPORTS-FOOTBALL', name: 'SuperSports Football', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/Supersportsfootball.jpeg' },
    { id: 'SUPERSPORTS-LALIGA', name: 'SuperSports LaLiga', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/laliga.jpg' },
    { id: 'SUPERSPORTS-PREMIER-LEAGUE', name: 'SuperSports Premier League', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/premer league.jpg' },
    { id: 'Sportv', name: 'Sportv', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/sportv.jpeg' },
    { id: 'SSC1', name: 'SSC1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/SSC.jpg' },
    { id: 'GEO-SPORTS', name: 'Geo Super', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/geosuper.jpg' },
    { id: 'MUTV', name: 'MUTV', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/mutv.jpg' },
    { id: 'Bein-hd', name: 'BeIN Sports 1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/bein1.jpg' },
    { id: 'BEIN-SPORTS-2', name: 'BeIN Sports 2', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/bein2.jpg' },
    { id: 'BEIN-SPORTS-3', name: 'BeIN Sports 3', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/bein3.jpg' },
    { id: 'Bein-Sports-4', name: 'BeIN Sports 4', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/bein4.jpg' },
    { id: 'Ten-Cricket-HD', name: 'Ten Cricket HD', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/tencricket.jpg' },
    { id: 'TNT-Sports-1', name: 'TNT Sports 1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/tntsports1.jpeg' },
    { id: 'TNT-Sports-2', name: 'TNT Sports 2', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/tntsports2.jpeg' },
    { id: 'TNT-Sports-3', name: 'TNT Sports 3', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/tntsports3.jpeg' },
    { id: 'Uk-TNT-4', name: 'TNT Sports 4', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/tnt sports4.jpg' },
    { id: 'FOX-SPORTS', name: 'Fox Sports', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/fox.jpg' },
    { id: 'FOX-SPORTS1', name: 'Fox Sports 1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/foxsports1.jpg' },
    { id: 'willow', name: 'Willow Cricket', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/willowhd.jpg' },
    { id: 'Sky-Sports-Main-Event', name: 'Sky Sports Main Event', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/skymainevent.jpg' },
    { id: 'Sky-Sports-Cricket', name: 'Sky Sports Cricket', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/skycricket.jpg' },
    { id: 'SKY-Sports-Football', name: 'Sky Sports Football', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/skyfootball.jpg' },
    { id: 'Sky-Sports-premier-League', name: 'Sky Sports Premier League', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/skypremierleague.jpg' },
    { id: 'Star-sports-select-1', name: 'Star Sports Select 1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/starselect1.jpg' },
    { id: 'Star-sports-select-2', name: 'Star Sports Select 2', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/starselect2.jpg' },
    { id: 'Sony-TEN-1', name: 'Sony TEN 1', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/sonyten-1.png' },
    { id: 'sony-TEN-2', name: 'Sony TEN 2', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/sonyten2.png' },
    { id: 'sony-ten3', name: 'Sony TEN 3', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/ten3hd.jpg' },
    { id: 'Sony-TEN-5', name: 'Sony TEN 5', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/sonyten5.png' },
    { id: 'SPORTS-18', name: 'Sports 18', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/Sports18-S1.jpg' },
    { id: 'Eurosports', name: 'Eurosports', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/eurosports1.jpg' },
    { id: 'Star-sport-3', name: 'Star Sports 3', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/starsports3.jpg' },
    { id: 'A-SPORTS', name: 'A Sports', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/a-sports.jpg' },
    { id: 'DUBAI-SPORTS-2', name: 'Dubai Sports 2', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/dubai sports.jpg' },
    { id: 'dubai-sports-3', name: 'Dubai Sports 3', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/dubai sports.jpg' },
    { id: 'AND-XPLORE', name: 'And Xplore', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/band sports.jpg' },
    { id: 'ESPN-1', name: 'ESPN', cat: 'Sports', logo: 'https://tv.bdiptv.net/assets/images/espnhd.jpg' },
    { id: 'BBC-NEWS', name: 'BBC News', cat: 'News', logo: 'https://tv.bdiptv.net/assets/images/bbcnews.jpg' },
    { id: 'BBC-Earth', name: 'BBC Earth', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/bbcearthhd.jpg' },
    { id: 'CNN', name: 'CNN', cat: 'News', logo: 'https://tv.bdiptv.net/assets/images/cnnnews.jpg' },
    { id: 'JALSHA-MOVIES', name: 'Jalsha Movies', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/jalshamovies.jpg' },
    { id: 'Star_jalsha', name: 'Star Jalsha', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/starjalsha.jpg' },
    { id: 'zee-bangla', name: 'Zee Bangla', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/zeebanglahd.jpg' },
    { id: 'madani-channel-bangla', name: 'Madani Channel Bangla', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/madanichannel.jpg' },
    { id: 'RUPOSHI-BANGLA', name: 'Ruposhi Bangla', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/Rupasi bangla.jpeg' },
    { id: 'Sony-Aath', name: 'Sony Aath', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/sonyaath.jpg' },
    { id: 'ZEE-24-GHANTA', name: 'Zee 24 Ghanta', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/zee 24.jpeg' },
    { id: 'Colors-Bangla', name: 'Colors Bangla', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/colorsbangla.jpg' },
    { id: 'COLORS-BANGLA-CINEMA', name: 'Colors Bangla Cinema', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/colar-bangla-cinema.jpg' },
    { id: 'ZEE-BANGLA-CINEMA', name: 'Zee Bangla Cinema', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/zeebanglacinema.jpg' },
    { id: 'SANGEET-BANGLA', name: 'Sangeet Bangla', cat: 'Bangla', logo: 'https://tv.bdiptv.net/assets/images/Sangeetbangla.jpg' },
    { id: 'AND-TV', name: 'And TV', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/and tv.jpeg' },
    { id: 'Zee-Cinema-HD', name: 'Zee Cinema HD', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/zee cinema.jpeg' },
    { id: 'zee-tv-hd', name: 'Zee TV HD', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/zee tv.jpeg' },
    { id: 'ZEE-ANMOL-CHANEMA', name: 'Zee Anmol Cinema', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/zeeanmol.jpg' },
    { id: 'HBO', name: 'HBO', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/hbohd.jpg' },
    { id: 'B4U-MOVIES', name: 'B4U Movies', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/b4umovies.jpg' },
    { id: 'my-time', name: 'My Time', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/my time.jpg' },
    { id: 'AXN', name: 'AXN', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/axn.jpg' },
    { id: 'STAR-PLUS', name: 'Star Plus', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/starplushd.jpg' },
    { id: 'STAR-MOVIES-SELECT', name: 'Star Movies Select', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/starmovieshd.jpg' },
    { id: 'star-gold', name: 'Star Gold', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/stargold.jpg' },
    { id: 'star-gold-2', name: 'Star Gold 2', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/stargold2.jpg' },
    { id: 'STAR-GOLD-THRILLS', name: 'Star Gold Thrills', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/stargoldthrills.jpg' },
    { id: 'STAR-GOLD-ROMANCE', name: 'Star Gold Romance', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/stargoldromance.jpg' },
    { id: 'STAR-BHARAT', name: 'Star Bharat', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/starbharat.jpg' },
    { id: 'SONY-TV', name: 'Sony TV', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/sonytv.jpg' },
    { id: 'HUM-TV', name: 'Hum TV', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/humtvhd.jpg' },
    { id: 'Hum-masala', name: 'Hum Masala', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/hum masala.jpg' },
    { id: 'Hum-Sitarey', name: 'Hum Sitarey', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/hum sitarey.jpg' },
    { id: 'SONY-MAX', name: 'Sony Max', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/sonymaxhd.jpg' },
    { id: 'sony-max2', name: 'Sony Max 2', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/sony max2.jpeg' },
    { id: 'SONY-SAB', name: 'Sony SAB', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/sonysabhd.jpg' },
    { id: 'sony-WAH', name: 'Sony Wah', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/sony wah.jpeg' },
    { id: 'Colors-HD', name: 'Colors HD', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/colorshd.jpg' },
    { id: 'SONY-YAY', name: 'Sony YAY', cat: 'Kids', logo: 'https://tv.bdiptv.net/assets/images/sonyyay.jpg' },
    { id: 'SONY-KAL', name: 'Sony Kal', cat: 'Hindi', logo: 'https://tv.bdiptv.net/assets/images/sony kal.jpeg' },
    { id: 'sony-pix-hd', name: 'Sony Pix HD', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/sonypix.jpg' },
    { id: 'mtv-beats', name: 'MTV Beats', cat: 'Music', logo: 'https://tv.bdiptv.net/assets/images/mtvbeats.jpg' },
    { id: 'AND-FLIX', name: 'And Flix', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/andflixhd.jpg' },
    { id: 'and-picture-HD', name: 'And Pictures HD', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/andpictureshd.jpg' },
    { id: 'animalplanent', name: 'Animal Planet', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/animalplanetnew.jpg' },
    { id: 'National-geo-graphy-bangla', name: 'National Geographic Bangla', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/nationalgeo.jpg' },
    { id: 'nat-geo-wild', name: 'Nat Geo Wild', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/natgeowildhd.jpg' },
    { id: 'DISCOVERY-HD', name: 'Discovery HD', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/discoveryhd.jpg' },
    { id: 'travel-xp', name: 'Travel XP', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/travelxphd.jpg' },
    { id: 'tlc-hd', name: 'TLC HD', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/tlchd.jpg' },
    { id: 'REDBOL-TV', name: 'Red Bull TV', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/red bull.jpg' },
    { id: 'DMAX', name: 'DMAX', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/dmax.jpg' },
    { id: 'LOVE-NATURE', name: 'Love Nature', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/love nature.jpg' },
    { id: 'Wild-Earth', name: 'Wild Earth', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/wild earth.jpg' },
    { id: 'Discovery-Science', name: 'Discovery Science', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/discoveryscience.jpg' },
    { id: 'Discovery-Turbo', name: 'Discovery Turbo', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/discovery turbo.jpg' },
    { id: 'Investigation-Discovery', name: 'Investigation Discovery', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/investigation discovery.jpg' },
    { id: 'DISCOVERY-BANGLA', name: 'Discovery Bangla', cat: 'Documentary', logo: 'https://tv.bdiptv.net/assets/images/discoverybangla.jpg' },
    { id: 'DISNEY-HINDI', name: 'Disney Channel Hindi', cat: 'Kids', logo: 'https://tv.bdiptv.net/assets/images/disneychannel.jpg' },
    { id: 'DISCOVERY-KIDS', name: 'Discovery Kids', cat: 'Kids', logo: 'https://tv.bdiptv.net/assets/images/discoverykids.jpg' },
    { id: 'cn', name: 'Cartoon Network', cat: 'Kids', logo: 'https://tv.bdiptv.net/assets/images/cartoonnetwork.jpg' },
    { id: 'POGO', name: 'POGO', cat: 'Kids', logo: 'https://tv.bdiptv.net/assets/images/pogo.jpg' },
    { id: 'MN-Plus', name: 'MN Plus', cat: 'Movies', logo: 'https://tv.bdiptv.net/assets/images/mnplushd.jpg' },
    { id: '9XM', name: '9XM', cat: 'Music', logo: 'https://tv.bdiptv.net/assets/images/9xm.jpg' },
    { id: '9X-JALWA', name: '9X Jalwa', cat: 'Music', logo: 'https://tv.bdiptv.net/assets/images/9xjalwa.jpg' },
    { id: 'B4U-MUSIC', name: 'B4U Music', cat: 'Music', logo: 'https://tv.bdiptv.net/assets/images/b4umusic.jpg' },
    { id: 'xite-music', name: 'Xite Music', cat: 'Music', logo: 'https://tv.bdiptv.net/assets/images/Xitemusic.jpeg' }
];

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(204).end();

    if (cache && Date.now() - cacheTime < CACHE_TTL) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 's-maxage=60');
        return res.status(200).send(cache);
    }

    try {
        const results = await Promise.allSettled(
            CHANNELS.map(ch => fetchStreamUrl(ch.id, 8000))
        );

        let m3u = '#EXTM3U\n';
        for (let i = 0; i < CHANNELS.length; i++) {
            const ch = CHANNELS[i];
            const r = results[i];
            if (r.status === 'fulfilled' && r.value) {
                const logo = ch.logo || '';
                m3u += `#EXTINF:-1 tvg-logo="${logo}" group-title="${ch.cat}",${ch.name}\n`;
                m3u += r.value + '\n';
            }
        }

        cache = m3u;
        cacheTime = Date.now();

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 's-maxage=60');
        return res.status(200).send(m3u);
    } catch (err) {
        return res.status(500).send('#EXTM3U\n# Error: ' + err.message + '\n');
    }
};

function fetchStreamUrl(streamId, timeout) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { req.destroy(); reject(new Error('timeout')); }, timeout);
        const req = http.get(`http://tv.bdiptv.net/play.php?stream=${streamId}`, {
            headers: { 'Referer': 'http://tv.bdiptv.net/', 'User-Agent': 'Mozilla/5.0' },
            timeout: timeout
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
