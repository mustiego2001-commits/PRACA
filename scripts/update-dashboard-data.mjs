import { readFile, writeFile } from "node:fs/promises";

const API_BASE = "https://jsonplaceholder.typicode.com";
const INDEX_FILE = "index.html";
const START_MARKER = "<!-- AUTO-DATA:START -->";
const END_MARKER = "<!-- AUTO-DATA:END -->";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed for ${path}: HTTP ${response.status}`);
  }
  return response.json();
}

function buildGeneratedSection(users, posts) {
  const nowIso = new Date().toISOString();
  const totalPostLength = posts.reduce((sum, post) => sum + post.body.length, 0);
  const avgPostLength = posts.length === 0 ? 0 : Math.round(totalPostLength / posts.length);

  const postCountByUser = new Map();
  for (const post of posts) {
    postCountByUser.set(post.userId, (postCountByUser.get(post.userId) || 0) + 1);
  }

  const topUsers = users
    .map((user) => ({
      name: user.name,
      username: user.username,
      postCount: postCountByUser.get(user.id) || 0,
    }))
    .sort((a, b) => {
      if (b.postCount !== a.postCount) {
        return b.postCount - a.postCount;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, 5);

  const topUsersHtml = topUsers
    .map(
      (user) =>
        `        <li>${escapeHtml(user.name)} (${escapeHtml(user.username)}) - ${user.postCount} posts</li>`,
    )
    .join("\n");

  return `${START_MARKER}
    <section class="panel generated">
      <h2>Automated API snapshot</h2>
      <p class="meta">Last update (UTC): ${nowIso}</p>
      <ul>
        <li>Total users: ${users.length}</li>
        <li>Total posts: ${posts.length}</li>
        <li>Average post length: ${avgPostLength} chars</li>
      </ul>
      <h3>Top users by post count</h3>
      <ol>
${topUsersHtml}
      </ol>
    </section>
    ${END_MARKER}`;
}

async function main() {
  const [users, posts] = await Promise.all([fetchJson("/users"), fetchJson("/posts")]);
  const originalHtml = await readFile(INDEX_FILE, "utf8");

  const markerRegex = new RegExp(
    `${escapeRegex(START_MARKER)}[\\s\\S]*?${escapeRegex(END_MARKER)}`,
    "m",
  );

  if (!markerRegex.test(originalHtml)) {
    throw new Error(`Could not find ${START_MARKER} ... ${END_MARKER} markers in ${INDEX_FILE}`);
  }

  const updatedHtml = originalHtml.replace(markerRegex, buildGeneratedSection(users, posts));
  await writeFile(INDEX_FILE, updatedHtml, "utf8");
  console.log("index.html updated with fresh API snapshot.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
