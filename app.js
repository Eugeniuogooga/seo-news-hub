// ---------- CONFIG ----------
const FEED_URL = './data/news.json';
// const ASK_AI_URL = 'https://your-worker.workers.dev/api/ask-ai'; // optional
const ASK_AI_URL = '';

// Map hostnames to groups for filtering
const GROUPS = {
  google: [
    'developers.google.com',
    'status.search.google.com',
    'google.com' // podcast page is on developers.google.com/google.com
  ],
  news: [
    'searchengineland.com',
    'searchenginejournal.com',
    'seroundtable.com',
    'ahrefs.com',
    'moz.com',
    'semrush.com',
    'sistrix.com'
  ],
  experts: [
    'mariehaynes.com',
    'brodieclark.com',
    'amsive.com',
    'gsqi.com',
    'sparktoro.com'
  ],
  volatility: [
    'semrush.com', // /sensor
    'algoroo.com'
  ]
};
// ---------- /CONFIG ----------

let ALL_ITEMS = [];

function host(href) {
  try { return new URL(href).hostname.replace(/^www\./,''); } catch { return ''; }
}

function inGroup(item, group) {
  if (group === 'all') return true;
  const h = host(item.url);
  return (GROUPS[group] || []).some(dom => h.endsWith(dom));
}

function clearActive() {
  document.querySelectorAll('#filters .pill').forEach(b => b.classList.remove('active'));
}

function setActive(group) {
  clearActive();
  const btn = document.querySelector(`#filters .pill[data-group="${group}"]`);
  if (btn) btn.classList.add('active');
}

function render(items, group='all') {
  const feed = document.querySelector('#feed');
  const tpl = document.querySelector('#news-item');
  feed.innerHTML = '';

  const view = items.filter(it => inGroup(it, group));
  for (const it of view) {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.src').textContent = it.source || host(it.url);
    const ts = it.published || new Date().toISOString();
    node.querySelector('.ts').textContent = new Date(ts).toLocaleString();
    node.querySelector('.title').textContent = it.title;
    node.querySelector('.sum').textContent = it.ai_summary || it.summary || '';
    node.querySelector('.read').href = it.url;

    const askBtn = node.querySelector('.ask');
    askBtn.addEventListener('click', () => askAI(it));
    if (!ASK_AI_URL) askBtn.disabled = true;

    feed.appendChild(node);
  }

  // empty state
  if (!view.length) {
    const div = document.createElement('div');
    div.style.color = '#9fb4d0';
    div.textContent = 'No items for this filter yet.';
    feed.appendChild(div);
  }
}

async function askAI(item) {
  if (!ASK_AI_URL) { alert('Ask AI is not configured yet.'); return; }
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

async function load() {
  const res = await fetch(FEED_URL + '?_=' + Date.now());
  const data = await res.json();
  document.querySelector('#lastUpdated').textContent =
  'Last updated: ' + new Date(data.generated_at || Date.now()).toLocaleString();
  ALL_ITEMS = data.items || [];
  render(ALL_ITEMS, 'all');

  // hook up filter buttons
  document.querySelectorAll('#filters .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-group');
      setActive(group);
      render(ALL_ITEMS, group);
    });
  });
}
load();

