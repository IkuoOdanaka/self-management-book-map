/* ============================================================
   書籍マップ 共通描画エンジン
   ------------------------------------------------------------
   このファイルは全書籍で共有します。書籍固有の文言・データは
   一切書かず、books/<slug>.js が入れた window.BOOK_MAP_DATA を読みます。

   読み込み順（クラシックスクリプト。file:// でも動くよう module にしない）:
     1. books/catalog.js        … window.BOOK_MAP_CATALOG
     2. books/<slug>.js         … window.BOOK_MAP_DATA
     3. assets/book-map.js      … これ
   ============================================================ */
(function () {
  "use strict";

  const DATA = window.BOOK_MAP_DATA;
  if (!DATA) {
    console.error("[book-map] window.BOOK_MAP_DATA が読み込まれていません。books/<slug>.js の <script> を確認してください。");
    return;
  }
  const CATALOG = window.BOOK_MAP_CATALOG || [];

  /* ---------- Amazon リンク ----------
     DATA.amazonTag を空文字にすると、タグなしの通常リンクになります。 */
  const amazonUrl = asin =>
    `https://www.amazon.co.jp/dp/${asin}` + (DATA.amazonTag ? `?tag=${DATA.amazonTag}` : "");
  const coverUrl = asin =>
    `https://m.media-amazon.com/images/P/${asin}.09._SCLZZZZZZZ_.jpg`;

  const byId = id => document.getElementById(id);
  const setHref = (id, url) => { const el = byId(id); if (el) el.href = url; };

  setHref("buyLink", amazonUrl(DATA.asin));
  setHref("coverLink", amazonUrl(DATA.asin));

  /* ---------- 読者の声 ----------
     quote は原文からの短い抜粋。url は必ず原文を指定します。 */
  function renderFeedback(items, targetId, sourceLabel) {
    const el = byId(targetId);
    if (!el) return;
    const list = items || [];
    // 配列が空なら、そのグループごと出さない
    const group = el.closest(".feedback-group");
    if (!list.length) { if (group) group.hidden = true; return; }
    el.innerHTML = list.map(item => `
      <a class="feedback-card" href="${item.url}" target="_blank" rel="noopener">
        <span class="feedback-source">${item.network || sourceLabel}</span>
        ${item.title ? `<h3>${item.title}</h3>` : ""}
        <blockquote>${item.quote}</blockquote>
        <p class="feedback-by">— ${item.by}</p>
        <span class="feedback-go">原文を読む →</span>
      </a>`).join("");
  }

  const feedback = DATA.feedback || {};
  renderFeedback(feedback.blogs, "blogFeedback", "BLOG");
  renderFeedback(feedback.social, "socialFeedback", "SNS");
  // 感想もSNSも無い書籍では、セクションごと隠す
  if (!(feedback.blogs || []).length && !(feedback.social || []).length) {
    const section = byId("feedback");
    if (section) section.hidden = true;
  }

  /* ---------- 章データ ---------- */
  const ALL = {};
  (DATA.chapters || []).forEach(c => { ALL[c.key] = c; });
  Object.assign(ALL, DATA.extras || {});

  const detail = byId("detail");
  const interestGrid = byId("interestGrid");
  const chapterNav = byId("chapterNav");

  interestGrid.innerHTML = (DATA.interests || []).map(item => `
    <button class="interest-card" data-key="${item.key}" type="button" aria-controls="detail">
      <small>${item.label}</small><strong>${item.title}</strong><span>${item.note} →</span>
    </button>`).join("");

  // 目次の並び順。navOrder があればそれに従い、無ければ章の定義順
  const navKeys = DATA.navOrder || Object.keys(ALL);
  const NAV_ITEMS = navKeys.map(k => ALL[k]).filter(Boolean);
  chapterNav.innerHTML = NAV_ITEMS.map(item => `
    <button class="chapter-tab" data-key="${item.key}" type="button" aria-controls="detail">${item.label} ${item.short || ""}</button>
  `).join("");

  /* ---------- 各章の背景にある本 ----------
     asin … Amazon の商品URL末尾 (/dp/XXXXXXXXXX)。書影もこれで引きます */
  function renderRefs(key) {
    const list = (DATA.refs || {})[key] || [];
    if (!list.length) return "";
    return `
      <p class="d-h">この章の背景にある本</p>
      <ul class="refs">${list.map(r => `
        <li><a class="ref" href="${amazonUrl(r.asin)}" rel="noopener sponsored" target="_blank">
          <img src="${coverUrl(r.asin)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
          <span class="ref-body">
            <span class="ref-title">${r.title}</span>
            <span class="ref-by">${r.by}</span>
            ${r.note ? `<span class="ref-note">${r.note}</span>` : ""}
            <span class="ref-go">Amazonで見る →</span>
          </span>
        </a></li>`).join("")}</ul>`;
  }

  function render(key, { scroll = false } = {}) {
    const d = ALL[key];
    if (!d) return;
    detail.style.setProperty("--dc", d.color);
    detail.innerHTML = `
      <div class="detail-top">
        <div class="detail-summary">
          <p class="d-label">${d.label}</p>
          <h2 class="d-title">${d.title}</h2>
          <p class="d-catch">${d.catch}</p>
          <p class="d-lead">${d.lead}</p>
          <p class="d-h">こんなときに開く</p>
          <ul class="chips">${d.when.map(w => `<li>${w}</li>`).join("")}</ul>
          ${d.quote ? `<p class="quote">${d.quote}</p>` : ""}
        </div>
        <div>
          <p class="d-h">この章で扱うこと</p>
          <ul class="points">${d.points.map(([h, b]) => `<li><b>${h}</b><span>${b}</span></li>`).join("")}</ul>
          <details class="detail-more">
            <summary>${renderRefs(key) ? "キーワードと、この章の背景にある本を見る" : "キーワードを見る"}</summary>
            <ul class="tags">${d.tags.map(t => `<li>${t}</li>`).join("")}</ul>
            ${renderRefs(key)}
          </details>
        </div>
      </div>
    `;

    document.querySelectorAll(".interest-card, .chapter-tab").forEach(el => {
      el.classList.toggle("is-active", el.dataset.key === key);
      el.setAttribute("aria-pressed", String(el.dataset.key === key));
      if (el.classList.contains("chapter-tab")) el.style.setProperty("--dc", d.color);
    });

    if (scroll) {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      requestAnimationFrame(() => detail.scrollIntoView({ behavior, block: "start" }));
    }
  }

  document.querySelectorAll(".interest-card, .chapter-tab").forEach(el => {
    el.addEventListener("click", () => render(el.dataset.key, { scroll: true }));
  });

  render(DATA.defaultKey || (DATA.chapters && DATA.chapters[0] && DATA.chapters[0].key));

  /* ---------- 著者の他の書籍マップ ----------
     books/catalog.js から、いま見ている本以外を並べます。
     書籍を追加したら catalog.js に1行足すだけで、全ページに反映されます。 */
  const siblings = CATALOG.filter(b => b.slug !== DATA.slug);
  const siblingsEl = byId("siblings");
  if (siblingsEl) {
    if (!siblings.length) {
      siblingsEl.hidden = true;
    } else {
      // base はサイトのトップへ戻る相対パス（トップ自身は "./"、1階層下なら "../"）
      const base = DATA.base || "./";
      // 公開時はディレクトリのままで綺麗なURLになる。file:// で開いたときだけ
      // ディレクトリを開けないので index.html を補う。
      const local = location.protocol === "file:";
      const link = b => base + b.path + (local ? "index.html" : "");
      siblingsEl.innerHTML = `
        <p class="siblings-h">著者の他の書籍マップ</p>
        <div class="siblings-grid">${siblings.map(b => `
          <a class="sibling" href="${link(b)}">
            <img src="${coverUrl(b.asin)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
            <span class="sibling-body">
              <span class="sibling-title">${b.title}</span>
              <span class="sibling-note">${b.note}</span>
              <span class="sibling-go">章構成マップを見る →</span>
            </span>
          </a>`).join("")}</div>`;
    }
  }
})();
