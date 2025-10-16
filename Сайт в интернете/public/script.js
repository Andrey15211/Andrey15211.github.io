"use strict";

const $ = (s) => document.querySelector(s);

window.addEventListener("DOMContentLoaded", () => {
  checkHealth();
  loadMessages();
  $("#message-form").addEventListener("submit", onSubmit);
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

