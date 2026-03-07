const API_BASE = "https://jsonplaceholder.typicode.com";
const CACHE_KEY = "assessment-cache-v1";
const CACHE_TTL_MS = 10 * 60 * 1000;

const elements = {
  userSelect: document.getElementById("userSelect"),
  refreshBtn: document.getElementById("refreshBtn"),
  status: document.getElementById("status"),
  meta: document.getElementById("meta"),
  userName: document.getElementById("userName"),
  postCount: document.getElementById("postCount"),
  avgLength: document.getElementById("avgLength"),
};

function setStatus(message, tone = "warn") {
  elements.status.className = `status ${tone}`;
  elements.status.textContent = message;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, { timeoutMs = 5000, retries = 1 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < retries) {
        await sleep(350 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function saveCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
}

function renderUsers(users) {
  elements.userSelect.innerHTML = "";
  users.forEach((user) => {
    const option = document.createElement("option");
    option.value = String(user.id);
    option.textContent = `${user.name} (${user.username})`;
    elements.userSelect.append(option);
  });
}

function renderUserStats(users, posts, userId) {
  const user = users.find((item) => item.id === Number(userId));
  const userPosts = posts.filter((item) => item.userId === Number(userId));
  const totalLength = userPosts.reduce((sum, post) => sum + post.body.length, 0);
  const avgLength = userPosts.length ? Math.round(totalLength / userPosts.length) : 0;

  elements.userName.textContent = user ? user.name : "Nie znaleziono";
  elements.postCount.textContent = String(userPosts.length);
  elements.avgLength.textContent = `${avgLength} znakow`;
}

async function loadData({ forceRefresh = false } = {}) {
  setStatus("Ladowanie...", "warn");
  const startedAt = performance.now();
  try {
    let data = !forceRefresh ? readCache() : null;
    let source = "cache";
    if (!data) {
      const [users, posts] = await Promise.all([
        fetchJson(`${API_BASE}/users`, { retries: 2 }),
        fetchJson(`${API_BASE}/posts`, { retries: 2 }),
      ]);
      data = { users, posts };
      saveCache(data);
      source = "API";
    }

    if (!elements.userSelect.options.length) {
      renderUsers(data.users);
    }

    if (!elements.userSelect.value && data.users.length > 0) {
      elements.userSelect.value = String(data.users[0].id);
    }

    renderUserStats(data.users, data.posts, elements.userSelect.value);

    const duration = Math.round(performance.now() - startedAt);
    const timestamp = new Date().toLocaleString("pl-PL");
    setStatus("OK", "ok");
    elements.meta.textContent = `Zrodlo: ${source} | Czas: ${duration} ms | Aktualizacja: ${timestamp}`;
  } catch (error) {
    console.error(error);
    setStatus("Blad API", "err");
    elements.meta.textContent = `Nie udalo sie pobrac danych: ${error.message}`;
  }
}

elements.userSelect.addEventListener("change", () => loadData());
elements.refreshBtn.addEventListener("click", () => loadData({ forceRefresh: true }));

loadData();
