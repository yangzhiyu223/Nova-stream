/* ---------- 通知面板 ---------- */
(function () {
  const READ_KEY = "ns_noti_read";

  const NOTIS = [
    { id:"n1", type:"video", who:"Maya Chen", ava:"ph-1",
      t:"发了新视频《城市夜景延时 · 上海天际线》", time:"10 分钟前",
      href:"watch.html?t=" + encodeURIComponent("城市夜景延时 · 上海天际线") + "&u=" + encodeURIComponent("Maya Chen") },
    { id:"n2", type:"reply", who:"Kai Tanaka", ava:"ph-6",
      t:"回复了你的评论「这个配色我可以」", time:"1 小时前",
      href:"feed.html" },
    { id:"n3", type:"sub", who:"Luna Park", ava:"ph-7",
      t:"关注了你", time:"3 小时前",
      href:"feed.html?type=fans" },
    { id:"n4", type:"system", who:"Nova Stream", ava:"ph-0",
      t:"你订阅的 3 位创作者本周有更新", time:"昨天",
      href:"feed.html" },
    { id:"n5", type:"video", who:"Music Vibes", ava:"ph-8",
      t:"发布了合集《白噪音》第二集", time:"2 天前",
      href:"watch.html?t=" + encodeURIComponent("雨后森林 · 白噪音一小时") + "&u=" + encodeURIComponent("Music Vibes") }
  ];

  window.NS_NOTI = NOTIS;
  window.nsNotiRead = function () {
    try { return JSON.parse(localStorage.getItem(READ_KEY)) || []; } catch (e) { return []; }
  };
  window.nsNotiSetRead = function (v) { localStorage.setItem(READ_KEY, JSON.stringify(v)); };

  function getRead() {
    try { return JSON.parse(localStorage.getItem(READ_KEY)) || []; } catch(e) { return []; }
  }
  function setRead(v) { localStorage.setItem(READ_KEY, JSON.stringify(v)); }

  function badgeHtml(n) {
    return n ? `<span class="noti-dot">${n > 9 ? "9+" : n}</span>` : "";
  }

  function build(btn) {
    const wrap = document.createElement("div");
    wrap.className = "noti-wrap";
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);
    btn.classList.add("noti-btn");
    btn.setAttribute("aria-label", "通知");

    const panel = document.createElement("div");
    panel.className = "noti-panel";
    panel.innerHTML = `
      <div class="noti-head">
        <strong>通知</strong>
        <button class="noti-clear" type="button">全部已读</button>
      </div>
      <div class="noti-list"></div>
      <div class="noti-foot"><a href="feed.html">查看全部动态 →</a></div>`;
    wrap.appendChild(panel);

    const list = panel.querySelector(".noti-list");
    const dotHost = btn;

    function refresh() {
      const read = getRead();
      const unread = NOTIS.filter(n => !read.includes(n.id)).length;
      dotHost.innerHTML = "🔔" + badgeHtml(unread);

      list.innerHTML = NOTIS.map(n => `
        <button class="noti-item ${read.includes(n.id) ? "" : "unread"}" data-id="${n.id}" type="button">
          <div class="ava ${n.ava}" style="border-radius:50%"></div>
          <div class="noti-txt">
            <p><b>${n.who}</b> ${n.t}</p>
            <span>${n.time}</span>
          </div>
          ${read.includes(n.id) ? "" : '<i class="n-dot"></i>'}
        </button>`).join("");
    }

    function open() {
      document.querySelectorAll(".noti-panel.show").forEach(p => p.classList.remove("show"));
      panel.classList.add("show");
      btn.classList.add("on");
      refresh();
    }
    function close() { panel.classList.remove("show"); btn.classList.remove("on"); }

    btn.addEventListener("click", e => {
      e.stopPropagation();
      panel.classList.contains("show") ? close() : open();
    });

    panel.addEventListener("click", e => {
      e.stopPropagation();
      const item = e.target.closest(".noti-item");
      if (item) {
        const read = getRead();
        if (!read.includes(item.dataset.id)) { read.push(item.dataset.id); setRead(read); }
        refresh();
        const n = NOTIS.find(x => x.id === item.dataset.id);
        if (n && n.href) location.href = n.href;
        return;
      }
      if (e.target.closest(".noti-foot a")) return;
      if (e.target.closest(".noti-clear")) {
        setRead(NOTIS.map(n => n.id));
        refresh();
      }
    });

    document.addEventListener("click", close);
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

    refresh();
    return { refresh, open, close };
  }

  const ready = document.readyState !== "loading";
  function init() {
    document.querySelectorAll(".icon-btn[title='消息'], .icon-btn.noti").forEach(b => {
      if (b.dataset.notiReady) return;
      b.dataset.notiReady = "1";
      build(b);
    });
  }
  if (ready) init();
  else document.addEventListener("DOMContentLoaded", init);
  window.nsInitNoti = init;
})();
