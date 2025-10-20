"use strict";

const $ = (s) => document.querySelector(s);

window.addEventListener("DOMContentLoaded", () => {
  checkHealth();
  loadMessages();
  $("#message-form").addEventListener("submit", onSubmit);
  loadRepos();
  const search = document.getElementById("repo-search");
  if (search) search.addEventListener("input", filterRepos);
});

async function checkHealth() {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    const data = await res.json();
    $("#health").textContent = data.status || "ok";
  } catch (e) {
    $("#health").textContent = "offline";
  }
}

async function loadMessages() {
  try {
    const res = await fetch("/api/messages", { cache: "no-store" });
    const data = await res.json();
    const ul = $("#list");
    ul.innerHTML = "";
    data.forEach((m) => {
      const li = document.createElement("li");
      const name = escapeHtml(m.name || "Гость");
      const txt = escapeHtml(m.text || "");
      const dt = escapeHtml(m.created_at || "");
      li.innerHTML = `<div class="meta">${name} • ${dt}</div><div>${txt}</div>`;
      ul.appendChild(li);
    });
  } catch (e) {
    console.error(e);
  }
}

async function onSubmit(ev) {
  ev.preventDefault();
  const name = $("#name").value.trim();
  const text = $("#text").value.trim();
  if (!text) return;
  try {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text })
    });
    $("#text").value = "";
    loadMessages();
  } catch (e) {
    console.error(e);
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

// -------- GitHub repos --------
let ALL_REPOS = [];

async function loadRepos() {
  try {
    const user = window.GITHUB_USER || "Andrey15211";
    const url = `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`;
    const headers = {};
    if (window.GH_TOKEN) headers["Authorization"] = `Bearer ${window.GH_TOKEN}`;
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("GitHub HTTP " + res.status);
    const data = await res.json();
    ALL_REPOS = (Array.isArray(data) ? data : []).filter(r => !r.archived);
    renderRepos(ALL_REPOS);
  } catch (e) {
    console.error(e);
    const box = document.getElementById("repos");
    if (box) box.innerHTML = `<div class="muted">Не удалось загрузить репозитории с GitHub.</div>`;
  }
}

function filterRepos() {
  const q = (document.getElementById("repo-search")?.value || "").toLowerCase();
  const filtered = !q
    ? ALL_REPOS
    : ALL_REPOS.filter(r =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.language || "").toLowerCase().includes(q)
      );
  renderRepos(filtered);
}

function renderRepos(repos) {
  const grid = document.getElementById("repos");
  const empty = document.getElementById("repos-empty");
  if (!grid) return;
  grid.innerHTML = "";
  if (!repos || repos.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  for (const r of repos) {
    const card = document.createElement("div");
    card.className = "repo-card";
    const updated = new Date(r.updated_at);
    const rel = timeAgo(updated);
    const desc = r.description ? escapeHtml(r.description) : "";
    const lang = r.language ? escapeHtml(r.language) : "";
    const stars = r.stargazers_count || 0;
    const forks = r.forks_count || 0;
    const homepage = r.homepage && r.homepage.trim() ? r.homepage.trim() : null;

    card.innerHTML = `
      <h3>${escapeHtml(r.name)}</h3>
      <div class="repo-desc">${desc}</div>
      <div class="repo-meta">
        ${lang ? `<span>🧩 ${lang}</span>` : ""}
        <span>⭐ ${stars}</span>
        <span>🍴 ${forks}</span>
        <span>🕒 ${rel}</span>
      </div>
      <div class="repo-links">
        <a class="btn" href="${r.html_url}" target="_blank" rel="noopener">GitHub</a>
        ${homepage ? `<a class="btn" href="${homepage}" target="_blank" rel="noopener">Демо</a>` : ""}
      </div>
    `;
    grid.appendChild(card);
  }
}

function timeAgo(d) {
  const diff = (Date.now() - d.getTime()) / 1000;
  const units = [
    [60, "сек"],
    [60, "мин"],
    [24, "ч"],
    [30, "дн"],
    [12, "мес"],
  ];
  let n = diff;
  let i = 0;
  const labels = ["сек", "мин", "ч", "дн", "мес", "г"];
  for (; i < units.length && n >= units[i][0]; i++) n /= units[i][0];
  const value = Math.floor(n);
  const label = labels[i] || "г";
  return `${value} ${label} назад`;
}
