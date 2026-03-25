import { Hono } from 'hono';

const app = new Hono();

const BASE_API = 'https://api.sansekai.my.id/api';

// HTML Layout Template
const Layout = (title, content) => `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - DramaBox Streaming</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #0f172a; color: #f8fafc; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        /* Custom scrollbar for a cleaner look */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
    </style>
</head>
<body class="min-h-screen flex flex-col font-sans">
    <header class="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-2xl font-bold text-rose-500 tracking-tighter flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clapperboard"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>
                DramaBox
            </a>
        </div>
    </header>
    
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        ${content}
    </main>
    
    <footer class="bg-slate-900 border-t border-slate-800 py-8 mt-auto">
        <div class="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            <p>&copy; ${new Date().getFullYear()} DramaBox Streaming.</p>
            <p class="mt-2 text-slate-500 text-xs">Ditenagai oleh Hono.js & Cloudflare Workers</p>
        </div>
    </footer>
</body>
</html>
`;

// 1. Homepage: Daftar Drama Terbaru
app.get('/', async (c) => {
    try {
        // Fetch API dari server-side untuk bypass CORS
        const res = await fetch(`${BASE_API}/dramabox/latest`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const dramas = await res.json();
        
        if (!Array.isArray(dramas)) {
            throw new Error("Format API tidak valid atau API sedang bermasalah.");
        }

        const gridHtml = dramas.map(d => {
            const coverUrl = d.coverWap || d.cover || 'https://via.placeholder.com/300x400?text=No+Cover';
            const title = d.bookName || d.title || 'Judul Tidak Diketahui';
            const epsCount = d.chapterCount || d.total_episodes || '?';
            const tags = Array.isArray(d.tags) ? d.tags.slice(0, 2).join(', ') : '';

            return `
            <a href="/drama/${d.bookId}" class="group block bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
                <div class="aspect-[3/4] relative overflow-hidden bg-slate-800">
                    <img src="${coverUrl}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" referrerpolicy="no-referrer" />
                    <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-medium text-white border border-white/10">
                        ${epsCount} Eps
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-sm line-clamp-2 group-hover:text-rose-400 transition-colors leading-snug">${title}</h3>
                    ${tags ? `<p class="text-xs text-slate-400 mt-2 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span> ${tags}</p>` : ''}
                </div>
            </a>
            `;
        }).join('');

        const content = `
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-white tracking-tight">Rilis Terbaru</h1>
                <p class="text-slate-400 mt-2">Koleksi drama pendek premium dengan subtitle Indonesia.</p>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                ${gridHtml || '<div class="col-span-full text-center py-12 text-slate-400 bg-slate-800/20 rounded-2xl border border-slate-800">Tidak ada data drama saat ini.</div>'}
            </div>
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

// 2. Detail Page: Info Drama & Daftar Episode
app.get('/drama/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const res = await fetch(`${BASE_API}/dramabox/allepisode?bookId=${id}`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const episodes = await res.json();
        
        if (!Array.isArray(episodes)) {
            throw new Error("Format API episode tidak valid.");
        }

        let epsHtml = '';
        
        if (episodes.length > 0) {
            epsHtml = episodes.map((ep, idx) => {
                const epNum = ep.chapterName || `EP ${ep.chapterIndex + 1 || idx + 1}`;
                
                // Cari URL Video (prioritaskan 720p atau yang default)
                let encUrl = '';
                if (ep.cdnList && ep.cdnList.length > 0) {
                    const cdn = ep.cdnList[0];
                    if (cdn.videoPathList && cdn.videoPathList.length > 0) {
                        const video = cdn.videoPathList.find(v => v.quality === 720) || cdn.videoPathList[0];
                        encUrl = video.videoPath;
                    }
                }

                // Jika URL tidak ditemukan di struktur di atas, coba fallback
                if (!encUrl) encUrl = ep.url || ep.encryptUrl || ep.videoUrl || '';

                return `
                <a href="/play?url=${encodeURIComponent(encUrl)}&ep=${encodeURIComponent(epNum)}&id=${id}" 
                   class="flex flex-col items-center justify-center bg-slate-800/50 hover:bg-rose-600 text-center py-4 px-2 rounded-xl text-sm font-medium transition-all border border-slate-700/50 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/20 group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2 text-slate-400 group-hover:text-white transition-colors"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                    <span class="text-slate-300 group-hover:text-white">${epNum}</span>
                </a>
                `;
            }).join('');
        }

        const content = `
            <div class="mb-8">
                <a href="/" class="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-medium mb-6 transition-colors bg-rose-500/10 px-3 py-1.5 rounded-full">
                    &larr; Kembali ke Beranda
                </a>
                <h1 class="text-3xl md:text-4xl font-bold text-white tracking-tight">Daftar Episode</h1>
                <p class="text-slate-400 mt-2">Pilih episode untuk mulai menonton.</p>
            </div>
            
            <div class="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        Semua Episode
                    </h2>
                    <span class="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">${episodes.length} Eps</span>
                </div>
                
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                    ${epsHtml || '<div class="col-span-full text-center py-8 text-slate-500">Belum ada episode yang tersedia.</div>'}
                </div>
            </div>
        `;

        return c.html(Layout('Detail Drama', content));
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

// 3. Play Page: Decrypt & Video Player
app.get('/play', async (c) => {
    const encUrl = c.req.query('url');
    const epNum = c.req.query('ep') || 'Episode';
    const id = c.req.query('id') || '';

    if (!encUrl) {
        return c.html(Layout('Error', '<div class="text-center text-red-400 p-12 bg-slate-900 rounded-2xl border border-slate-800">URL Video tidak valid atau kosong.</div>'));
    }

    try {
        // Fetch API Decrypt dari server-side
        const res = await fetch(`${BASE_API}/dramabox/decrypt?url=${encodeURIComponent(encUrl)}`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const data = await res.json();
        const streamUrl = data.streamUrl;

        if (!streamUrl) {
            throw new Error('Gagal mendekripsi video. URL stream tidak dikembalikan oleh API.');
        }

        const content = `
            <div class="max-w-5xl mx-auto">
                <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <a href="/drama/${id}" class="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-medium mb-2 transition-colors">
                            &larr; Kembali ke Daftar Episode
                        </a>
                        <h1 class="text-2xl font-bold text-white tracking-tight">${epNum}</h1>
                    </div>
                </div>
                
                <div class="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group">
                    <!-- HTML5 Video Player -->
                    <video 
                        controls 
                        autoplay 
                        playsinline
                        class="w-full h-full object-contain"
                        poster=""
                    >
                        <source src="${streamUrl}" type="video/mp4">
                        Browser Anda tidak mendukung HTML5 video.
                    </video>
                </div>
                
                <div class="mt-6 p-5 bg-slate-800/30 rounded-2xl border border-slate-700/50 flex items-start gap-4">
                    <div class="p-2 bg-slate-800 rounded-lg text-rose-400 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-slate-200 mb-1">Informasi Pemutaran</h4>
                        <p class="text-sm text-slate-400 leading-relaxed">
                            Video didekripsi secara real-time dan di-stream langsung dari CDN. Jika video buffering atau gagal diputar, silakan muat ulang (refresh) halaman ini.
                        </p>
                    </div>
                </div>
            </div>
        `;

        return c.html(Layout(epNum, content));
    } catch (error) {
        return c.html(Layout('Error', `
            <div class="max-w-2xl mx-auto text-center py-12">
                <a href="/drama/${id}" class="text-rose-400 hover:text-rose-300 text-sm mb-6 inline-block">&larr; Kembali</a>
                <div class="text-red-400 p-8 bg-red-400/10 rounded-3xl border border-red-500/20 shadow-xl">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-white">Gagal Memutar Video</h3>
                    <p class="text-slate-300">${error.message}</p>
                </div>
            </div>
        `));
    }
});

export default app;
