/* ---------- 顶部色环调色：拖动改背景色，点中心回默认 ---------- */
(function () {
  const KEY = "ns_hue";
  const DEF = 24;          // 默认色相（暖橙，和原来的深夜影厅一致）
  const IN_R = 22;         // 内圈半径(%)，以内算“中心”→ 点一下复位
  const MAX_DIST = 50;     // 到边缘的百分比

  // 色相 → 三层薄光的 rgba 颜色串（色相/亮度/透明度的换算放在 JS 里，避免 CSS 里 hsl+calc 不被支持）
  function hsl(h, s, l, a) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const f = n => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const to = n => Math.round(255 * f(n));
    return `rgba(${to(0)},${to(8)},${to(4)},${Math.max(0, +a.toFixed(3))})`;
  }

  // 色相 → 一句话（首页标题下面那行，跟着颜色换）
  const MOODS = [
    [12,  "现在这套是暖橙，最接近原版"],
    [42,  "偏琥珀了，像旧片场那盏灯"],
    [70,  "黄调，有点像清早开机前"],
    [150, "绿松石质感，安静得像森林"],
    [200, "青蓝，像水下的光"],
    [250, "靛蓝，深夜场次的感觉"],
    [300, "紫调，像影院散场那会儿"],
    [340, "玫瑰色，适合看一部爱情片"],
    [361, "又绕回暖橙了"]
  ];
  function moodOf(h) {
    for (const [end, txt] of MOODS) if (h < end) return txt;
    return MOODS[0][1];
  }

  function apply(hue, tint) {
    const root = document.documentElement;
    root.style.setProperty("--ns-hue", hue);
    root.style.setProperty("--ns-tint", tint + "%");
    const mood = document.getElementById("heroMood");
    if (mood) {
      mood.textContent = tint < 4 ? "拖动右上角的色环，整个页面会跟着换色" : moodOf(hue);
      mood.style.opacity = tint < 4 ? "0.55" : "1";
    }
    const t = tint / 100;                       // 0~1，越靠边越亮
    root.style.setProperty("--ns-c1", hsl(hue, 85, 62, 0.16 + t * 0.12));
    root.style.setProperty("--ns-c2", hsl((hue + 34) % 360, 90, 60, 0.12 + t * 0.11));
    root.style.setProperty("--ns-c3", hsl((hue + 180) % 360, 70, 55, 0.12 + t * 0.10));
  }

  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      if (v && typeof v.hue === "number") return v;
    } catch (e) {}
    return { hue: DEF, tint: 0 };
  }

  function save(hue, tint) {
    try { localStorage.setItem(KEY, JSON.stringify({ hue, tint })); } catch (e) {}
  }

  function init() {
    const glow = document.querySelector(".hero-glow");
    const st = load();
    apply(st.hue, st.tint);
    if (!glow) return;   // 没有色环的页面，只负责把保存的色相应用上

    // 初始状态：中心点 + 提示
    const dot = document.createElement("i");
    dot.className = "hue-dot";
    const hint = document.createElement("span");
    hint.className = "hue-hint";
    hint.textContent = "拖我换色 · 点中心还原";
    glow.appendChild(dot);
    glow.appendChild(hint);

    let hue = st.hue, tint = st.tint, dragging = false;

    function paintDot() {
      // 用极坐标把点放到当前色相位置
      const rad = (hue - 90) * Math.PI / 180;
      const r = (tint / 100) * MAX_DIST;
      dot.style.left = (50 + r * Math.cos(rad)) + "%";
      dot.style.top = (50 + r * Math.sin(rad)) + "%";
      dot.style.background = `hsl(${hue} 90% 62%)`;
    }
    paintDot();

    function pick(ev) {
      const r = glow.getBoundingClientRect();
      const x = ev.clientX - r.left - r.width / 2;
      const y = ev.clientY - r.top - r.height / 2;
      const dist = Math.hypot(x, y) / (r.width / 2) * 50; // 百分比

      if (dist <= IN_R) {          // 中心区域 → 回到默认
        reset();
        return;
      }
      let deg = Math.atan2(y, x) * 180 / Math.PI + 90;
      if (deg < 0) deg += 360;
      hue = Math.round(deg);
      tint = Math.min(100, Math.round(dist / MAX_DIST * 100));
      apply(hue, tint);
      paintDot();
    }

    function reset() {
      hue = DEF; tint = 0;
      apply(hue, tint); paintDot();
      save(hue, tint);
      glow.classList.remove("is-drag");
      dragging = false;
    }

    glow.addEventListener("pointerdown", e => {
      if (e.button !== 0) return;
      dragging = true;
      glow.classList.add("is-drag");
      glow.setPointerCapture(e.pointerId);
      pick(e);
      e.preventDefault();
    });
    glow.addEventListener("pointermove", e => {
      if (!dragging) return;
      pick(e);
    });
    glow.addEventListener("pointerup", e => {
      if (!dragging) return;
      glow.classList.remove("is-drag");
      dragging = false;
      save(hue, tint >= 8 ? tint : 0);
    });
    glow.addEventListener("pointercancel", () => {
      dragging = false;
      glow.classList.remove("is-drag");
    });

    // 点中心复位（触屏/键盘友好）
    glow.addEventListener("dblclick", reset);
    glow.setAttribute("tabindex", "0");
    glow.setAttribute("role", "button");
    glow.setAttribute("title", "拖动色环给背景换色，点中心回到默认");
    glow.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { reset(); e.preventDefault(); }
    });

    window.nsResetHue = reset;
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
