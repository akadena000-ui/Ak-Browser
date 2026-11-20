const KEYS = {
  tabs: "ak_tabs",
  bookmarks: "ak_bookmarks",
  history: "ak_history",
  downloads: "ak_downloads",
  bmBarVisible: "ak_bmbar",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getBookmarks() {
  return load(KEYS.bookmarks, [
    { title: "YouTube", url: "https://youtube.com" },
    { title: "GitHub", url: "https://github.com" },
    { title: "Discord", url: "https://discord.com" },
    { title: "X", url: "https://x.com" },
  ]);
}

export function setBookmarks(list) {
  save(KEYS.bookmarks, list);
}

export function addBookmark(title, url) {
  const list = getBookmarks();
  if (list.some((b) => b.url === url)) return list;
  list.push({ title, url });
  setBookmarks(list);
  return list;
}

export function removeBookmark(url) {
  const list = getBookmarks().filter((b) => b.url !== url);
  setBookmarks(list);
  return list;
}

export function isBookmarked(url) {
  return getBookmarks().some((b) => b.url === url);
}

export function getHistory() {
  return load(KEYS.history, []);
}

export function pushHistory(title, url) {
  if (!url || url.startsWith("ak://")) return;
  let list = getHistory().filter((h) => h.url !== url);
  list.unshift({ title: title || url, url, at: Date.now() });
  list = list.slice(0, 200);
  save(KEYS.history, list);
}

export function clearHistory() {
  save(KEYS.history, []);
}

export function getDownloads() {
  return load(KEYS.downloads, []);
}

export function clearAllData() {
  save(KEYS.history, []);
  save(KEYS.bookmarks, []);
  save(KEYS.downloads, []);
}

export function isBmBarVisible() {
  const v = localStorage.getItem(KEYS.bmBarVisible);
  return v === null ? true : v === "1";
}

export function setBmBarVisible(on) {
  localStorage.setItem(KEYS.bmBarVisible, on ? "1" : "0");
}
