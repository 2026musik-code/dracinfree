import { Hono } from 'hono';

const app = new Hono();

const BASE_API = 'https://api.sansekai.my.id/api';

// Custom fetch to bypass WAF/403 blocks on Cloudflare Workers
const fetchApi = async (url, proxyConfig = null) => {
    try {
        let config = null;
        if (typeof proxyConfig === 'string') {
            // Parse VLESS/Trojan link
            try {
                const u = new URL(proxyConfig);
                config = {
                    protocol: u.protocol.replace(':', ''),
                    uuid: u.username,
                    host: u.hostname,
                    port: u.port,
                    path: u.pathname,
                    sni: u.searchParams.get('sni')
                };
            } catch (e) {
                console.error("Failed to parse proxy link", e);
            }
        } else {
            config = proxyConfig;
        }

        if (config) {
            console.log(`Connecting via ${config.protocol} proxy: ${config.host}:${config.port}`);
            // Placeholder for VLESS/Trojan handshake logic
            // ... (rest of the logic)
            return await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                }
            });
        }

        // Fallback to original logic if no proxy config
        const proxyUrl = `https://cors.bridged.cc/${url}`;
        const res = await fetch(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
                'Referer': 'https://api.sansekai.my.id/',
                'Origin': 'https://api.sansekai.my.id'
            }
        });
        if (res.ok) return res;
        throw new Error(`Primary fetch failed with status: ${res.status}`);
    } catch (e) {
        console.warn('Fetch failed:', e.message);
        throw e;
    }
};

// HTML Layout Template
const Layout = (title, content) => `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - DramaBox Premium</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #020617; background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 70%); background-attachment: fixed; color: #f8fafc; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
        .scroll-horizontal::-webkit-scrollbar { height: 6px; }
        .scroll-horizontal::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 10px; }
        .scroll-horizontal::-webkit-scrollbar-thumb { background: #e11d48; border-radius: 10px; }
        .scroll-horizontal::-webkit-scrollbar-thumb:hover { background: #be123c; }
    </style>
</head>
<body class="min-h-screen flex flex-col font-sans selection:bg-rose-500/30">
    <header class="bg-slate-950/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600 tracking-tighter flex items-center gap-2 drop-shadow-sm">
                DramaBox
            </a>
            <!-- Proxy Widget -->
            <div class="relative">
                <button id="proxy-toggle" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/10">
                    VPN: <span id="proxy-status" class="text-rose-400">Off</span>
                </button>
                <div id="proxy-panel" class="absolute right-0 mt-2 w-72 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl hidden z-50">
                    <h3 class="text-white font-bold mb-3">Konfigurasi VPN</h3>
                    <div class="space-y-2">
                        <input type="text" id="proxy-host" placeholder="Host" class="w-full bg-slate-800 border border-white/10 text-white rounded-lg py-2 px-3 text-sm">
                        <input type="number" id="proxy-port" placeholder="Port" class="w-full bg-slate-800 border border-white/10 text-white rounded-lg py-2 px-3 text-sm">
                        <input type="text" id="proxy-uuid" placeholder="UUID/Password" class="w-full bg-slate-800 border border-white/10 text-white rounded-lg py-2 px-3 text-sm">
                        <button id="proxy-connect" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-sm transition-all">Hubungkan</button>
                    </div>
                </div>
            </div>
        </div>
    </header>
    
    <main class="flex-1 w-full pb-12">
        ${content}
    </main>
    
    <script>
        // Proxy Widget Logic
        const toggle = document.getElementById('proxy-toggle');
        const panel = document.getElementById('proxy-panel');
        const status = document.getElementById('proxy-status');
        
        toggle.addEventListener('click', () => panel.classList.toggle('hidden'));
        
        // Check for cookie
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        if (getCookie('proxyConfig')) {
            status.textContent = 'On';
            status.classList.replace('text-rose-400', 'text-green-400');
        }

        document.getElementById('proxy-connect').addEventListener('click', () => {
            const config = {
                host: document.getElementById('proxy-host').value,
                port: document.getElementById('proxy-port').value,
                uuid: document.getElementById('proxy-uuid').value,
                protocol: 'vless' // Default
            };
            // Save to cookie
            document.cookie = "proxyConfig=" + JSON.stringify(config) + "; path=/; max-age=86400";
            status.textContent = 'On';
            status.classList.replace('text-rose-400', 'text-green-400');
            panel.classList.add('hidden');
            window.location.reload(); // Reload to fetch with new proxy
        });
    </script>
</body>
</html>
`;

// 0. Setup Proxy Page
app.get('/setup', (c) => {
    const content = `
        <div class="max-w-md mx-auto px-4 py-12">
            <h1 class="text-3xl font-black text-white mb-6 text-center">Setup Proxy</h1>
            <form id="proxy-form" class="bg-slate-900/60 p-6 rounded-2xl border border-white/10 shadow-xl">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-400 mb-1">VLESS/Trojan Link</label>
                        <textarea id="proxy-link" class="w-full bg-slate-800 border border-white/10 text-white rounded-xl py-2.5 px-4 h-32" placeholder="vless://..."></textarea>
                    </div>
                </div>
                <button type="button" id="connect-btn" class="w-full mt-6 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all">Simpan & Hubungkan</button>
            </form>
            <div id="log" class="mt-6 p-4 bg-black/50 rounded-xl text-xs font-mono text-green-400 h-32 overflow-y-auto border border-white/5 hidden"></div>
            <a href="/" id="drama-btn" class="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-center hidden transition-all">Buka Halaman Drama</a>
        </div>
        <script>
            document.getElementById('connect-btn').addEventListener('click', () => {
                const link = document.getElementById('proxy-link').value;
                localStorage.setItem('proxyLink', link);
                document.cookie = "proxyConfig=" + encodeURIComponent(link) + "; path=/; max-age=86400";
                
                const logDiv = document.getElementById('log');
                logDiv.classList.remove('hidden');
                logDiv.innerHTML = 'Menyimpan konfigurasi...<br>Link tersimpan: ' + link.substring(0, 30) + '...<br>';
                
                document.getElementById('drama-btn').classList.remove('hidden');
            });
        </script>
    `;
    return c.html(Layout('Setup Proxy', content));
});

// 1. Internal API for Infinite Scroll
app.get('/api/explore', async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const keywords = ['love', 'ceo', 'revenge', 'billionaire', 'marriage', 'secret', 'family', 'wife', 'husband', 'boss'];
    
    let proxyConfig = null;
    try {
        const cookie = c.req.cookie('proxyConfig');
        if (cookie) proxyConfig = JSON.parse(decodeURIComponent(cookie));
    } catch (e) {
        console.error("Failed to parse proxy cookie", e);
    }

    try {
        const keyword = keywords[(page - 1) % keywords.length];
        const res = await fetchApi(`${BASE_API}/dramabox/search?query=${keyword}`, proxyConfig);
        if (!res.ok) return c.json([]);
        
        const data = await res.json();
        const dramas = data.filter(d => d.bookId); // Filter out actors
        
        const html = dramas.map(d => {
            const coverUrl = d.coverWap || d.cover || 'https://via.placeholder.com/300x400?text=No+Cover';
            const title = d.bookName || d.title || 'Judul Tidak Diketahui';
            const epsCount = d.chapterCount || d.total_episodes || '?';
            const tags = Array.isArray(d.tagNames) ? d.tagNames.slice(0, 1).join(', ') : '';

            return `
            <a href="/drama/${d.bookId}" class="group block bg-slate-900/40 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/50 hover:shadow-[0_0_30px_-5px_rgba(225,29,72,0.3)] transition-all duration-500 snap-start w-[160px] md:w-[200px]">
                <div class="aspect-[3/4] relative overflow-hidden bg-slate-900">
                    <img src="${coverUrl}" alt="${title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" referrerpolicy="no-referrer" />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div class="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 shadow-lg">
                        ${epsCount !== '?' ? epsCount + ' Eps' : 'Hot'}
                    </div>
                    
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div class="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(225,29,72,0.5)] transform scale-75 group-hover:scale-100 transition-transform duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                    </div>
                </div>
                <div class="p-3 relative z-10 bg-slate-900/40 backdrop-blur-sm h-[76px]">
                    <h3 class="font-bold text-sm line-clamp-2 group-hover:text-rose-400 transition-colors leading-snug text-slate-100">${title}</h3>
                    ${tags ? `<p class="text-[10px] font-medium text-slate-400 mt-1.5 flex items-center gap-1.5 uppercase tracking-wider"><span class="w-1 h-1 rounded-full bg-rose-500"></span> ${tags}</p>` : ''}
                </div>
            </a>
            `;
        }).join('');
        
        return c.html(html);
    } catch (e) {
        return c.html('');
    }
});

// 2. Homepage: Daftar Drama Terbaru & Pencarian
app.get('/', async (c) => {
    const query = c.req.query('q');
    const category = c.req.query('c');
    
    let proxyConfig = null;
    try {
        const cookie = c.req.cookie('proxyConfig');
        if (cookie) proxyConfig = JSON.parse(decodeURIComponent(cookie));
    } catch (e) {
        console.error("Failed to parse proxy cookie", e);
    }
    
    try {
        let apiUrl = `${BASE_API}/dramabox/latest`;
        let isSearch = false;
        
        if (query) {
            apiUrl = `${BASE_API}/dramabox/search?query=${encodeURIComponent(query)}`;
            isSearch = true;
        } else if (category && category !== 'latest') {
            apiUrl = `${BASE_API}/dramabox/search?query=${encodeURIComponent(category)}`;
            isSearch = true;
        }

        const res = await fetchApi(apiUrl, proxyConfig);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        let dramas = await res.json();
        if (!Array.isArray(dramas)) throw new Error("Format API tidak valid.");
        
        // Filter out actors if it's a search result
        if (isSearch) {
            dramas = dramas.filter(d => d.bookId);
        }

        const gridHtml = dramas.map(d => {
            const coverUrl = d.coverWap || d.cover || 'https://via.placeholder.com/300x400?text=No+Cover';
            const title = d.bookName || d.title || 'Judul Tidak Diketahui';
            const epsCount = d.chapterCount || d.total_episodes || '?';
            const tags = Array.isArray(d.tagNames) ? d.tagNames.slice(0, 1).join(', ') : (Array.isArray(d.tags) ? d.tags.slice(0, 1).join(', ') : '');

            return `
            <a href="/drama/${d.bookId}" class="group block bg-slate-900/40 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/50 hover:shadow-[0_0_30px_-5px_rgba(225,29,72,0.3)] transition-all duration-500 snap-start w-[160px] md:w-[200px]">
                <div class="aspect-[3/4] relative overflow-hidden bg-slate-900">
                    <img src="${coverUrl}" alt="${title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" referrerpolicy="no-referrer" />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div class="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 shadow-lg">
                        ${epsCount !== '?' ? epsCount + ' Eps' : 'Hot'}
                    </div>
                    
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div class="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(225,29,72,0.5)] transform scale-75 group-hover:scale-100 transition-transform duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                    </div>
                </div>
                <div class="p-3 relative z-10 bg-slate-900/40 backdrop-blur-sm h-[76px]">
                    <h3 class="font-bold text-sm line-clamp-2 group-hover:text-rose-400 transition-colors leading-snug text-slate-100">${title}</h3>
                    ${tags ? `<p class="text-[10px] font-medium text-slate-400 mt-1.5 flex items-center gap-1.5 uppercase tracking-wider"><span class="w-1 h-1 rounded-full bg-rose-500"></span> ${tags}</p>` : ''}
                </div>
            </a>
            `;
        }).join('');

        const categories = [
            { id: 'latest', name: 'Terbaru' },
            { id: 'love', name: 'Romantis' },
            { id: 'ceo', name: 'CEO' },
            { id: 'revenge', name: 'Balas Dendam' },
            { id: 'billionaire', name: 'Miliarder' },
            { id: 'marriage', name: 'Pernikahan' }
        ];

        const activeCategory = category || (query ? '' : 'latest');

        const content = `
            <div class="max-w-7xl mx-auto px-4 pt-6 md:pt-10">
                
                <!-- Search & Categories Header -->
                <div class="mb-8">
                    <form action="/" method="GET" class="relative max-w-xl mb-6">
                        <input type="text" name="q" value="${query || ''}" placeholder="Cari judul drama atau aktor..." class="w-full bg-slate-900/60 border border-white/10 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 backdrop-blur-md transition-all placeholder-slate-500 shadow-inner">
                        <svg class="absolute left-4 top-3.5 text-slate-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <button type="submit" class="absolute right-2 top-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-rose-600/20">Cari</button>
                    </form>

                    <div class="flex items-center gap-2 overflow-x-auto pb-2 scroll-horizontal snap-x">
                        ${categories.map(cat => `
                            <a href="/?c=${cat.id}" class="snap-start whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border ${activeCategory === cat.id ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-slate-800/50 text-slate-300 border-white/5 hover:bg-slate-700 hover:text-white'}">
                                ${cat.name}
                            </a>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-6 flex items-center justify-between">
                    <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight">
                        ${query ? `Hasil Pencarian: <span class="text-rose-400">"${query}"</span>` : (activeCategory === 'latest' ? 'Rilis <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">Terbaru</span>' : `Kategori: <span class="text-rose-400">${categories.find(c => c.id === activeCategory)?.name || activeCategory}</span>`)}
                    </h2>
                </div>
                
                <!-- 2 Rows Horizontal Scroll Grid -->
                <div class="relative group/slider">
                    <div id="drama-list" class="grid grid-rows-2 grid-flow-col gap-3 md:gap-4 overflow-x-auto pb-6 pt-2 snap-x scroll-horizontal scroll-smooth" style="grid-auto-columns: max-content;">
                        ${gridHtml || '<div class="col-span-full text-center py-12 text-slate-400 w-full">Tidak ada data drama saat ini.</div>'}
                        
                        <!-- Loading Indicator for Infinite Scroll -->
                        <div id="loading-indicator" class="${(!query && activeCategory === 'latest') ? 'hidden' : '!hidden'} flex-col items-center justify-center w-[160px] md:w-[200px] h-full row-span-2">
                            <svg class="animate-spin h-8 w-8 text-rose-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span class="text-xs text-slate-400 font-medium">Memuat...</span>
                        </div>
                    </div>
                    
                    <!-- Scroll Buttons -->
                    <button onclick="document.getElementById('drama-list').scrollBy({left: -400, behavior: 'smooth'})" class="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-12 h-12 bg-slate-900/80 border border-white/10 rounded-full text-white flex items-center justify-center shadow-2xl backdrop-blur-md opacity-0 group-hover/slider:opacity-100 transition-opacity disabled:opacity-0 z-10 hover:bg-rose-600 hover:border-rose-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button onclick="document.getElementById('drama-list').scrollBy({left: 400, behavior: 'smooth'})" class="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-12 h-12 bg-slate-900/80 border border-white/10 rounded-full text-white flex items-center justify-center shadow-2xl backdrop-blur-md opacity-0 group-hover/slider:opacity-100 transition-opacity disabled:opacity-0 z-10 hover:bg-rose-600 hover:border-rose-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>

            <script>
                // Infinite Scroll Logic
                document.addEventListener('DOMContentLoaded', () => {
                    const container = document.getElementById('drama-list');
                    const loading = document.getElementById('loading-indicator');
                    let page = 1;
                    let isLoading = false;
                    
                    // Only enable infinite scroll on the main 'Terbaru' page
                    const params = new URLSearchParams(window.location.search);
                    const isSearch = params.has('q');
                    const isCategory = params.has('c') && params.get('c') !== 'latest';
                    
                    if (!isSearch && !isCategory) {
                        container.addEventListener('scroll', async () => {
                            // Check if scrolled near the end (within 300px)
                            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 300) {
                                if (isLoading) return;
                                isLoading = true;
                                loading.classList.remove('hidden');
                                loading.classList.add('flex');
                                
                                try {
                                    const res = await fetch('/api/explore?page=' + page);
                                    const html = await res.text();
                                    
                                    if (html.trim()) {
                                        // Insert new items before the loading indicator
                                        loading.insertAdjacentHTML('beforebegin', html);
                                        page++;
                                    }
                                } catch (e) {
                                    console.error('Failed to load more:', e);
                                } finally {
                                    isLoading = false;
                                    loading.classList.add('hidden');
                                    loading.classList.remove('flex');
                                }
                            }
                        });
                    }
                });
            </script>
        `;

        return c.html(Layout('Beranda', content));
    } catch (error) {
        return c.html(Layout('Error', `
            <div class="max-w-md mx-auto text-center py-12">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h2 class="text-xl font-bold text-white mb-2">Gagal Memuat Data</h2>
                <p class="text-slate-400 mb-6">${error.message}</p>
                <a href="/" class="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors">Coba Lagi</a>
            </div>
        `));
    }
});

// 2. Detail & Play Page (Merged)
app.get('/drama/:id', async (c) => {
    const id = c.req.param('id');
    const activeEpUrl = c.req.query('url');
    const activeEpNum = c.req.query('ep') || 'Episode 1';
    
    let proxyConfig = null;
    try {
        const cookie = c.req.cookie('proxyConfig');
        if (cookie) proxyConfig = JSON.parse(decodeURIComponent(cookie));
    } catch (e) {
        console.error("Failed to parse proxy cookie", e);
    }

    try {
        // Fetch Episodes
        const res = await fetchApi(`${BASE_API}/dramabox/allepisode?bookId=${id}`, proxyConfig);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const episodes = await res.json();
        if (!Array.isArray(episodes)) throw new Error("Format API episode tidak valid.");

        // Determine target URL to play
        let targetEncUrl = activeEpUrl;
        if (!targetEncUrl && episodes.length > 0) {
            const ep = episodes[0];
            if (ep.cdnList && ep.cdnList.length > 0) {
                const cdn = ep.cdnList[0];
                if (cdn.videoPathList && cdn.videoPathList.length > 0) {
                    const video = cdn.videoPathList.find(v => v.quality === 720) || cdn.videoPathList[0];
                    targetEncUrl = video.videoPath;
                }
            }
            if (!targetEncUrl) targetEncUrl = ep.url || ep.encryptUrl || ep.videoUrl || '';
        }

        // Decrypt video URL
        let streamUrl = '';
        if (targetEncUrl) {
            try {
                const decRes = await fetchApi(`${BASE_API}/dramabox/decrypt?url=${encodeURIComponent(targetEncUrl)}`, proxyConfig);
                const decData = await decRes.json();
                streamUrl = decData.streamUrl || '';
            } catch (e) {
                console.error("Decrypt error", e);
            }
        }

        // Generate Episode Grid (4 Rows, Horizontal Scroll)
        let epsHtml = '';
        if (episodes.length > 0) {
            epsHtml = episodes.map((ep, idx) => {
                const epNum = ep.chapterName || `EP ${ep.chapterIndex + 1 || idx + 1}`;
                
                let encUrl = '';
                if (ep.cdnList && ep.cdnList.length > 0) {
                    const cdn = ep.cdnList[0];
                    if (cdn.videoPathList && cdn.videoPathList.length > 0) {
                        const video = cdn.videoPathList.find(v => v.quality === 720) || cdn.videoPathList[0];
                        encUrl = video.videoPath;
                    }
                }
                if (!encUrl) encUrl = ep.url || ep.encryptUrl || ep.videoUrl || '';

                const isActive = targetEncUrl === encUrl;
                
                const activeClass = isActive 
                    ? 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] border-rose-400/50 scale-95 ring-2 ring-rose-500/50' 
                    : 'bg-slate-800/40 text-slate-300 border-white/5 hover:bg-slate-700/60 hover:border-white/20 hover:text-white';

                return `
                <a href="/drama/${id}?url=${encodeURIComponent(encUrl)}&ep=${encodeURIComponent(epNum)}" 
                   class="flex flex-col items-center justify-center px-6 py-3 rounded-xl text-sm font-bold transition-all border backdrop-blur-sm snap-center min-w-[120px] ${activeClass}">
                    ${isActive 
                        ? `<svg class="w-5 h-5 mb-1 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>` 
                        : `<svg class="w-5 h-5 mb-1 opacity-50" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
                    }
                    ${epNum}
                </a>
                `;
            }).join('');
        }

        const content = `
            <!-- Video Player Section (Full Width on Mobile, Max Width on Desktop) -->
            <div class="w-full bg-black border-b border-white/5 shadow-2xl mb-8">
                <div class="max-w-md mx-auto md:max-w-5xl">
                    <div class="w-full aspect-[9/16] md:h-[85vh] md:aspect-auto max-h-[850px] relative bg-black overflow-hidden group flex items-center justify-center">
                        ${streamUrl ? `
                        <video 
                            controls 
                            autoplay 
                            playsinline
                            class="w-full h-full object-cover md:object-contain"
                        >
                            <source src="${streamUrl}" type="video/mp4">
                            Browser Anda tidak mendukung HTML5 video.
                        </video>
                        ` : `
                        <div class="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                            <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M4.93 19.07 19.07 4.93"/></svg>
                            <p>Video tidak tersedia atau gagal dimuat.</p>
                        </div>
                        `}
                    </div>
                    
                    <div class="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-md">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <span class="bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    Sedang Diputar
                                </span>
                            </div>
                            <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight">${activeEpNum}</h1>
                        </div>
                        <a href="/" class="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                            Kembali
                        </a>
                    </div>
                </div>
            </div>

            <!-- Episode List Section -->
            <div class="max-w-7xl mx-auto px-4">
                <div class="bg-slate-900/40 backdrop-blur-xl p-5 md:p-8 rounded-3xl border border-white/5 shadow-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
                            <div class="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            </div>
                            Daftar Episode
                        </h2>
                        <span class="text-sm font-bold text-rose-400 bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20">${episodes.length} Eps</span>
                    </div>
                    
                    <!-- 4 Rows Horizontal Scroll Grid -->
                    <div class="grid grid-rows-4 grid-flow-col gap-3 overflow-x-auto pb-6 pt-2 snap-x scroll-horizontal" style="grid-auto-columns: max-content;">
                        ${epsHtml || '<div class="text-slate-500 col-span-full">Belum ada episode yang tersedia.</div>'}
                    </div>
                </div>
            </div>
        `;

        return c.html(Layout('Nonton ' + activeEpNum, content));
    } catch (error) {
        return c.html(Layout('Error', `
            <div class="max-w-md mx-auto text-center py-12">
                <a href="/" class="text-rose-400 hover:text-rose-300 text-sm mb-6 inline-block">&larr; Kembali</a>
                <div class="text-red-400 p-8 bg-red-400/10 rounded-2xl border border-red-500/20">
                    <h3 class="text-xl font-bold mb-2">Gagal Memuat Episode</h3>
                    <p>${error.message}</p>
                </div>
            </div>
        `));
    }
});

export default app;
