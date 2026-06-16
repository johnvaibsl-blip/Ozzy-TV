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
        sources: []
    },
    "Server 6": {
        label: "Updated",
        sources: ["/dsat.m3u"]
    }
};

const ASIMX_CHANNELS = [
    {name:"CazéTV FIFA (1080P)",logo:"https://images.seeklogo.com/logo-png/61/1/cazetv-logo-png_seeklogo-619708.png",url:"https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/1080p-vtt/index.m3u8",cat:"Sports",views:2489},
    {name:"UNITE8 (1080P)",logo:"https://akamaividz2.zee5.com/image/upload/w_720,h_405,c_scale,f_webp,q_auto:eco/resources/0-9-channel_2105335046/list/1920x1080list88f79d7c74df4d998da1bbd448f465ff.jpg",url:"https://live9.asimxtech.online/unite8/unite8.m3u8",cat:"Sports",views:2083}
];

const BDIX_M3U_RAW = `#EXTM3U
#EXTINF:-1 ,TNT SPORTS PREMIUM 1
http://38.226.210.46:8000/play/a05m/index.m3u8
#EXTINF:-1 ,TNT SPORTS PREMIUM 2
http://45.181.122.46:8090/play/a00i
#EXTINF:-1 ,TNT SPORTS PREMIUM 5
http://45.232.210.1:18000/play/a05l/index.m3u8
#EXTINF:-1 ,TNT SPORTS PREMIUM 6
http://38.226.49.253:8000/play/a06f/index.m3u8
#EXTINF:-1 ,TNT SPORTS PREMIUM 7
http://181.205.130.194:4000/play/a0e4
#EXTINF:-1 ,TNT SPORTS PREMIUM 8
http://181.79.87.130:8000/play/a0cl/index.m3u8
#EXTINF:-1 ,TNT SPORTS 1
http://38.44.109.41:8003/play/a0g4/index.m3u8
#EXTINF:-1 ,TNT SPORTS 2
http://45.181.122.46:8090/play/a04m
#EXTINF:-1 ,ESPN PREMIUM CH
http://45.181.122.46:8090/play/a015
#EXTINF:-1 ,ESPN PREMIUM CH
http://38.226.210.46:8000/play/a05q/index.m3u8
#EXTINF:-1 ,ESPN
http://38.226.210.46:8000/play/a05p/index.m3u8
#EXTINF:-1 ,ESPN 2
http://38.224.231.47:8000/play/a05z/index.m3u8
#EXTINF:-1 ,ESPN 4
http://38.224.231.47:8000/play/a04h/index.m3u8
#EXTINF:-1 ,ESPN 5
http://38.226.49.253:8000/play/a078/index.m3u8
#EXTINF:-1 ,ESPN 6
http://38.226.49.253:8000/play/a05p/index.m3u8
#EXTINF:-1 ,ESPN 7
http://38.44.109.41:8003/play/a0hx/index.m3u8
#EXTINF:-1 ,FOX SPORTS
http://190.7.19.197:232/play/a05u/index.m3u8
#EXTINF:-1 ,FOX SPORTS 2
http://190.7.19.197:232/play/a03p/index.m3u8
#EXTINF:-1 ,FOX SPORTS 3
http://190.7.19.197:232/play/a04x/index.m3u8
#EXTINF:-1 ,FOX DEPORTES
http://45.5.118.152:8000/play/a08d/index.m3u8
#EXTINF:-1 ,FOX +
http://181.78.192.238:8000/play/a2hi/index.m3u8
#EXTINF:-1 ,FOX DEPORTES USA
http://23.237.104.106:8080/USA_FOX_DEPORTES/index.m3u8
#EXTINF:-1 ,L1
http://38.226.210.46:8000/play/a05x/index.m3u8
#EXTINF:-1 ,L1MAX
http://38.226.210.46:8000/play/a06k/index.m3u8
#EXTINF:-1 ,CLARO SPORTS 1
http://45.167.1.136:8000/play/a00d
#EXTINF:-1 ,CLARO SPORTS 2
http://45.167.1.136:8000/play/a00e
#EXTINF:-1 ,TUDN DEPORTES
http://45.167.2.101:8000/play/a0r4/index.m3u8
#EXTINF:-1 ,BEIN SPORTS
https://bein-esp-xumo.amagi.tv/playlist.m3u8
#EXTINF:-1 ,ECDF
http://181.79.87.130:8000/play/a0ca/index.m3u8
#EXTINF:-1 ,FUTV
http://45.5.118.152:8000/play/a063/index.m3u8
#EXTINF:-1 ,DIRECTV SPORTS
http://38.226.210.46:8000/play/A008/index.m3u8
#EXTINF:-1 ,DIRECTV SPORTS 2
http://190.7.19.197:232/play/a09h/index.m3u8
#EXTINF:-1 ,DIRECTV SPORTS +
http://190.7.19.197:232/play/a09i/index.m3u8
#EXTINF:-1 ,SKY SPORTS LA LIGA
http://45.5.119.43:4000/play/a05r/index.m3u8
#EXTINF:-1 ,TIGO SPORTS
http://45.5.118.152:8000/play/a08x/index.m3u8
#EXTINF:-1 ,MOVISTAR DEPORTES
http://38.210.4.182:8000/play/a0uk/index.m3u8
#EXTINF:-1 ,WIN SPORTS
http://181.118.156.46:8000/play/a05w/index.m3u8
#EXTINF:-1 ,WIN SPORTS +
http://38.19.41.123:8000/play/a0cl/index.m3u8
#EXTINF:-1 ,GOLF CHANNEL
http://45.5.116.228:8000/play/a0h1/index.m3u8
#EXTINF:-1 ,win
http://8.243.126.131:8000/play/a025/index.m3u8
#EXTINF:-1 ,WIN SPORTS
http://181.78.71.71:18000/play/a03p/index.m3u8
#EXTINF:-1 ,win+
http://190.60.37.154:45000/play/a00q/index.m3u8
#EXTINF:-1 ,TYC
http://190.60.37.154:45000/play/a05a/index.m3u8
#EXTINF:-1 ,espn premium
http://205.235.6.29:8000/play/a0pz/index.m3u8
#EXTINF:-1 ,tnt sport
http://205.235.6.29:8000/play/a0xa/index.m3u8
#EXTINF:-1 ,tnt sport premium
http://205.235.6.29:8000/play/a104/index.m3u8
#EXTINF:-1 ,espn
http://205.235.6.29:8000/play/a0zf/index.m3u8
#EXTINF:-1 ,espn 7
http://205.235.6.29:8000/play/a0zv/index.m3u8
#EXTINF:-1 ,TUDN USA
http://m3u.tvcluboficial.com/m/m/957.m3u8
#EXTINF:-1 ,win sport
http://m3u.tvcluboficial.com/m/m/1039.m3u8
#EXTINF:-1 ,win sports+
http://m3u.tvcluboficial.com/m/m/1042.m3u8
#EXTINF:-1 ,ESPN PREMIUM CHI
http://186.33.40.97:8789/play/22
#EXTINF:-1 ,CLARO SPORTS
http://162.19.255.233:8080/play/UNbAl57p9hXZClOu56FCTUSaL5q1VtS-E1wCfb1nvO4/m3u8
#EXTINF:-1 ,WIN SPORTS
http://190.60.39.195:8000/play/a0ug/index.m3u8
#EXTINF:-1 ,ESPN PREMIUN 1
http://190.7.19.197:232/play/a038/index.m3u8
#EXTINF:-1 ,ESPN 5
http://181.118.158.103:8000/play/a03c/index.m3u8
#EXTINF:-1 ,ESPN ARG
http://45.170.130.224:8000/play/a04l/index.m3u8
#EXTINF:-1 ,TYC SPORTS Internacional
http://190.7.19.197:232/play/a04w/index.m3u8
#EXTINF:-1 ,DAZN 1
http://znty.dyndns.org:5010/hls/eleven1.m3u8
#EXTINF:-1 ,DAZN 2
http://znty.dyndns.org:5010/hls/eleven2.m3u8
#EXTINF:-1 ,DAZN 3
http://znty.dyndns.org:5010/hls/eleven3.m3u8
#EXTINF:-1 ,DAZN 4
http://znty.dyndns.org:5010/hls/eleven4.m3u8
#EXTINF:-1 ,DAZN 5
http://znty.dyndns.org:5010/hls/eleven5.m3u8
#EXTINF:-1 ,SKY SPORT LALIGA
http://179.60.224.196:8000/play/a0i7/index.m3u8
#EXTINF:-1 ,TDM Desporto
http://cdn6.163189.xyz/163189/amty
#EXTINF:-1 ,OTT CLUB
http://czrb8vng.ottclub.xyz/iptv/AHMQNVLWUTM5PW/6554/index.m3u8
#EXTINF:-1 ,Digi Sport 2
http://91.201.172.14:35006/
#EXTINF:-1 ,ESPN 2
http://181.205.130.194:4000/play/a07i
#EXTINF:-1 ,ESPN 2
http://191.97.49.82:8001/play/a00m/index.m3u8
#EXTINF:-1 ,Dazn 1
http://wo0dyefk.dienalt.org/iptv/DV3AC2Q6YSR9XE/2531/index.m3u8
#EXTINF:-1 ,Dazn 1
http://wo0dyefk.dienalt.org/iptv/DV3AC2Q6YSR9XE/19158/index.m3u8
#EXTINF:-1 ,Dazn 2
http://wo0dyefk.dienalt.org/iptv/DV3AC2Q6YSR9XE/2532/index.m3u8
#EXTINF:-1 ,Dazn 3
http://wo0dyefk.dienalt.org/iptv/DV3AC2Q6YSR9XE/7062/index.m3u8
#EXTINF:-1 ,Dazn 4
http://wo0dyefk.dienalt.org/iptv/DV3AC2Q6YSR9XE/2534/index.m3u8
#EXTINF:-1 ,Dazn 5
http://wo0dyefk.dienalt.org/iptv/DV3AC2Q6YSR9XE/2535/index.m3u8
#EXTINF:-1 ,Bein Sport 3
http://145.239.5.177:80/559/index.m3u8
#EXTINF:-1 ,Bein Sport 1
http://99.27.51.147:8080/BeinSport/index.m3u8
#EXTINF:-1 ,Bein Sport 3
http://99.27.51.147:8080/BeinSport3/index.m3u8
#EXTINF:-1 ,CANAL + Sport
http://151.80.18.177:86/Canal+_sport_HD/index.m3u8
#EXTINF:-1 ,Setenta Sport 1
http://cdntv.online/low/9mlxywika2/1021.m3u8
#EXTINF:-1 ,Setenta Sport 2
http://cdntv.online/low/9mlxywika2/1022.m3u8
#EXTINF:-1 ,RTI 1 (1080p)
http://69.64.57.208:8080/rti1/playlist.m3u8
#EXTINF:-1 ,RTI 2 (1080p)
http://69.64.57.208:8080/rti2/playlist.m3u8
#EXTINF:-1 ,Claro Sports 2
http://45.5.118.152:8000/play/a0ah/index.m3u8
#EXTINF:-1 ,Movistar Deportes
http://38.226.210.46:8000/play/a06d/index.m3u8
#EXTINF:-1 ,Via X Sport
http://38.226.49.253:8000/play/a042/index.m3u8
#EXTINF:-1 ,Golf Channel
http://45.167.1.136:8000/play/a05s
#EXTINF:-1 ,Tango Sports 4
http://190.7.19.197:232/play/a037/index.m3u8
#EXTINF:-1 ,LOS SIMPSONS
http://srv3.zcast.com.br/sim1al5/sim1al5/playlist.m3u8
#EXTINF:-1 ,LOS SIMPSONS
http://srv3.zcast.com.br/sim6al10/sim6al10/playlist.m3u8
#EXTINF:-1 ,DSPORTS(opc1)
http://201.230.121.85:8000/play/dssporthd/index.m3u8
#EXTINF:-1 ,DSports(opc3)
http://191.97.14.162:8000/play/a04s/index.m3u8
#EXTINF:-1 ,DSports(opc5)
http://152.231.29.139:8000/play/a0ji/index.m3u8
#EXTINF:-1 ,DSports(opc7)
http://8.243.126.131:8000/play/a05a/index.m3u8
#EXTINF:-1 ,ESPN
http://177.10.184.193:8000/play/a053/index.m3u8
#EXTINF:-1 ,ESPN 2 (opc1)
http://191.97.14.162:8000/play/a016/index.m3u8
#EXTINF:-1 ,ESPN 2 (opc2)
http://190.11.225.124:5000/live/espn_2_hd/playlist.m3u8
#EXTINF:-1 ,ESPN 2 (opc3)
http://181.78.14.26:4000/play/a05c/index.m3u8
#EXTINF:-1 ,ESPN 3 HD
http://177.10.184.193:8000/play/a0dc/index.m3u8
#EXTINF:-1 ,ESPN 4
http://177.10.184.193:8000/play/a0df/index.m3u8
#EXTINF:-1 ,ESPN 5 HD
http://177.10.184.193:8000/play/a0de/index.m3u8
#EXTINF:-1 ,ESPN 6 HD
http://177.10.184.193:8000/play/a0dd/index.m3u8
#EXTINF:-1 ,TyC SPORTS Internacional
http://190.108.93.75:8001/play/a05d/index.m3u8
#EXTINF:-1 ,CLARO SPORTS
https://dai.google.com/linear/hls/event/_OKWx76jT7mivD6d-25QAw/master.m3u8
#EXTINF:-1 ,Negocios TV
https://streaming013.gestec-video.com/hls/negociostv.m3u8
#EXTINF:-1 ,El Confidencial
https://dgrfwaj8stp69.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-hmbd9k13g6zsa/live/fast-channel-elconfidencial/fast-channel-elconfidencial.m3u8
#EXTINF:-1 ,COSMOS TV
https://tv.mediacp.eu:19360/cosmos/cosmos.m3u8
#EXTINF:-1 ,TNT HD
http://177.10.184.193:8000/play/a09m/index.m3u8
#EXTINF:-1 ,TNT
http://191.97.14.162:8000/play/a05h/index.m3u8
#EXTINF:-1 ,TNT Series
http://177.10.184.193:8000/play/a03l/index.m3u8
#EXTINF:-1 ,Caze TV
https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/1080p-vtt/index.m3u8
#EXTINF:-1 ,fifa
http://198.195.239.50:8095/tsports/tracks-v1a1/mono.m3u8
#EXTINF:-1 ,Bein Sports 1
https://amg01334-beinsportsllc-beinxtraesp-localnow-aekzc.amagi.tv/playlistR1080p.m3u8
#EXTINF:-1 ,Bein Sports 1
https://owrcovcrpy.gpcdn.net/bpk-tv/1709/output/index.m3u8
#EXTINF:-1 ,T sports 7
http://198.195.239.50:8095/tsports/index.m3u8
#EXTINF:-1 ,Drama 24
http://vods2.aynascope.net/gseriesDrama/index.m3u8
#EXTINF:-1 ,Channel 1
https://owrcovcrpy.gpcdn.net/bpk-tv/1702/output/index.m3u8
#EXTINF:-1 ,Jamuna TV
https://owrcovcrpy.gpcdn.net/bpk-tv/1701/output/index.m3u8
#EXTINF:-1 ,DBC News HD
https://owrcovcrpy.gpcdn.net/bpk-tv/1728/output/index.m3u8
#EXTINF:-1 ,Maasranga TV
https://owrcovcrpy.gpcdn.net/bpk-tv/1722/output/index.m3u8
#EXTINF:-1 ,Ekattor HD
https://owrcovcrpy.gpcdn.net/bpk-tv/1705/output/index.m3u8
#EXTINF:-1 ,Channel 24 HD
https://owrcovcrpy.gpcdn.net/bpk-tv/1703/output/index.m3u8
#EXTINF:-1 ,ATN News
https://owrcovcrpy.gpcdn.net/bpk-tv/1706/output/index.m3u8
#EXTINF:-1 ,News 24 HD
https://owrcovcrpy.gpcdn.net/bpk-tv/1708/output/index.m3u8
#EXTINF:-1 ,Star News
https://owrcovcrpy.gpcdn.net/bpk-tv/1710/output/index.m3u8
#EXTINF:-1 ,Islamic TV
https://owrcovcrpy.gpcdn.net/bpk-tv/1724/output/index.m3u8
#EXTINF:-1 ,Deepto TV HD
https://owrcovcrpy.gpcdn.net/bpk-tv/1711/output/index.m3u8
#EXTINF:-1 ,Channel 9 HD
https://owrcovcrpy.gpcdn.net/bpk-tv/1729/output/index.m3u8
#EXTINF:-1 ,Channel I HD
https://owrcovcrpy.gpcdn.net/bpk-tv/1723/output/index.m3u8
#EXTINF:-1 ,Bangla Vision
https://owrcovcrpy.gpcdn.net/bpk-tv/1715/output/index.m3u8
#EXTINF:-1 ,NTV
https://owrcovcrpy.gpcdn.net/bpk-tv/1716/output/index.m3u8
#EXTINF:-1 ,Al Jazeera
https://owrcovcrpy.gpcdn.net/bpk-tv/1721/output/index.m3u8
#EXTINF:-1 ,Al Quran
https://owrcovcrpy.gpcdn.net/bpk-tv/1713/output/index.m3u8
#EXTINF:-1 ,Independent TV
https://owrcovcrpy.gpcdn.net/bpk-tv/1704/output/index.m3u8
#EXTINF:-1 ,Bhi Channel
http://15.235.185.236/hls/bhi.m3u8
#EXTINF:-1 ,Deepto TV
https://byphdgllyk.gpcdn.net/hls/deeptotv/index.m3u8
#EXTINF:-1 ,Deshi TV
https://deshitv.deshitv24.net/live/myStream/playlist.m3u8
#EXTINF:-1 ,Ekushey TV
http://210.4.72.204/hls-live/livepkgr/_definst_/liveevent/livestream3.m3u8
#EXTINF:-1 ,NRB TV
https://app.ncare.live/live-orgin/nrb-eu.stream/playlist.m3u8
#EXTINF:-1 ,Probashi TV
http://158.69.24.53:8080/probashi_tv/tracks-v1a1/mono.m3u8
#EXTINF:-1 ,Enterr 10 Bangla
https://live-bangla.akamaized.net/liveabr/pub-iobanglakp3sff/live_720p/chunks.m3u8
#EXTINF:-1 ,T Sports HD
http://rgkkw.live:80/live/1Aoen7elp5/IgMJ60tmAa/130714.ts
#EXTINF:-1 ,ZB Cartun TV
https://server.zillarbarta.com/zbcatun/video.m3u8
#EXTINF:-1 ,Deepto TV
https://byphdgllyk.gpcdn.net/hls/deeptotv/0_1/index.m3u8
#EXTINF:-1 ,Star Jalsha HD
http://rgkkw.live:80/live/1Aoen7elp5/IgMJ60tmAa/198.ts
#EXTINF:-1 ,News18 Bangla
https://amg01448-samsungin-news18bangla-samsungin-ad-qy.amagi.tv/playlist/amg01448-samsungin-news18bangla-samsungin/playlist.m3u8
#EXTINF:-1 ,Saudi Quran
https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8
#EXTINF:-1 ,Euro Sport
https://stream.ottplus.bd/live/euro_sports_hd_abr/live/euro_sports_hd/chunks.m3u8
#EXTINF:-1 ,Funny Junior HD
https://nomawnoijl.gpcdn.net/akash/funnyjunior/playlist.m3u8
#EXTINF:-1 ,Sports Range
https://nomawnoijl.gpcdn.net/akash/sportrange/playlist.m3u8
#EXTINF:-1 ,Fighters
https://nomawnoijl.gpcdn.net/akash/fighter/playlist.m3u8
#EXTINF:-1 ,Nikki
https://nomawnoijl.gpcdn.net/akash/nikky/playlist.m3u8
#EXTINF:-1 ,Crazy Ex
https://nomawnoijl.gpcdn.net/akash/crazy_ex/playlist.m3u8
#EXTINF:-1 ,Delicious
https://nomawnoijl.gpcdn.net/akash/delicious/playlist.m3u8
#EXTINF:-1 ,Program Promo
https://owrcovcrpy.gpcdn.net/bpk-tv/1720/output/index.m3u8
#EXTINF:-1 ,Enter10 Bangla HD
https://live-bangla.akamaized.net/liveabr/pub-iobanglakp3sff/live_240p/chunks.m3u8
#EXTINF:-1 ,R Plus Gold
https://thelegitpro.in/pntv/rplusnews24x7/tracks-v1a1/mono.m3u8
#EXTINF:-1 ,IN | Bangla Jago TV
http://banglajagotv.livebox.co.in:80/banglajagohls/24x7.m3u8
#EXTINF:-1 ,IN | R Plus News
https://thelegitpro.in/pntv/rplusnews24x7/index.m3u8
#EXTINF:-1 ,IN | Republic Bangla
https://vg-republictvyupp.akamaized.net/ptnr-yuppt/v1/manifest/611d79b11b77e2f571934fd80ca1413453772ac7/vglive-sk-613605/93d674ab-f7a0-404e-88b2-b4f163373dbe/0.m3u8
#EXTINF:-1 ,ENT | Dangal TV
https://live-dangal.akamaized.net/liveabr/pub-iodang10p4al/live_720p/chunks.m3u8
#EXTINF:-1 ,ENT | DANGAL2
https://live-dangal2.akamaized.net/liveabr/playlist.m3u8
#EXTINF:-1 ,ENT | DD Bharati
https://d2lk5u59tns74c.cloudfront.net/out/v1/67cec794d8b14f9ba21f73924ac65797/index.m3u8
#EXTINF:-1 ,ENT | DD National HD
https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/40492a64c1db4a1385ba1a397d357d3a/index.m3u8
#EXTINF:-1 ,ENT | DD URDU
https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/9b91e9007e754db39a8b32c6bfc5b24a/index.m3u8
#EXTINF:-1 ,NEWS | Aaj Tak HD
https://aajtaklive-amd.akamaized.net/hls/live/2014416/aajtak/aajtaklive/live_720p/chunks.m3u8
#EXTINF:-1 ,NEWS | Aap Ki Adalat
https://amg01550-indiatv-indiatv-aapkiadalat-mi-xiaomi-n5tuk.amagi.tv/playlist/amg01550-indiatv-indiatv-aapkiadalat-mi-xiaomi/playlist.m3u8
#EXTINF:-1 ,NEWS | India Today
https://d2lk5u59tns74c.cloudfront.net/out/v1/d4435039c7d1433d9b9d0b6cdc9dd4ff/index.m3u8
#EXTINF:-1 ,NEWS | India TV
https://pl-indiatvnews.akamaized.net/out/v1/db79179b608641ceaa5a4d0dd0dca8da/index.m3u8
#EXTINF:-1 ,NEWS | NDTV English
https://ndtv24x7elemarchana.akamaized.net/hls/live/2003678-b/ndtv24x7/master.m3u8
#EXTINF:-1 ,NEWS | NDTV Hindi
https://ndtvindiaelemarchana.akamaized.net/hls/live/2003679-b/ndtvindia/master.m3u8
#EXTINF:-1 ,NEWS | News Nation
https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/6cd2f649739a45ca9de1daf81cc7d0f2/index.m3u8
#EXTINF:-1 ,NEWS | News24
https://amg13643-amg13643c1-amgplt0016.playout.now3.amagi.tv/ts-eu-w1-n2/playlist/amg13643-amg13643c1-amgplt0016/playlist.m3u8
#EXTINF:-1 ,NEWS | Republic TV
https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/2e31d831f08640ff92f65003bdc89991/index.m3u8
#EXTINF:-1 ,NEWS | ZEE BUSINESS
https://dwby15d04agvq.cloudfront.net/index_1.m3u8
#EXTINF:-1 ,Football World Cup
http://rgkkw.live/live/1Aoen7elp5/IgMJ60tmAa/745195.ts
#EXTINF:-1 ,Football World Cup
http://rgkkw.live/live/1Aoen7elp5/IgMJ60tmAa/745149.ts
#EXTINF:-1 ,GO Live
https://d1211whpimeups.cloudfront.net/smil:rtbgo/chunklist.m3u8
#EXTINF:-1 ,Unite8 Sports 2 HD
http://212.102.34.8:9080/AndFlixHD/video.m3u8
#EXTINF:-1 ,Zee Bangla Cinema
https://d1g8wgjurz8via.cloudfront.net/bpk-tv/ColorsHD/default/ColorsHD.m3u8
#EXTINF:-1 ,FOX 4K
https://otte-tim.live.pv-cdn.net/pdx-nitro/live/clients/dash/enc/ajfoeddkbz/out/v1/b78800b9b2304879b15843f455836829/cenc.mpd
#EXTINF:-1 ,T Sports HD
http://starhub.pro/live/farhat-3379/67897-913379/18452.ts
#EXTINF:-1 ,TSN 1
http://stalker.hakunamata.workers.dev/play/258/index.m3u8
#EXTINF:-1 ,TSN 2
http://stalker.hakunamata.workers.dev/play/259/index.m3u8
#EXTINF:-1 ,TSN 3
http://stalker.hakunamata.workers.dev/play/260/index.m3u8
#EXTINF:-1 ,TSN 4
http://stalker.hakunamata.workers.dev/play/261/index.m3u8
#EXTINF:-1 ,TSN 5
http://stalker.hakunamata.workers.dev/play/262/index.m3u8
#EXTINF:-1 ,BeIN 1 Direct FHD
http://1.la5liga.store:80/play/oOuLyOr0l4zfSQqe-48swyrUC_d5JG7Wj1gX3MfuOaHcCaCD-hqEbP027yBVHqJ4
#EXTINF:-1 ,Caze TV HD
https://otte.cache.aiv-cdn.net/bom-nitro/live/clients/dash/enc/3ynrpdanq2/out/v1/81fd4c26584044d2b1a1cc5b32fa9af0/cenc.mpd
#EXTINF:-1 ,DSPORTS+ FHD
http://otte.live.fly.ww.aiv-cdn.net/lhr-nitro/live/dash/enc/ud6bnhthpj/out/v1/2639a2f4480f4269953de466d5f46463/cenc.mpd
#EXTINF:-1 ,DSPORTS FHD
https://otte.live.fly.ww.aiv-cdn.net/gru-nitro/live/clients/dash/enc/ubehitlwzo/out/v1/8e09c381a51f4366a19e979418112e8f/cenc.mpd
#EXTINF:-1 ,DSPORTS HD
https://otte.live.fly.ww.aiv-cdn.net/gru-nitro/live/clients/dash-sd/enc/l0qqwxo6sc/out/v1/ba9e2a12afb54ab692464f9b7e72b0ba/cenc-sd.mpd
#EXTINF:-1 ,DAZN HDR
https://fhd60fps-by-opensourecflix.exmax.workers.dev/index.m3u8
#EXTINF:-1 ,W-SPORTS
https://tglmp02.akamaized.net/out/v1/1063ebb215c14312ba9d4e415ac706d2/manifest.mpd
#EXTINF:-1 ,FOXSPORTS
https://otte.live.fly.ww.aiv-cdn.net/dub-nitro/live/dash/enc/oboxe53wyo/out/v1/f7892a9d706d419a846d738fa22ea33e/cenc.mpd
#EXTINF:-1 ,FOXSPORTS 2
https://otte.live.fly.ww.aiv-cdn.net/dub-nitro/live/dash/enc/tepjqej1ys/out/v1/c9c9159baee749a19612b1598495859a/cenc.mpd
#EXTINF:-1 ,FOXSPORTS 3
https://otte.live.fly.ww.aiv-cdn.net/dub-nitro/live/dash/enc/wybgz0orr8/out/v1/2f6d1612abd44f5883917f8a585b955f/cenc.mpd
#EXTINF:-1 ,FOXSPORTS PREMIUM
https://otte.live.fly.ww.aiv-cdn.net/dub-nitro/live/dash/enc/fdx74zqzhu/out/v1/7d7a8c6981a842b98a683e9fbfe51d17/cenc.mpd
#EXTINF:-1 ,SPORT 1
http://estreams.tv.nej.cz/dash/CH_SPORT1_Portable.ism/playlist.mpd
#EXTINF:-1 ,SPORT 2
http://estreams.tv.nej.cz/dash/CH_SPORT2_Portable.ism/playlist.mpd
#EXTINF:-1 ,SPORTY TV
http://estreams.tv.nej.cz/dash/CH_SPORTYTV_Portable.ism/playlist.mpd
#EXTINF:-1 ,Tap Sports
https://qp-pldt-live-grp-11-prod.akamaized.net/out/u/dr_tapsports.mpd
#EXTINF:-1 ,Premiere Sports 1
https://otte.live.fly.ww.aiv-cdn.net/gru-nitro/live/clients/dash/enc/nelfyucw9a/out/v1/6ffb2c365ad14f88b154591beb43d1f6/cenc.mpd
#EXTINF:-1 ,Premiere Sports 2
https://otte.live.fly.ww.aiv-cdn.net/gru-nitro/live/clients/dash/enc/oy6rp0jwmf/out/v1/580ecf12bad24979baf8dd993dce053e/cenc.mpd
#EXTINF:-1 ,Premiere Sports 3
https://otte.live.fly.ww.aiv-cdn.net/gru-nitro/live/clients/dash/enc/6onrfniyry/out/v1/f23069c61dbf4e00890a40b705a84079/cenc.mpd
#EXTINF:-1 ,Premiere Sports 4
https://otte.live.fly.ww.aiv-cdn.net/gru-nitro/live/clients/dash/enc/tirjor64kh/out/v1/fd2ed9916d994f09a3bd62b64141b9cb/cenc.mpd
#EXTINF:-1 ,Premiere Sports 5
https://otte.live.fly.ww.aiv-cdn.net/gru-nitro/live/clients/dash/enc/1obktrybht/out/v1/08265453c8f64d9fbeb3cf43764403a8/cenc.mpd
#EXTINF:-1 ,SportTV 2
https://otte.live.fly.ww.aiv-cdn.net/gru-nitro/live/clients/dash-sd/enc/4yiko4it8k/out/v1/b77dd424c745443aba2f3f88d418f797/cenc-sd.mpd
#EXTINF:-1 ,SportTV 3
https://otte.live.fly.ww.aiv-cdn.net/gru-nitro/live/clients/dash/enc/6otiglnptp/out/v1/add7499679b0422cb6791f7701f95ecc/cenc.mpd
#EXTINF:-1 ,BEIN SPORTS 1
https://otte.live.fly.ww.aiv-cdn.net/syd-nitro/live/clients/dash/enc/ghwcl6hv68/out/v1/83536910d8034e9b9895a20fbe1c1687/cenc.mpd
#EXTINF:-1 ,BEIN SPORTS 2
https://otte.live.fly.ww.aiv-cdn.net/syd-nitro/live/clients/dash/enc/8m8cd46i1t/out/v1/83985c68e4174e90a58a1f2c024be4c9/cenc.mpd
#EXTINF:-1 ,BEIN SPORTS 3
https://a83aivottlinear-a.akamaihd.net/OTTB/syd-nitro/live/clients/dash/enc/q4u5nwaogz/out/v1/18de6d3e65934f3a8de4358e69eab86c/cenc.mpd
#EXTINF:-1 ,BeIN Sports Xtra
https://amg01334-beinsportsllc-beinxtra-localnow-kcy6r.amagi.tv/playlist.m3u8
#EXTINF:-1 ,BEIN 4 MAX FHD
http://1.la5liga.store:80/play/oOuLyOr0l4zfSQqe-48swyrUC_d5JG7Wj1gX3MfuOaE4OM3tuyzL533bO9nJYOIc
#EXTINF:-1 ,CIGNAL TV
https://qp-pldt-live-bpk-ucd-prod.akamaized.net/bpk-tv/ch299/default/index.mpd
#EXTINF:-1 ,Zee Bangla Sonar
http://str2.v3v3v.xyz:2082/live/rokhsi25_951396/POm6KqnW/277428.ts
#EXTINF:-1 ,World Cup 2026
https://sm-monirul.top/toffee/play/bdvsnz26.m3u8
#EXTINF:-1 ,TOFFEE Sports VIP
https://sm-monirul.top/toffee/play/sports_highlights.m3u8
#EXTINF:-1 ,TOFFEE Movies VIP
https://sm-monirul.top/toffee/play/toffee_movie.m3u8
#EXTINF:-1 ,TOFFEE Dramas VIP
https://sm-monirul.top/toffee/play/toffee_drama.m3u8
#EXTINF:-1 ,CNN VIP
https://sm-monirul.top/toffee/play/cnn.m3u8
#EXTINF:-1 ,Somoy TV
https://sm-monirul.top/toffee/play/somoy_tv.m3u8
#EXTINF:-1 ,Jamuna TV
https://sm-monirul.top/toffee/play/jamuna_tv.m3u8
#EXTINF:-1 ,ATN News
https://sm-monirul.top/toffee/play/atn_news.m3u8
#EXTINF:-1 ,ATN Bangla
https://sm-monirul.top/toffee/play/atn_bangla.m3u8
#EXTINF:-1 ,Ananda TV
https://sm-monirul.top/toffee/play/anandatv.m3u8
#EXTINF:-1 ,Bijoy TV
https://sm-monirul.top/toffee/play/bijoytv.m3u8
#EXTINF:-1 ,NTV
https://sm-monirul.top/toffee/play/n_tv.m3u8
#EXTINF:-1 ,Global TV
https://sm-monirul.top/toffee/play/global_tv.m3u8
#EXTINF:-1 ,Channel S
https://sm-monirul.top/toffee/play/channel_s.m3u8
#EXTINF:-1 ,Rajdhani TV
https://sm-monirul.top/toffee/play/rajdhani_tv.m3u8
#EXTINF:-1 ,Bangla TV
https://sm-monirul.top/toffee/play/bangla_tv.m3u8
#EXTINF:-1 ,Asian TV
https://sm-monirul.top/toffee/play/asian_tv.m3u8
#EXTINF:-1 ,Channel i
https://sm-monirul.top/toffee/play/channel_i.m3u8
#EXTINF:-1 ,Movie Bangla
https://sm-monirul.top/toffee/play/movie_bangla.m3u8
#EXTINF:-1 ,Nexus TV
https://sm-monirul.top/toffee/play/nexus_tv.m3u8
#EXTINF:-1 ,Islamic TV
https://sm-monirul.top/toffee/play/islamic_tv.m3u8
#EXTINF:-1 ,Desh TV
https://sm-monirul.top/toffee/play/desh_tv.m3u8
#EXTINF:-1 ,Independent TV
https://sm-monirul.top/toffee/play/independent_tv.m3u8
#EXTINF:-1 ,Ekhon TV
https://sm-monirul.top/toffee/play/ekhon_tv.m3u8
#EXTINF:-1 ,Ekattor TV
https://sm-monirul.top/toffee/play/ekattor_tv.m3u8
#EXTINF:-1 ,Euro Sport HD
https://sm-monirul.top/toffee/play/euro_sports_hd.m3u8
#EXTINF:-1 ,ICC Test Championship Highlights
https://sm-monirul.top/toffee/play/icc_wtc_final.m3u8
#EXTINF:-1 ,SONY SPORTS TEN 1 HD
https://sm-monirul.top/toffee/play/sony_sports_1_hd.m3u8
#EXTINF:-1 ,SONY SPORTS TEN 2 HD
https://sm-monirul.top/toffee/play/sony_sports_2_hd.m3u8
#EXTINF:-1 ,SONY SPORTS TEN 5 HD
https://sm-monirul.top/toffee/play/sony_sports_5_hd.m3u8
#EXTINF:-1 ,SONY TEN Cricket
https://sm-monirul.top/toffee/play/ten_cricket.m3u8
#EXTINF:-1 ,Cartoon Network HD
https://sm-monirul.top/toffee/play/cartoon_network_hd.m3u8
#EXTINF:-1 ,Cartoon Network
https://sm-monirul.top/toffee/play/cartoon_network_sd.m3u8
#EXTINF:-1 ,Pogo
https://sm-monirul.top/toffee/play/pogo_sd.m3u8
#EXTINF:-1 ,Discovery Kids
https://sm-monirul.top/toffee/play/discovery_kids.m3u8
#EXTINF:-1 ,SONY YAY VIP
https://sm-monirul.top/toffee/play/sonyyay.m3u8
#EXTINF:-1 ,Zee Bangla VIP
https://sm-monirul.top/toffee/play/zee_bangla.m3u8
#EXTINF:-1 ,Zee Anmol
https://sm-monirul.top/toffee/play/zee_anmol.m3u8
#EXTINF:-1 ,Zing
https://sm-monirul.top/toffee/play/zing_sd.m3u8
#EXTINF:-1 ,Hum TV
https://sm-monirul.top/toffee/play/hum_tv.m3u8
#EXTINF:-1 ,Hum Masala
https://sm-monirul.top/toffee/play/hum_masala.m3u8
#EXTINF:-1 ,Hum Sitarey
https://sm-monirul.top/toffee/play/hum_sitaray.m3u8
#EXTINF:-1 ,Sony Aat VIP
https://sm-monirul.top/toffee/play/sonyaath.m3u8
#EXTINF:-1 ,SONY ENTERTAINMENT TELEVISION HD VIP
https://sm-monirul.top/toffee/play/sonyentertainmnt_hd.m3u8
#EXTINF:-1 ,SONY ENTERTAINMENT TELEVISION
https://sm-monirul.top/toffee/play/sony_entertainment.m3u8
#EXTINF:-1 ,B4U Music VIP
https://sm-monirul.top/toffee/play/b4u_music.m3u8
#EXTINF:-1 ,SONY SAB HD VIP
https://sm-monirul.top/toffee/play/sonysab_hd.m3u8
#EXTINF:-1 ,Zee TV HD
https://sm-monirul.top/toffee/play/zee_tv_hd.m3u8
#EXTINF:-1 ,SONY MAX HD VIP
https://sm-monirul.top/toffee/play/sony_max_hd.m3u8
#EXTINF:-1 ,Zee Bangla Cinema
https://sm-monirul.top/toffee/play/zee_bangla_cinema.m3u8
#EXTINF:-1 ,Zee Bollywood
https://sm-monirul.top/toffee/play/zee_bollywood.m3u8
#EXTINF:-1 ,Zee Action
https://sm-monirul.top/toffee/play/zee_action.m3u8
#EXTINF:-1 ,SONY MAX VIP
https://sm-monirul.top/toffee/play/sony_max.m3u8
#EXTINF:-1 ,SONY PIX HD VIP
https://sm-monirul.top/toffee/play/sonypix_hd.m3u8
#EXTINF:-1 ,Zee Cafe
https://sm-monirul.top/toffee/play/zee_cafe_hd.m3u8
#EXTINF:-1 ,B4U Movies VIP
https://sm-monirul.top/toffee/play/b4u_movies.m3u8
#EXTINF:-1 ,SONY MAX 2 VIP
https://sm-monirul.top/toffee/play/sonymax_2.m3u8
#EXTINF:-1 ,Zee Cinema HD
https://sm-monirul.top/toffee/play/zee_cinema_hd.m3u8
#EXTINF:-1 ,TLC HD
https://sm-monirul.top/toffee/play/tlc_hd.m3u8
#EXTINF:-1 ,TLC
https://sm-monirul.top/toffee/play/tlc_sd.m3u8
#EXTINF:-1 ,Animal Planet
https://sm-monirul.top/toffee/play/animal_planet_sd.m3u8
#EXTINF:-1 ,Animal Planet HD
https://sm-monirul.top/toffee/play/animal_planet_hd.m3u8
#EXTINF:-1 ,SONY BBC EARTH HD VIP
https://sm-monirul.top/toffee/play/sonybbc_earth_hd.m3u8
#EXTINF:-1 ,Discovery HD
https://sm-monirul.top/toffee/play/discovery_hd.m3u8
#EXTINF:-1 ,Discovery
https://sm-monirul.top/toffee/play/discovery_sd.m3u8
#EXTINF:-1 ,Discovery Science
https://sm-monirul.top/toffee/play/discovery_science.m3u8
#EXTINF:-1 ,Discovery Turbo
https://sm-monirul.top/toffee/play/discovery_turbo.m3u8
#EXTINF:-1 ,Investigation Discovery HD
https://sm-monirul.top/toffee/play/discovary_investigation_hd.m3u8
#EXTINF:-1 ,&TV HD
https://sm-monirul.top/toffee/play/and_tv_hd.m3u8
#EXTINF:-1 ,& Pictures HD
https://sm-monirul.top/toffee/play/andpicture_hd.m3u8
#EXTINF:-1 ,0. Toon Goggles
https://d1eg24xrsfr6kv.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-b4b1bzxkt1uzo-prod/tg/tg/tg.m3u8`;

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
    document.getElementById("srv6btn").classList.toggle("active", key === "Server 6");
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

    parseM3U(BDIX_M3U_RAW, "Server 5");

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
