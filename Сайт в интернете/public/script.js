"use strict";

const $ = (s) => document.querySelector(s);

window.addEventListener("DOMContentLoaded", () => {
  checkHealth();
  loadMessages();
  $("#message-form").addEventListener("submit", onSubmit);
  setupProjects();
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
let SOURCES = [];
let CUSTOM_REPOS = [];

function setupProjects() {
  // Конфиг источников: можно добавлять новых авторов/организации
  const savedSources = loadSavedSources();
  SOURCES = savedSources.length ? savedSources : (window.PROJECT_SOURCES || [
    { user: "Andrey15211", title: "Проекты Андрея" }
  ]);
  CUSTOM_REPOS = loadSavedCustom();
  const root = document.getElementById("projects-root");
  if (!root) return;
  root.innerHTML = "";
  for (const src of SOURCES) {
    const id = `repos-${src.user.toLowerCase()}`;
    const box = document.createElement("div");
    box.innerHTML = `<h3 style="margin:8px 0 6px">${escapeHtml(src.title || src.user)}</h3><div id="${id}" class="repo-grid"></div>`;
    root.appendChild(box);
    loadReposFor(src, document.getElementById(id));
  }
  const search = document.getElementById("repo-search");
  if (search) search.addEventListener("input", filterRepos);

  // Инициализация вьюера
  const close = document.getElementById("viewer-close");
  if (close) close.addEventListener("click", closeViewer);
  const modal = document.getElementById("viewer-modal");
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeViewer(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeViewer(); });

  // Секция “Добавленные” с кастомными репозиториями
  if (CUSTOM_REPOS.length) {
    const idc = "repos-custom";
    const box = document.createElement("div");
    box.innerHTML = `<h3 style=\"margin:8px 0 6px\">Добавленные</h3><div id=\"${idc}\" class=\"repo-grid\"></div>`;
    root.appendChild(box);
    renderRepoGrid(CUSTOM_REPOS, document.getElementById(idc));
  }

  // Кнопка добавления
  const addBtn = document.getElementById("add-source-btn");
  if (addBtn) addBtn.addEventListener("click", openAddModal);
  const addClose = document.getElementById("add-close");
  if (addClose) addClose.addEventListener("click", closeAddModal);
  const addModal = document.getElementById("add-modal");
  if (addModal) addModal.addEventListener("click", (e) => { if (e.target === addModal) closeAddModal(); });
  const addForm = document.getElementById("add-form");
  if (addForm) addForm.addEventListener("submit", onAddSubmit);
  const radios = document.querySelectorAll('input[name="add-type"]');
  radios.forEach(r => r.addEventListener("change", updateAddTypeUI));
  updateAddTypeUI();
}

async function loadReposFor(source, grid) {
  try {
    const url = `https://api.github.com/users/${encodeURIComponent(source.user)}/repos?per_page=100&sort=updated`;
    const headers = {};
    if (window.GH_TOKEN) headers["Authorization"] = `Bearer ${window.GH_TOKEN}`;
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("GitHub HTTP " + res.status);
    const data = await res.json();
    const repos = (Array.isArray(data) ? data : []).filter(r => !r.archived);
    ALL_REPOS = ALL_REPOS.concat(repos);
    renderRepoGrid(repos, grid);
  } catch (e) {
    console.error(e);
    if (grid) grid.innerHTML = `<div class="muted">Не удалось загрузить репозитории ${escapeHtml(source.user)}.</div>`;
  }
}

function filterRepos() {
  const q = (document.getElementById("repo-search")?.value || "").toLowerCase();
  for (const src of SOURCES) {
    const grid = document.getElementById(`repos-${src.user.toLowerCase()}`);
    const items = ALL_REPOS.filter(r => r.owner?.login?.toLowerCase() === src.user.toLowerCase());
    const filtered = !q ? items : items.filter(r =>
      (r.name||"").toLowerCase().includes(q) ||
      (r.description||"").toLowerCase().includes(q) ||
      (r.language||"").toLowerCase().includes(q)
    );
    renderRepoGrid(filtered, grid);
  }
  const empty = document.getElementById("repos-empty");
  const any = document.querySelector(".repo-card");
  if (empty) empty.style.display = any ? "none" : "block";
}

function renderRepoGrid(repos, grid) {
  if (!grid) return;
  grid.innerHTML = "";
  if (!repos || repos.length === 0) return;
  for (const r of repos) {
    const card = document.createElement("div");
    card.className = "repo-card";
    const updated = new Date(r.updated_at);
    const rel = timeAgo(updated);
    const desc = r.description ? escapeHtml(r.description) : "";
    const lang = r.language ? escapeHtml(r.language) : "";
    const stars = r.stargazers_count || 0;
    const forks = r.forks_count || 0;
    const demoUrl = chooseDemoUrl(r);

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
        ${demoUrl ? `<button class="btn" data-open="${encodeURIComponent(demoUrl)}" data-title="${escapeHtml(r.owner.login + " / " + r.name)}">Открыть</button>` : ""}
        <a class="btn" href="${r.html_url}" target="_blank" rel="noopener">GitHub</a>
      </div>
    `;
    const btn = card.querySelector("[data-open]");
    if (btn) btn.addEventListener("click", () => openViewer(decodeURIComponent(btn.getAttribute("data-open")), btn.getAttribute("data-title")));
    grid.appendChild(card);
  }
}

function chooseDemoUrl(r) {
  const owner = r.owner?.login;
  if (!owner) return null;
  if (r.homepage && r.homepage.trim()) return r.homepage.trim();
  if (r.has_pages) return `https://${owner}.github.io/${r.name}/`;
  const branch = r.default_branch || "main";
  return `https://htmlpreview.github.io/?https://github.com/${owner}/${r.name}/blob/${branch}/index.html`;
}

function openViewer(url, title) {
  const modal = document.getElementById("viewer-modal");
  const frame = document.getElementById("viewer-frame");
  const a = document.getElementById("viewer-open");
  const t = document.getElementById("viewer-title");
  if (!modal || !frame) return window.open(url, "_blank");
  frame.src = url;
  a.href = url;
  t.textContent = title || url;
  modal.hidden = false;
  // Показать подсказку, если сайт не загрузился за 3с
  const note = document.getElementById("viewer-note");
  if (note) {
    note.style.display = "none";
    setTimeout(() => { if (frame.contentWindow == null) note.style.display = "block"; }, 3000);
  }
}

function closeViewer() {
  const modal = document.getElementById("viewer-modal");
  const frame = document.getElementById("viewer-frame");
  if (frame) frame.src = "about:blank";
  if (modal) modal.hidden = true;
}

// -------- Добавление источника/репозитория --------
function openAddModal() {
  const m = document.getElementById("add-modal");
  if (m) m.hidden = false;
}
function closeAddModal() {
  const m = document.getElementById("add-modal");
  if (m) m.hidden = true;
}
function updateAddTypeUI() {
  const type = document.querySelector('input[name="add-type"]:checked')?.value || "user";
  document.getElementById("add-user-block").style.display = type === "user" ? "grid" : "none";
  document.getElementById("add-repo-block").style.display = type === "repo" ? "grid" : "none";
}
async function onAddSubmit(e) {
  e.preventDefault();
  const type = document.querySelector('input[name="add-type"]:checked')?.value || "user";
  if (type === "user") return addSourceUser();
  return addSourceRepo();
}

function saveSources() {
  try { localStorage.setItem("proj_sources", JSON.stringify(SOURCES)); } catch {}
}
function loadSavedSources() {
  try { return JSON.parse(localStorage.getItem("proj_sources")||"[]"); } catch { return []; }
}
function saveCustom() {
  try { localStorage.setItem("proj_custom", JSON.stringify(CUSTOM_REPOS)); } catch {}
}
function loadSavedCustom() {
  try { return JSON.parse(localStorage.getItem("proj_custom")||"[]"); } catch { return []; }
}

function addSourceUser() {
  const user = document.getElementById("add-user").value.trim();
  const title = document.getElementById("add-title").value.trim();
  if (!user) return;
  const src = { user, title: title || `Проекты ${user}` };
  // Не дублируем
  if (!SOURCES.some(s => s.user.toLowerCase() === user.toLowerCase())) {
    SOURCES.push(src); saveSources();
    const root = document.getElementById("projects-root");
    const id = `repos-${user.toLowerCase()}`;
    const box = document.createElement("div");
    box.innerHTML = `<h3 style=\"margin:8px 0 6px\">${escapeHtml(src.title)}</h3><div id=\"${id}\" class=\"repo-grid\"></div>`;
    root.appendChild(box);
    loadReposFor(src, document.getElementById(id));
  }
  closeAddModal();
}

async function addSourceRepo() {
  const repoStr = document.getElementById("add-repo").value.trim();
  if (!repoStr || !repoStr.includes("/")) return;
  const [owner, name] = repoStr.split("/").map(s => s.trim());
  const customTitle = document.getElementById("add-repo-title").value.trim();
  const customHome = document.getElementById("add-repo-home").value.trim();
  try {
    let r;
    if (!customHome) {
      const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
      const headers = {}; if (window.GH_TOKEN) headers["Authorization"] = `Bearer ${window.GH_TOKEN}`;
      const res = await fetch(url, { headers, cache: "no-store" });
      if (!res.ok) throw new Error("GitHub HTTP " + res.status);
      r = await res.json();
    } else {
      r = {
        owner: { login: owner },
        name,
        description: customTitle || "",
        homepage: customHome,
        has_pages: false,
        default_branch: "main",
        html_url: `https://github.com/${owner}/${name}`,
        stargazers_count: 0,
        forks_count: 0,
        language: "",
        updated_at: new Date().toISOString()
      };
    }
    CUSTOM_REPOS.push(r); saveCustom();
    // Создать/обновить секцию "Добавленные"
    let grid = document.getElementById("repos-custom");
    if (!grid) {
      const root = document.getElementById("projects-root");
      const box = document.createElement("div");
      box.innerHTML = `<h3 style=\"margin:8px 0 6px\">Добавленные</h3><div id=\"repos-custom\" class=\"repo-grid\"></div>`;
      root.appendChild(box);
      grid = document.getElementById("repos-custom");
    }
    renderRepoGrid(CUSTOM_REPOS, grid);
    closeAddModal();
  } catch (e) {
    console.error(e);
    alert("Не удалось загрузить репозиторий. Проверьте owner/repo или укажите Демо‑URL.");
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
