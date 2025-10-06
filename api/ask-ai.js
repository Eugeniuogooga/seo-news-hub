// Optional: Cloudflare Worker endpoint for Ask‑AI (enable later)
// 1) Create a Worker in Cloudflare
// 2) Set an env secret OPENAI_API_KEY or OPENROUTER_API_KEY
// 3) Deploy and set ASK_AI_URL in app.js to your Worker URL

export default {
  async fetch(req, env) {
    return new Response(JSON.stringify({ error: "Not configured yet." }), {
      headers: { "Content-Type": "application/json" }, status: 501
    });
  }
}
