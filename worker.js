export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // API Routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    // Serve Static Assets (HTML, CSS, JS)
    try {
      // For Cloudflare Workers with Assets, we can fetch the asset directly
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  },
};

async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  
  // Example API endpoint to test D1 connection
  if (url.pathname === '/api/test-db') {
    try {
      const { results } = await env.DB.prepare("SELECT * FROM users LIMIT 1").all();
      return new Response(JSON.stringify({ success: true, data: results }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'API route not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
