// Simple client that loads the local JSON feed and renders cards.
// Works on GitHub Pages as long as data/news.json exists at the repo root.

const FEED_URL = './data/news.json';
// Optional: if you later deploy a serverless function for "Ask AI", put its URL here
// Example: const ASK_AI_URL = 'https://your-worker.workers.dev/api/ask-ai';
const ASK_AI_URL = '';

async function load() {
  const res = await fetch(FEED_URL + '?_=' + Date.now());
  const data = await res.json();
  const items = data.items || [];
  const feed = document.querySelector('#feed');
  const tpl = document.querySelector('#news-item');
  feed.innerHTML = '';

  for (const it of items) {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.src').textContent = it.source || (new URL(it.url).hostname);
    const ts = it.published || data.generated_at || new Date().toISOString();
    node.querySelector('.ts').textContent = new Date(ts).toLocaleString();
    node.querySelector('.title').textContent = it.title;
    node.querySelector('.sum').textContent = it.ai_summary || it.summary || '';
    node.querySelector('.read').href = it.url;

    const askBtn = node.querySelector('.ask');
    askBtn.addEventListener('click', () => askAI(it));
    if (!ASK_AI_URL) askBtn.disabled = true; // disabled until configured

    feed.appendChild(node);
  }
}

async function askAI(item) {
  if (!ASK_AI_URL) {
    alert('Ask AI is not configured yet.');
    return;
  }
  const dlg = document.querySelector('#aiModal');
  dlg.showModal();
  document.querySelector('#aiTitle').textContent = item.title;
  const out = document.querySelector('#aiOutput');
  out.textContent = 'Thinking…';
  try {
    const resp = await fetch(ASK_AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: item.url, title: item.title, summary: item.ai_summary || item.summary })
    });
    const data = await resp.json();
    out.textContent = data.answer || data.error || 'No response.';
  } catch (e) {
    out.textContent = 'Error calling AI endpoint.';
  }
}

load();
