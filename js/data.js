/* ---------- 假数据 ---------- */
const VIDEOS = [
  { t: "城市夜景延时 · 上海天际线", c: "Maya Chen", v: "12.8万", d: "08:24", ph: 1 },
  { t: "一周生活记录 · 工作室的清晨", c: "Studio Vlogs", v: "3.4万", d: "12:07", ph: 2 },
  { t: "我的极简桌面改造计划", c: "Tech Setup", v: "26.1万", d: "06:52", ph: 3 },
  { t: "深夜厨房 · 一人食拉面", c: "Cooking with Ben", v: "8.9万", d: "15:31", ph: 4 },
  { t: "山海之间的公路旅行", c: "Lila Travels", v: "44.2万", d: "22:18", ph: 5 },
  { t: "从零做一个自己的网站", c: "Tom's Tech", v: "5.7万", d: "31:05", ph: 6 },
  { t: "咖啡拉花入门十条", c: "Cooking with Ben", v: "1.9万", d: "09:12", ph: 7 },
  { t: "雨后森林 · 白噪音一小时", c: "Music Vibes", v: "67.3万", d: "1:02:04", ph: 8 }
];

const CATS = ["全部", "知识", "娱乐", "科技", "生活", "音乐", "游戏", "旅行"];

const CREATORS = [
  { n: "Maya Chen", d: "生活 · 旅行 · 创意", f: "1.2M", ph: 1, sub: true },
  { n: "Tom's Tech", d: "数码 · 评测", f: "860K", ph: 3, sub: false },
  { n: "Lila Travels", d: "旅行 · 影像", f: "1.6M", ph: 5, sub: false },
  { n: "GameZone", d: "游戏 · 实况", f: "2.3M", ph: 6, sub: true },
  { n: "Cooking with Ben", d: "美食 · 日常", f: "540K", ph: 4, sub: false },
  { n: "Fit Life", d: "健身 · 生活方式", f: "390K", ph: 2, sub: false },
  { n: "Music Vibes", d: "音乐 · 现场", f: "910K", ph: 8, sub: true },
  { n: "Studio Vlogs", d: "影像 · Vlog", f: "270K", ph: 7, sub: false }
];

const RECOMMEND = [
  { t: "海边的日落延时摄影", c: "Maya Chen", v: "9.8万", ph: 1 },
  { t: "一个人的旅行清单", c: "Lila Travels", v: "12.4万", ph: 5 },
  { t: "桌面布置第二期", c: "Tom's Tech", v: "6.2万", ph: 3 },
  { t: "雨夜城市 · 慢镜头", c: "Studio Vlogs", v: "4.1万", ph: 6 },
  { t: "一周只吃家常菜", c: "Cooking with Ben", v: "3.3万", ph: 4 }
];

/* ---------- 订阅状态（本地存，刷新也记得） ---------- */
const SUB_KEY = "ns_subs";
function getSubs(){
  let v = null;
  try { v = JSON.parse(localStorage.getItem(SUB_KEY)); } catch(e){}
  if (!Array.isArray(v)){
    v = CREATORS.filter(c => c.sub).map(c => c.n);
    localStorage.setItem(SUB_KEY, JSON.stringify(v));
  }
  return v;
}
function isSub(name){ return getSubs().includes(name); }
function setSub(name, on){
  let v = getSubs().filter(x => x !== name);
  if (on) v.push(name);
  localStorage.setItem(SUB_KEY, JSON.stringify(v));
  document.dispatchEvent(new CustomEvent("subs:change", { detail: { name: name, on: on } }));
  return v;
}
function toggleSub(name){ return setSub(name, !isSub(name)); }

/* ---------- 渲染视频卡 ---------- */

function videoCard(v) {
  const creator = CREATORS.find(c => c.n === v.c);
  const cph = creator ? creator.ph : v.ph;
  // 头像单独拎成链接，避免嵌在视频卡 <a> 里形成嵌套
  return `
    <div class="vcard">
      <a class="thumb-link" href="watch.html?t=${encodeURIComponent(v.t)}&u=${encodeURIComponent(v.c)}" aria-label="${v.t}">
        <div class="thumb">
          <div class="ph ph-${v.ph}"></div>
          <div class="play">▶</div>
          <span class="dur">${v.d}</span>
        </div>
      </a>
      <div class="meta">
        <a class="ava-link" href="creator.html?u=${encodeURIComponent(v.c)}" title="查看 ${v.c} 的主页">
          <div class="ava ph-${cph}" style="border-radius:50%"></div>
        </a>
        <div>
          <a class="title-link" href="watch.html?t=${encodeURIComponent(v.t)}&u=${encodeURIComponent(v.c)}"><h3>${v.t}</h3></a>
          <div class="sub">
            <a class="creator-link" href="creator.html?u=${encodeURIComponent(v.c)}">${v.c}</a>
            <span>·</span><span>${v.v} 次播放</span>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------- 顶部导航高亮 ---------- */
function markNav() {
  const file = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-page]").forEach(a => {
    if (a.dataset.page === file) a.classList.add("active");
  });
}
document.addEventListener("DOMContentLoaded", markNav);
