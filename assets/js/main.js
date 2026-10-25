const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));
const categoryFor = (id) => CATEGORIES.find((category) => category.id === id) || { name: "その他", icon: "•" };
const dateLabel = (date) => {
  if (!date) return "";
  const parts = date.split("-");
  return parts.length === 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : date;
};
const imageOrPlaceholder = (image, label, extraClass = "") => image
  ? `<img class="${extraClass}" src="${escapeHtml(image)}" alt="${escapeHtml(label)}" loading="lazy">`
  : `<div class="image-placeholder ${extraClass}" aria-label="${escapeHtml(label)}"><span>びみ</span></div>`;

function videoCard(video) {
  const category = categoryFor(video.category);
  const link = video.videoUrl || "#";
  return `<article class="content-card">
    <a class="card-image-link" href="${escapeHtml(link)}" ${video.videoUrl ? 'target="_blank" rel="noopener noreferrer"' : ""}>
      ${imageOrPlaceholder(video.thumbnail, video.title, "card-image")}
      <span class="play-badge" aria-hidden="true">▶</span>
    </a>
    <div class="card-body"><span class="pill">${escapeHtml(category.name)}</span>
      <h3><a href="${escapeHtml(link)}" ${video.videoUrl ? 'target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(video.title)}</a></h3>
      <p>${escapeHtml(video.description || "")}</p><time>${escapeHtml(dateLabel(video.date))}</time>
    </div></article>`;
}
function postCard(post) {
  const category = categoryFor(post.category);
  return `<article class="content-card">
    <a class="card-image-link" href="article.html?id=${encodeURIComponent(post.id)}">${imageOrPlaceholder(post.image, post.title, "card-image")}</a>
    <div class="card-body"><span class="pill">${escapeHtml(category.name)}</span>
      <h3><a href="article.html?id=${encodeURIComponent(post.id)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.description || "")}</p><time>${escapeHtml(dateLabel(post.date))}</time>
    </div></article>`;
}
function categoryCard(category) {
  const count = POSTS.filter((post) => post.category === category.id).length;
  const videoCount = VIDEOS.filter((video) => video.category === category.id).length;
  return `<a class="category-card" href="category.html?id=${encodeURIComponent(category.id)}">
    <span class="category-icon" aria-hidden="true">${escapeHtml(category.icon)}</span>
    <span class="category-card-title">${escapeHtml(category.name)}</span>
    <span class="category-card-description">${escapeHtml(category.description)}</span>
    <span class="category-count">動画 ${videoCount} ・記事 ${count} <span aria-hidden="true">→</span></span>
  </a>`;
}
function emptyState(title, message) {
  return `<div class="empty-state"><span class="empty-symbol">び</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p></div>`;
}
function setYear() {
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
}
function setupMenu() {
  const button = $(".menu-toggle");
  const nav = $("#site-nav");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });
}
function renderHome() {
  const featured = $("#featured-video");
  if (featured) {
    if (VIDEOS.length) {
      const video = [...VIDEOS].sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
      featured.innerHTML = `<div class="featured-card">${imageOrPlaceholder(video.thumbnail, video.title, "featured-image")}<div class="featured-copy"><span class="pill">${escapeHtml(categoryFor(video.category).name)}</span><h3>${escapeHtml(video.title)}</h3><p>${escapeHtml(video.description || "")}</p><a class="button button-primary" href="${escapeHtml(video.videoUrl || "videos.html")}" ${video.videoUrl ? 'target="_blank" rel="noopener noreferrer"' : ""}>動画を見る ↗</a></div></div>`;
    } else {
      featured.innerHTML = emptyState("動画は準備中です", "公開した動画はここに表示されます。");
    }
  }
  const videoGrid = $("#video-grid");
  if (videoGrid) videoGrid.innerHTML = VIDEOS.length > 1 ? VIDEOS.slice(1, 4).map(videoCard).join("") : "";
  const categoryGrid = $("#category-grid");
  if (categoryGrid) categoryGrid.innerHTML = CATEGORIES.map(categoryCard).join("");
  const postsGrid = $("#latest-posts");
  if (postsGrid) {
    const latest = [...POSTS].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 3);
    postsGrid.innerHTML = latest.length ? latest.map(postCard).join("") : emptyState("ブログ記事は準備中です", "記事を追加すると、ここに新着記事が表示されます。");
  }
  const channelLink = $("#channel-link");
  if (channelLink && SITE_CONFIG.channelUrl) channelLink.href = SITE_CONFIG.channelUrl;
}
function renderVideos() {
  const grid = $("#all-videos");
  if (!grid) return;
  const filters = $("#video-filters");
  if (filters) {
    filters.innerHTML = `<button class="filter-button is-active" data-filter="all">すべて</button>` + CATEGORIES.map((c) => `<button class="filter-button" data-filter="${escapeHtml(c.id)}">${escapeHtml(c.name)}</button>`).join("");
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      filters.querySelectorAll(".filter-button").forEach((b) => b.classList.toggle("is-active", b === button));
      const filtered = button.dataset.filter === "all" ? VIDEOS : VIDEOS.filter((v) => v.category === button.dataset.filter);
      grid.innerHTML = filtered.length ? filtered.map(videoCard).join("") : emptyState("このカテゴリの動画はまだありません", "動画が公開されると、ここに表示されます。");
    });
  }
  grid.innerHTML = VIDEOS.length ? [...VIDEOS].sort((a,b) => (b.date||"").localeCompare(a.date||"")).map(videoCard).join("") : emptyState("動画はまだありません", "最初の動画を公開したら、data.js に情報を追加してください。");
}
function renderPosts() {
  const grid = $("#all-posts");
  if (!grid) return;
  const filters = $("#post-filters");
  if (filters) {
    filters.innerHTML = `<button class="filter-button is-active" data-filter="all">すべて</button>` + CATEGORIES.map((c) => `<button class="filter-button" data-filter="${escapeHtml(c.id)}">${escapeHtml(c.name)}</button>`).join("");
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      filters.querySelectorAll(".filter-button").forEach((b) => b.classList.toggle("is-active", b === button));
      const filtered = button.dataset.filter === "all" ? POSTS : POSTS.filter((p) => p.category === button.dataset.filter);
      grid.innerHTML = filtered.length ? [...filtered].sort((a,b) => (b.date||"").localeCompare(a.date||"")).map(postCard).join("") : emptyState("記事はまだありません", "このカテゴリの記事を追加すると、ここに表示されます。");
    });
  }
  grid.innerHTML = POSTS.length ? [...POSTS].sort((a,b) => (b.date||"").localeCompare(a.date||"")).map(postCard).join("") : emptyState("ブログ記事はまだありません", "記事を追加すると、ここに一覧表示されます。");
}
function renderCategories() {
  const grid = $("#all-categories");
  if (grid) grid.innerHTML = CATEGORIES.map(categoryCard).join("");
}
function renderArticle() {
  const root = $("#article-content");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const post = POSTS.find((item) => item.id === id);
  if (!post) {
    root.innerHTML = emptyState("記事が見つかりません", "URLを確認するか、ブログ一覧から記事を選んでください。");
    return;
  }
  document.title = `${post.title} | びみ`;
  const paragraphs = (post.body || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  root.innerHTML = `<article class="article"><a class="back-link" href="blog.html">← ブログ一覧へ</a><header class="article-header"><span class="pill">${escapeHtml(categoryFor(post.category).name)}</span><h1>${escapeHtml(post.title)}</h1><p class="article-description">${escapeHtml(post.description || "")}</p><time>${escapeHtml(dateLabel(post.date))}</time></header>${post.image ? imageOrPlaceholder(post.image, post.title, "article-image") : ""}<div class="article-body">${post.bodyHtml || paragraphs}</div>${post.relatedVideo ? `<aside class="related-video"><h2>この記事に関連する動画</h2><a class="button button-primary" href="${escapeHtml(post.relatedVideo)}" target="_blank" rel="noopener noreferrer">動画を見る ↗</a></aside>` : ""}</article>`;
}
function renderCategoryPage() {
  const root = $("#category-content");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const category = CATEGORIES.find((item) => item.id === id);
  if (!category) {
    root.innerHTML = `<div class="section container">${emptyState("カテゴリが見つかりません", "カテゴリ一覧から選んでください。")}</div>`;
    return;
  }
  document.title = `${category.name} | びみ`;
  const videos = VIDEOS.filter((item) => item.category === id);
  const posts = POSTS.filter((item) => item.category === id);
  root.innerHTML = `<section class="page-hero container"><p class="eyebrow">CATEGORY</p><h1>${escapeHtml(category.name)}</h1><p>${escapeHtml(category.description)}</p></section><section class="section container"><h2>動画</h2>${videos.length ? `<div class="card-grid video-grid">${videos.map(videoCard).join("")}</div>` : emptyState("動画はまだありません", "公開後にここへ表示されます。")}<h2 class="subsection-title">記事</h2>${posts.length ? `<div class="card-grid post-grid">${posts.map(postCard).join("")}</div>` : emptyState("記事はまだありません", "記事を追加すると、ここへ表示されます。")}</section>`;
}
document.addEventListener("DOMContentLoaded", () => {
  setYear(); setupMenu(); renderHome(); renderVideos(); renderPosts(); renderCategories(); renderArticle(); renderCategoryPage();
});
