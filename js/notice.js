/* 学生作业提示：首次进入弹出一次，确认后本次会话不再出现 */
(function () {
  var KEY = "ns_notice_seen";
  try {
    if (sessionStorage.getItem(KEY)) return;
  } catch (e) {}

  function build() {
    var wrap = document.createElement("div");
    wrap.className = "ns-notice-mask";
    wrap.innerHTML =
      '<div class="ns-notice" role="dialog" aria-modal="true" aria-labelledby="nsNoticeTitle">' +
        '<div class="ns-notice-badge">学生个人作品</div>' +
        '<h2 id="nsNoticeTitle">演示站点说明</h2>' +
        '<p>本页面为课程作业，站内视频、创作者与评论均为虚构示例数据，仅用于界面与交互演示，不提供真实内容服务。</p>' +
        '<p class="ns-notice-sub">部分功能为界面演示，刷新后状态可能重置。</p>' +
        '<button type="button" class="ns-notice-btn">我知道了，开始浏览</button>' +
      '</div>';

    var style = document.createElement("style");
    style.textContent =
      ".ns-notice-mask{position:fixed;inset:0;background:rgba(6,9,16,.62);backdrop-filter:blur(8px);" +
      "display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999;" +
      "animation:nsFade .22s ease-out}" +
      ".ns-notice{background:linear-gradient(160deg,rgba(30,37,58,.98),rgba(18,23,38,.98)) !important;" +
      "border:1px solid rgba(255,255,255,.12);border-radius:24px;max-width:440px;width:100%;padding:34px 32px 28px;" +
      "box-shadow:0 34px 90px rgba(0,0,0,.7);text-align:center;animation:nsRise .28s cubic-bezier(.2,.8,.3,1)}" +
      ".ns-notice-badge{display:inline-block;font-size:12px;letter-spacing:.14em;color:#ffb057;" +
      "background:rgba(255,138,61,.14);border:1px solid rgba(255,138,61,.28);padding:5px 14px;border-radius:999px;margin-bottom:16px}" +
      ".ns-notice h2{font-size:21px;color:#fff;margin:0 0 14px;font-weight:700;letter-spacing:.01em}" +
      ".ns-notice p{font-size:14px;line-height:1.8;color:rgba(255,255,255,.62);margin:0 0 10px;text-align:left}" +
      ".ns-notice-sub{color:rgba(255,255,255,.42);font-size:13px}" +
      ".ns-notice-btn{margin-top:16px;width:100%;border:0;border-radius:14px;padding:13px 0;cursor:pointer;" +
      "font-size:15px;font-weight:700;color:#241304;background:linear-gradient(100deg,#ff8a3d,#ffb057);" +
      "box-shadow:0 12px 28px rgba(255,138,61,.34);" +
      "transition:transform .15s ease,box-shadow .15s ease;font-family:inherit}" +
      ".ns-notice-btn:hover{transform:translateY(-1px);box-shadow:0 14px 32px rgba(255,138,61,.45)}" +
      "@keyframes nsFade{from{opacity:0}to{opacity:1}}" +
      "@keyframes nsRise{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}" +
      "@media (max-width:480px){.ns-notice{padding:28px 22px 22px}.ns-notice h2{font-size:18px}}";

    document.head.appendChild(style);

    function close() {
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      wrap.style.animation = "nsFade .18s ease-in reverse";
      setTimeout(function () { wrap.remove(); }, 170);
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape" || e.key === "Enter") close(); }

    wrap.querySelector(".ns-notice-btn").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return wrap;
  }

  function mount() {
    document.body.appendChild(build());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
