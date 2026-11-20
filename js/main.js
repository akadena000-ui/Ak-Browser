import { buildHomeSrcdoc } from "./home.js";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
  getHistory,
  pushHistory,
  clearAllData,
  isBmBarVisible,
  setBmBarVisible,
} from "./storage.js";
import {
  getProxyMode,
  setProxyMode,
  resolveUrl,
  initScramjet,
  getWispUrl,
  setWispUrl,
  getWispServers,
  isScramjetReady,
} from "./proxy.js";

const OWNER_PASSWORD = "aleksistuff231";
const OWNER_KEY = "ak_owner_unlocked";

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

let tabs = [];
let activeId = null;
let idCounter = 0;
let ownerUnlocked = sessionStorage.getItem(OWNER_KEY) === "1";

function uid() {
  return "t" + ++idCounter + "_" + Date.now().toString(36);
}

function createTab(url = "ak://home", opts = {}) {
  const id = uid();
  const tab = {
    id,
    url,
    title: opts.isPrivate ? "Private Tab" : "New Tab",
    isPrivate: !!opts.isPrivate,
    history: [url],
    histIdx: 0,
  };
  tabs.push(tab);
  renderTabs();
  switchTab(id);
  navigate(id, url);
  return tab;
}

function closeTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx < 0) return;
  tabs.splice(idx, 1);
  const frame = document.getElementById("frame-" + id);
  if (frame) frame.remove();
  if (tabs.length === 0) {
    createTab();
    return;
  }
  if (activeId === id) {
    const next = tabs[Math.min(idx, tabs.length - 1)];
    switchTab(next.id);
  } else {
    renderTabs();
  }
}

function switchTab(id) {
  activeId = id;
  renderTabs();
  $$(".viewport, .home-frame").forEach((f) => f.classList.remove("active"));
  const frame = document.getElementById("frame-" + id);
  if (frame) frame.classList.add("active");
  const tab = tabs.find((t) => t.id === id);
  if (tab) {
    $("#address-bar").value = tab.url.startsWith("ak://") ? "" : tab.url;
    updateNavButtons(tab);
    updateStar(tab.url);
  }
}

function renderTabs() {
  const bar = $("#tabbar");
  bar.innerHTML = "";
  tabs.forEach((t) => {
    const el = document.createElement("div");
    el.className =
      "tab" +
      (t.id === activeId ? " active" : "") +
      (t.isPrivate ? " private" : "");
    el.dataset.id = t.id;
    el.innerHTML = `
      <span class="tab-title">${escapeHtml(t.title)}</span>
      <span class="tab-close" data-close="${t.id}"><i class="fa-solid fa-xmark"></i></span>
    `;
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) {
        e.stopPropagation();
        closeTab(t.id);
        return;
      }
      switchTab(t.id);
    });
    bar.appendChild(el);
  });
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function ensureFrame(tab) {
  let frame = document.getElementById("frame-" + tab.id);
  if (frame) return frame;
  const stack = $("#viewport-stack");
  if (tab.url.startsWith("ak://")) {
    frame = document.createElement("iframe");
    frame.className = "home-frame";
    frame.id = "frame-" + tab.id;
    frame.sandbox = "allow-scripts allow-same-origin";
    frame.srcdoc = buildHomeSrcdoc(tab.isPrivate);
  } else {
    frame = document.createElement("iframe");
    frame.className = "viewport";
    frame.id = "frame-" + tab.id;
    frame.sandbox =
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads";
    frame.referrerPolicy = "no-referrer";
  }
  stack.appendChild(frame);
  return frame;
}

function navigate(id, rawUrl, pushHist = true) {
  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;

  let url = rawUrl.trim();
  if (!url) url = "ak://home";

  if (
    !url.startsWith("ak://") &&
    !url.startsWith("about:") &&
    !/^https?:\/\//i.test(url)
  ) {
    if (/^[\w.-]+\.[a-z]{2,}/i.test(url)) {
      url = "https://" + url;
    } else {
      url = "https://search.brave.com/search?q=" + encodeURIComponent(url);
    }
  }

  tab.url = url;
  if (pushHist) {
    tab.history = tab.history.slice(0, tab.histIdx + 1);
    tab.history.push(url);
    tab.histIdx = tab.history.length - 1;
  }

  let frame = document.getElementById("frame-" + id);
  if (frame) frame.remove();

  frame = ensureFrame(tab);

  if (url.startsWith("ak://")) {
    frame.srcdoc = buildHomeSrcdoc(tab.isPrivate);
    tab.title = tab.isPrivate ? "Private Tab" : "New Tab";
  } else {
    const target = resolveUrl(url);
    frame.src = target;
    tab.title = url.replace(/^https?:\/\//, "").split("/")[0] || "Tab";
    if (!tab.isPrivate) pushHistory(tab.title, url);
  }

  if (id === activeId) {
    $("#address-bar").value = url.startsWith("ak://") ? "" : url;
    updateNavButtons(tab);
    updateStar(url);
  }
  renderTabs();
  frame.classList.add("active");
}

function updateNavButtons(tab) {
  $("#btn-back").disabled = tab.histIdx <= 0;
  $("#btn-forward").disabled = tab.histIdx >= tab.history.length - 1;
}

function updateStar(url) {
  const btn = $("#btn-star");
  const on = isBookmarked(url);
  btn.classList.toggle("bookmarked", on);
  btn.innerHTML = on
    ? '<i class="fa-solid fa-star"></i>'
    : '<i class="fa-regular fa-star"></i>';
}

function renderBookmarkBar() {
  const bar = $("#bookmark-bar");
  const visible = isBmBarVisible();
  bar.classList.toggle("hidden", !visible);
  bar.innerHTML = "";
  if (!visible) return;
  getBookmarks().forEach((b) => {
    const el = document.createElement("div");
    el.className = "bm-item";
    el.innerHTML = `<span>${escapeHtml(b.title)}</span>`;
    el.addEventListener("click", () => {
      if (activeId) navigate(activeId, b.url);
    });
    bar.appendChild(el);
  });
}

function openPanel(title, items) {
  $("#panel-title").textContent = title;
  const body = $("#panel-body");
  body.innerHTML = "";
  if (!items.length) {
    body.innerHTML = '<div class="panel-empty">Nothing here yet</div>';
  } else {
    items.forEach((item) => {
      const el = document.createElement("div");
      el.className = "panel-item";
      el.innerHTML = `
        <div>
          <div class="panel-item-title">${escapeHtml(item.title || item.url)}</div>
          <div class="panel-item-url">${escapeHtml(item.url)}</div>
        </div>
      `;
      el.addEventListener("click", () => {
        if (activeId) navigate(activeId, item.url);
        closePanel();
      });
      body.appendChild(el);
    });
  }
  $("#panel").classList.add("open");
}

function closePanel() {
  $("#panel").classList.remove("open");
}

function fillWispSelect() {
  const sel = $("#wisp-select");
  if (!sel) return;
  sel.innerHTML = "";
  getWispServers().forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.url;
    opt.textContent = s.name;
    if (s.url === getWispUrl()) opt.selected = true;
    sel.appendChild(opt);
  });
}

/* Owner */
function openOwnerModal() {
  $("#owner-error").textContent = "";
  $("#owner-password").value = "";
  $("#owner-modal").classList.add("open");
  setTimeout(() => $("#owner-password").focus(), 50);
}

function closeOwnerModal() {
  $("#owner-modal").classList.remove("open");
}

function unlockOwner() {
  if ($("#owner-password").value === OWNER_PASSWORD) {
    ownerUnlocked = true;
    sessionStorage.setItem(OWNER_KEY, "1");
    closeOwnerModal();
    $("#owner-panel").classList.add("open");
  } else {
    $("#owner-error").textContent = "Wrong password";
    $("#owner-password").value = "";
    $("#owner-password").focus();
  }
}

function lockOwner() {
  ownerUnlocked = false;
  sessionStorage.removeItem(OWNER_KEY);
  $("#owner-panel").classList.remove("open");
}

function handleOwnerAction(action) {
  if (action === "clear-all") {
    if (confirm("Clear ALL bookmarks, history, and data?")) {
      clearAllData();
      renderBookmarkBar();
      alert("All data cleared.");
    }
  }
  if (action === "export-data") {
    const data = {
      bookmarks: getBookmarks(),
      history: getHistory(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ak-browser-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  if (action === "toggle-proxy") {
    setProxyMode("scramjet");
    $("#proxy-select").value = "scramjet";
    alert("Scramjet mode on · Wisp: " + getWispUrl());
  }
  if (action === "new-private") {
    createTab("ak://home", { isPrivate: true });
  }
  if (action === "lock") lockOwner();
}

// Events
$("#btn-new-tab").addEventListener("click", () => createTab());
$("#btn-back").addEventListener("click", () => {
  const tab = tabs.find((t) => t.id === activeId);
  if (!tab || tab.histIdx <= 0) return;
  tab.histIdx--;
  navigate(tab.id, tab.history[tab.histIdx], false);
});
$("#btn-forward").addEventListener("click", () => {
  const tab = tabs.find((t) => t.id === activeId);
  if (!tab || tab.histIdx >= tab.history.length - 1) return;
  tab.histIdx++;
  navigate(tab.id, tab.history[tab.histIdx], false);
});
$("#btn-reload").addEventListener("click", () => {
  const tab = tabs.find((t) => t.id === activeId);
  if (tab) navigate(tab.id, tab.url, false);
});
$("#btn-home").addEventListener("click", () => {
  if (activeId) navigate(activeId, "ak://home");
});

$("#address-bar").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (activeId) navigate(activeId, e.target.value);
  }
});

$("#btn-star").addEventListener("click", () => {
  const tab = tabs.find((t) => t.id === activeId);
  if (!tab || tab.url.startsWith("ak://")) return;
  if (isBookmarked(tab.url)) removeBookmark(tab.url);
  else addBookmark(tab.title, tab.url);
  updateStar(tab.url);
  renderBookmarkBar();
});

$("#proxy-select").value = getProxyMode();
$("#proxy-select").addEventListener("change", (e) => {
  setProxyMode(e.target.value);
});

$("#btn-menu").addEventListener("click", (e) => {
  e.stopPropagation();
  $("#dropdown").classList.toggle("open");
});
document.addEventListener("click", () =>
  $("#dropdown").classList.remove("open")
);

$("#dropdown").addEventListener("click", (e) => {
  const item = e.target.closest(".dd-item");
  if (!item) return;
  const action = item.dataset.action;
  $("#dropdown").classList.remove("open");
  if (action === "new-tab") createTab();
  if (action === "new-private") createTab("ak://home", { isPrivate: true });
  if (action === "bookmarks") openPanel("Bookmarks", getBookmarks());
  if (action === "history") openPanel("History", getHistory());
  if (action === "downloads") openPanel("Downloads", []);
  if (action === "toggle-bmbar") {
    setBmBarVisible(!isBmBarVisible());
    renderBookmarkBar();
  }
  if (action === "clear-data") {
    if (confirm("Clear all browsing data?")) {
      clearAllData();
      renderBookmarkBar();
    }
  }
  if (action === "owner-access") {
    if (ownerUnlocked) $("#owner-panel").classList.add("open");
    else openOwnerModal();
  }
});

$("#panel-close").addEventListener("click", closePanel);
$("#owner-cancel").addEventListener("click", closeOwnerModal);
$("#owner-submit").addEventListener("click", unlockOwner);
$("#owner-password").addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlockOwner();
});
$("#owner-modal").addEventListener("click", (e) => {
  if (e.target === $("#owner-modal")) closeOwnerModal();
});
$("#owner-panel-close").addEventListener("click", () => {
  $("#owner-panel").classList.remove("open");
});
$$("[data-owner]").forEach((btn) => {
  btn.addEventListener("click", () => handleOwnerAction(btn.dataset.owner));
});

window.addEventListener("message", (e) => {
  if (e.data?.type === "ak-navigate" && e.data.url && activeId) {
    navigate(activeId, e.data.url);
  }
});

// Boot
(async () => {
  renderBookmarkBar();
  createTab();
  const ok = await initScramjet();
  const status = $("#proxy-status");
  if (status) {
    status.textContent = ok
      ? "Scramjet · " + getWispUrl().replace(/^wss?:\/\//, "").slice(0, 28)
      : "Scramjet offline (add /scram files)";
  }
})();
