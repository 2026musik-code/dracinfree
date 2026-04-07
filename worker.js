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

    // --- USER API ---
    if (url.pathname === '/api/user/update-key' && method === 'POST') {
      try {
        const { email, newKey } = await request.json();
        
        const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (!user) {
          return new Response(JSON.stringify({ error: 'User tidak ditemukan' }), { status: 404 });
        }

        await env.DB.prepare("UPDATE api_keys SET api_key = ? WHERE user_id = ?").bind(newKey, user.id).run();
        
        return new Response(JSON.stringify({ success: true }));
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // --- ADMIN API ---
    if (url.pathname.startsWith('/api/admin/')) {
      // GET Pending Users
      if (url.pathname === '/api/admin/pending' && method === 'GET') {
        const { results } = await env.DB.prepare("SELECT id, name, email, created_at as date FROM users WHERE status = 'pending'").all();
        return new Response(JSON.stringify(results));
      }
      
      // GET Active Users
      if (url.pathname === '/api/admin/active' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT u.id, u.name, u.email, a.api_key as key, a.daily_limit as limit_count 
          FROM users u 
          JOIN api_keys a ON u.id = a.user_id 
          WHERE u.status = 'active' AND u.role = 'user'
        `).all();
        return new Response(JSON.stringify(results));
      }

      // POST Approve User
      if (url.pathname === '/api/admin/approve' && method === 'POST') {
        const { userId } = await request.json();
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let apiKey = 'melolo_key_';
        for (let i = 0; i < 12; i++) apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
        
        await env.DB.prepare("UPDATE users SET status = 'active' WHERE id = ?").bind(userId).run();
        await env.DB.prepare("INSERT INTO api_keys (user_id, api_key, daily_limit) VALUES (?, ?, 100)").bind(userId, apiKey).run();
        return new Response(JSON.stringify({ success: true }));
      }

      // POST Reject/Delete Pending User
      if (url.pathname === '/api/admin/reject' && method === 'POST') {
        const { userId } = await request.json();
        await env.DB.prepare("DELETE FROM users WHERE id = ? AND status = 'pending'").bind(userId).run();
        return new Response(JSON.stringify({ success: true }));
      }

      // POST Delete Active User
      if (url.pathname === '/api/admin/delete' && method === 'POST') {
        const { userId } = await request.json();
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
        await env.DB.prepare("DELETE FROM api_keys WHERE user_id = ?").bind(userId).run();
        return new Response(JSON.stringify({ success: true }));
      }

      // POST Update Limit
      if (url.pathname === '/api/admin/limit' && method === 'POST') {
        const { userId, limit } = await request.json();
        await env.DB.prepare("UPDATE api_keys SET daily_limit = ? WHERE user_id = ?").bind(limit, userId).run();
        return new Response(JSON.stringify({ success: true }));
      }

      // POST Change Password
      if (url.pathname === '/api/admin/password' && method === 'POST') {
        const { oldPassword, newPassword } = await request.json();
        const admin = await env.DB.prepare("SELECT * FROM users WHERE role = 'admin' AND password = ?").bind(oldPassword).first();
        if (!admin) return new Response(JSON.stringify({ error: 'Sandi saat ini salah' }), { status: 400 });
        
        await env.DB.prepare("UPDATE users SET password = ? WHERE id = ?").bind(newPassword, admin.id).run();
        return new Response(JSON.stringify({ success: true }));
      }
    }

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ error: 'API route not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
