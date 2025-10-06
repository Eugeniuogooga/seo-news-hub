// ---------- CONFIG ----------
const FEED_URL = './data/news.json';
// Optional Ask-AI endpoint (leave empty to keep button disabled)
// const ASK_AI_URL = 'https://your-worker.workers.dev/api/ask-ai';
const ASK_AI_URL = '';

// Source groups for filtering by button
const GROUPS = {
  google: [
    'developers.google.com',
    'status.search.google.com',
    'google.com'
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
let currentGroup = 'all';

function host(href) {
  try { return new URL(href).hostname.replace(/^www\./,''); } catch { return ''; }
}

function inGroup(item, group) {
  if (group === 'all') return true;
  const h = host(item.url);
  return (GROUPS[group] || []).some(dom => h.endsWith(dom));
}

function setActive(group) {
  document.querySelectorAll('#filters .pill').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`#filters .pill[data-group="${group}"]`);
  if (btn) btn.classList.add('active');
}

function updateSummary(visibleCount, totalCount) {
  const el = document.querySelector('#summary');
  el.textContent = `${visibleCount} items shown · ${totalCount} total`;
}

function render(items, group='all') {
  const feed = document.querySelector('#feed');
  const tpl = document.querySelector('#news-item');
  feed.innerHTML = '';

  const filtered = items.filter(it => inGroup(it, group));
  for (const it of filtered) {
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

  if (!filtered.length) {
    const div = document.createElement('div');
    div.style.color = '#9fb4d0';
    div.textContent = 'No items for this filter yet.';
    feed.appendChild(div);
  }

  updateSummary(filtered.length, items.length);
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

async function fetchFeed() {
  const res = await fetch(FEED_URL + '?_=' + Date.now());
  const data = await res.json();

  // set "Last updated"
  const lu = new Date(data.generated_at || Date.now()).toLocaleString();
  document.querySelector('#lastUpdated').textContent = `Last updated: ${lu}`;

  ALL_ITEMS = data.items || [];
  render(ALL_ITEMS, currentGroup);
}

function attachUI() {
  // filter buttons
  document.querySelectorAll('#filters .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-group');
      if (!group) return;
      currentGroup = group;
      setActive(group);
      render(ALL_ITEMS, currentGroup);
    });
  });

  // refresh button
  document.querySelector('#refreshBtn').addEventListener('click', () => {
    document.querySelector('#refreshBtn').textContent = '…';
    fetchFeed().finally(() => {
      document.querySelector('#refreshBtn').textContent = '↻ Refresh';
    });
  });
}

function init() {
  attachUI();
  fetchFeed();
}
init();
