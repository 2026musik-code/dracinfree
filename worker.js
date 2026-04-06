export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // API Routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    // Serve Static Assets (HTML, CSS, JS)
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  },
};

async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const method = request.method;

  try {
    // --- REGISTER API ---
    if (url.pathname === '/api/register' && method === 'POST') {
      const { name, email, password } = await request.json();
      
      // Cek apakah email sudah ada
      const existing = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      if (existing) {
        return new Response(JSON.stringify({ error: 'Email sudah terdaftar' }), { status: 400 });
      }
      
      // Insert user baru dengan status 'pending'
      await env.DB.prepare("INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, 'pending')")
        .bind(name, email, password).run();
        
      return new Response(JSON.stringify({ success: true }));
    }

    // --- LOGIN API ---
    if (url.pathname === '/api/login' && method === 'POST') {
      const { email, password } = await request.json();
      
      // Cari user berdasarkan email dan password
      const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?").bind(email, password).first();
      
      if (!user) {
        return new Response(JSON.stringify({ error: 'Email atau kata sandi salah' }), { status: 401 });
      }

      // Jika Super Admin, langsung lolos
      if (user.role === 'admin') {
         return new Response(JSON.stringify({ success: true, role: 'admin', user: { name: user.name, email: user.email } }));
      }

      // CEK STATUS PERSETUJUAN ADMIN
      if (user.status === 'pending') {
        return new Response(JSON.stringify({ error: 'Akun Anda masih menunggu persetujuan Admin. Harap bersabar.' }), { status: 403 });
      }

      if (user.status === 'rejected') {
        return new Response(JSON.stringify({ error: 'Maaf, pendaftaran akun Anda ditolak oleh Admin.' }), { status: 403 });
      }

      // Jika status 'active', ambil data API Key-nya
      const apiKeyRecord = await env.DB.prepare("SELECT api_key, daily_limit, usage_count FROM api_keys WHERE user_id = ?").bind(user.id).first();
      
      return new Response(JSON.stringify({ 
        success: true, 
        role: 'user',
        user: { name: user.name, email: user.email },
        apiKey: apiKeyRecord ? apiKeyRecord.api_key : null,
        limit: apiKeyRecord ? apiKeyRecord.daily_limit : 0,
        usage: apiKeyRecord ? apiKeyRecord.usage_count : 0
      }));
    }

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ error: 'API route not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
