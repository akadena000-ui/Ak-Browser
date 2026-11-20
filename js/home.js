/** Ak New Tab page (srcdoc) — galaxy purple */

export function buildHomeSrcdoc(isPrivate = false) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>New Tab — Ak</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg: #07040f;
    --surface: #120a1f;
    --elev: #1a0f2b;
    --purple: #c026ff;
    --purple-dim: rgba(192, 38, 255, 0.2);
    --border: rgba(192, 38, 255, 0.3);
    --text: #f3e8ff;
    --muted: #a78bfa;
    --dim: #7c3aed;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Inter", system-ui, sans-serif;
    background: radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, var(--bg) 60%);
    color: var(--text);
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 20px;
    overflow: hidden;
  }
  .stars {
    position: fixed; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.4), transparent),
      radial-gradient(1px 1px at 70% 20%, rgba(192,38,255,0.5), transparent),
      radial-gradient(1.5px 1.5px at 40% 70%, rgba(255,255,255,0.3), transparent),
      radial-gradient(1px 1px at 85% 60%, rgba(192,38,255,0.4), transparent),
      radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.25), transparent);
    animation: twinkle 8s ease-in-out infinite alternate;
  }
  @keyframes twinkle {
    from { opacity: 0.6; }
    to { opacity: 1; }
  }
  .clock {
    font-size: 4.2rem; font-weight: 600; letter-spacing: -2px;
    background: linear-gradient(135deg, #f3e8ff, #c026ff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 6px;
    animation: fadeUp 0.5s ease;
  }
  .date {
    font-size: 14px; color: var(--muted); margin-bottom: 36px;
    animation: fadeUp 0.5s ease 0.05s both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
  }
  .search-box {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 14px 18px;
    width: 100%; max-width: 480px;
    margin-bottom: 40px;
    box-shadow: 0 0 30px rgba(192, 38, 255, 0.12);
    transition: border-color 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.5s ease 0.1s both;
  }
  .search-box:focus-within {
    border-color: var(--purple);
    box-shadow: 0 0 0 3px var(--purple-dim), 0 0 30px rgba(192, 38, 255, 0.25);
  }
  .search-box i { color: var(--muted); }
  .search-box input {
    flex: 1; background: transparent; border: none; outline: none;
    color: var(--text); font-size: 15px; font-family: inherit;
  }
  .search-box input::placeholder { color: var(--dim); }
  .search-box select {
    background: var(--elev); border: none; border-radius: 8px;
    color: var(--muted); padding: 6px 10px; font-size: 12px;
    cursor: pointer; outline: none; font-family: inherit;
  }
  .shortcuts {
    display: grid; grid-template-columns: repeat(5, 1fr);
    gap: 18px; max-width: 480px; width: 100%;
    animation: fadeUp 0.5s ease 0.15s both;
  }
  .shortcut {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    text-decoration: none; cursor: pointer; color: inherit;
  }
  .shortcut-icon {
    width: 54px; height: 54px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .shortcut:hover .shortcut-icon {
    background: var(--elev);
    border-color: var(--purple);
    box-shadow: 0 0 16px rgba(192, 38, 255, 0.35);
    transform: translateY(-3px);
  }
  .shortcut-icon img {
    width: 22px; height: 22px;
    filter: brightness(0) invert(0.75);
  }
  .shortcut-icon i { font-size: 20px; color: var(--muted); }
  .shortcut-label {
    font-size: 11px; color: var(--muted); text-align: center;
    max-width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .shortcut:hover .shortcut-label { color: var(--text); }
  .brand {
    position: fixed; bottom: 20px;
    font-size: 12px; color: var(--dim); letter-spacing: 0.08em;
  }
  .brand span { color: var(--purple); }
  .private-badge {
    position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
    display: none; align-items: center; gap: 8px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #f87171; padding: 8px 18px; border-radius: 999px;
    font-size: 12px; font-weight: 500;
  }
  .private-badge.show { display: flex; }
</style>
</head>
<body>
  <div class="stars"></div>
  <div class="private-badge" id="priv">
    <i class="fa-solid fa-user-secret"></i> Private browsing
  </div>
  <div class="clock" id="clock">00:00</div>
  <div class="date" id="date"></div>
  <form class="search-box" id="form">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input type="text" id="q" placeholder="Search the web..." autocomplete="off" />
    <select id="engine">
      <option value="https://search.brave.com/search?q=">Brave</option>
      <option value="https://duckduckgo.com/?q=">DuckDuckGo</option>
      <option value="https://www.google.com/search?q=">Google</option>
    </select>
  </form>
  <div class="shortcuts">
    <a class="shortcut" data-url="https://youtube.com">
      <div class="shortcut-icon"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/youtube.svg" /></div>
      <span class="shortcut-label">YouTube</span>
    </a>
    <a class="shortcut" data-url="https://github.com">
      <div class="shortcut-icon"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg" /></div>
      <span class="shortcut-label">GitHub</span>
    </a>
    <a class="shortcut" data-url="https://discord.com">
      <div class="shortcut-icon"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/discord.svg" /></div>
      <span class="shortcut-label">Discord</span>
    </a>
    <a class="shortcut" data-url="https://x.com">
      <div class="shortcut-icon"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg" /></div>
      <span class="shortcut-label">X</span>
    </a>
    <a class="shortcut" data-url="https://reddit.com">
      <div class="shortcut-icon"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/reddit.svg" /></div>
      <span class="shortcut-label">Reddit</span>
    </a>
  </div>
  <div class="brand">AK <span>BROWSER</span></div>
  <script>
    const priv = ${isPrivate ? 