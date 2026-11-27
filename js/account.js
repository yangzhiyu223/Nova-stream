/* ---------- 本地账号系统（存 localStorage，不上传） ----------
   账号库：ns_accounts  [{ user, mail, pwd, nick, ava, at }]
   当前登录：ns_user（用户名），未登录 = 游客
   顺手把旧的 sessionStorage.ns_user 迁过来
--------------------------------------------------------- */
(function () {
  const ACC_KEY = "ns_accounts";
  const CUR_KEY = "ns_user";

  function readJSON(k, d) {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      return v === null ? d : v;
    } catch (e) { return d; }
  }
  function writeJSON(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  }

  /* 简易可逆混淆，防止一眼看到明文；本地演示够用，不是真加密 */
  function mask(s) {
    try { return "b64:" + btoa(unescape(encodeURIComponent(s))); }
    catch (e) { return s; }
  }
  function unmask(s) {
    if (typeof s !== "string" || s.indexOf("b64:") !== 0) return s;
    try { return decodeURIComponent(escape(atob(s.slice(4)))); }
    catch (e) { return s; }
  }

  window.NSAuth = {
    accounts() { return readJSON(ACC_KEY, []); },

    /* 当前登录用户对象，游客返回 null */
    current() {
      const name = localStorage.getItem(CUR_KEY);
      if (!name) return null;
      return this.accounts().find(a => a.user === name) || null;
    },
    name() {
      const u = this.current();
      return u ? (u.nick || u.user) : "";
    },
    loggedIn() { return !!this.current(); },
    isGuest() { return !this.loggedIn(); },

    /* 注册：用户名/邮箱不能重复 */
    signup(user, mail, pwd) {
      user = String(user || "").trim();
      mail = String(mail || "").trim().toLowerCase();
      const list = this.accounts();
      if (list.some(a => a.user.toLowerCase() === user.toLowerCase()))
        return { ok: false, msg: "这个用户名已经注册过了，直接登录吧" };
      if (list.some(a => (a.mail || "").toLowerCase() === mail))
        return { ok: false, msg: "这个邮箱已经绑过账号了" };
      const acc = {
        user: user,
        mail: mail,
        pwd: mask(pwd),
        nick: user,
        ava: "ph-" + (Math.floor(Math.random() * 8) + 1),
        at: Date.now()
      };
      list.push(acc);
      if (!writeJSON(ACC_KEY, list)) return { ok: false, msg: "本地存不下了，清一点空间再试" };
      this.login(user);
      return { ok: true, user: user };
    },

    /* 登录：用户名或邮箱都行 */
    login(idOrMail, pwd) {
      const key = String(idOrMail || "").trim().toLowerCase();
      const acc = this.accounts().find(a =>
        a.user.toLowerCase() === key || (a.mail || "").toLowerCase() === key);
      if (!acc) return { ok: false, msg: "没找到这个账号，先注册一个？" };
      if (pwd !== undefined && unmask(acc.pwd) !== pwd)
        return { ok: false, msg: "密码不对，再想想" };
      localStorage.setItem(CUR_KEY, acc.user);
      try { sessionStorage.removeItem("ns_user"); } catch (e) {}
      document.dispatchEvent(new CustomEvent("ns:auth", { detail: { user: acc.user } }));
      return { ok: true, user: acc.user };
    },

    /* 免密登录（注册完自动登录、找回密码后） */
    loginAs(user) { return this.login(user); },

    logout() {
      localStorage.removeItem(CUR_KEY);
      document.dispatchEvent(new CustomEvent("ns:auth", { detail: { user: null } }));
    },

    /* 注销：核对密码后把账号从本地库里删掉 */
    remove(user, pwd) {
      const list = this.accounts();
      const acc = list.find(a => a.user === user);
      if (!acc) return { ok: false, msg: "没找到这个账号" };
      if (unmask(acc.pwd) !== pwd) return { ok: false, msg: "密码不对，再想想" };
      writeJSON(ACC_KEY, list.filter(a => a.user !== user));
      localStorage.removeItem(CUR_KEY);
      document.dispatchEvent(new CustomEvent("ns:auth", { detail: { user: null } }));
      return { ok: true };
    },

    /* 找回密码：用邮箱换用户名 */
    findByMail(mail) {
      const m = String(mail || "").trim().toLowerCase();
      return this.accounts().find(a => (a.mail || "").toLowerCase() === m) || null;
    },
    resetPwd(mail, newPwd) {
      const list = this.accounts();
      const acc = list.find(a => (a.mail || "").toLowerCase() === String(mail || "").trim().toLowerCase());
      if (!acc) return { ok: false, msg: "没找到这个邮箱绑定的账号" };
      acc.pwd = mask(newPwd);
      writeJSON(ACC_KEY, list);
      return { ok: true, user: acc.user };
    },
    checkPwd(idOrMail, pwd) {
      const key = String(idOrMail || "").trim().toLowerCase();
      const acc = this.accounts().find(a =>
        a.user.toLowerCase() === key || (a.mail || "").toLowerCase() === key);
      return !!acc && unmask(acc.pwd) === pwd;
    },

    /* ---------- 游客拦截 ---------- */
    requireLogin(why) {
      if (this.loggedIn()) return true;
      window.NSAuth.askLogin(why);
      return false;
    },

    askLogin(why) {
      const maskEl = document.createElement("div");
      maskEl.className = "lg-gate-mask";
      maskEl.innerHTML =
        '<div class="lg-gate" role="dialog" aria-modal="true">' +
          '<div class="lg-gate-badge">游客模式</div>' +
          '<h2>' + (why ? why + "前先登个号" : "先登录一下") + '</h2>' +
          '<p>游客可以随便看视频。点赞、留言、关注、收藏这些，需要账号。</p>' +
          '<p class="lg-gate-sub">账号只存在你自己电脑的浏览器里，不会上传。</p>' +
          '<div class="lg-gate-acts">' +
            '<a class="lg-gate-btn primary" href="login.html?next=' +
              encodeURIComponent(location.pathname.split("/").pop() + location.search) + '">去登录 / 注册</a>' +
            '<button type="button" class="lg-gate-btn">再逛逛</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(maskEl);
      function close() { maskEl.remove(); document.removeEventListener("keydown", onKey); }
      function onKey(e) { if (e.key === "Escape") close(); }
      document.addEventListener("keydown", onKey);
      maskEl.querySelector("button").addEventListener("click", close);
      maskEl.addEventListener("click", e => { if (e.target === maskEl) close(); });
    },

    /* ---------- 顶部显示昵称/头像占位 ---------- */
    paintNav() {
      const n = this.name();
      document.querySelectorAll("[data-ns-account]").forEach(el => {
        el.textContent = n || "游客";
        el.title = n ? "已登录：" + n : "游客模式，点「登录」注册或登录";
        el.classList.toggle("ns-guest", !n);
      });
    }
  };

  /* 旧数据迁移 */
  try {
    const legacy = sessionStorage.getItem("ns_user");
    if (legacy && !localStorage.getItem(CUR_KEY)) {
      const list = readJSON(ACC_KEY, []);
      if (!list.some(a => a.user === legacy)) {
        list.push({ user: legacy, mail: "", pwd: "", nick: legacy, ava: "ph-1", at: Date.now() });
        writeJSON(ACC_KEY, list);
      }
      localStorage.setItem(CUR_KEY, legacy);
    }
    sessionStorage.removeItem("ns_user");
  } catch (e) {}

  /* 需要登录的页面：profile / settings */
  function guardPage() {
    const page = location.pathname.split("/").pop() || "index.html";
    if (!/^(?:profile|settings)\.html$/.test(page)) return;
    if (window.NSAuth.loggedIn()) return;
    window.NSAuth.askLogin(page === "settings.html" ? "进账号设置" : "看个人主页");
    /* 弹窗关掉后没登录就回首页 */
    const back = () => {
      if (window.NSAuth.loggedIn()) return;
      if (!document.querySelector(".lg-gate-mask")) location.href = "index.html";
    };
    setInterval(back, 600);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (window.NSAuth) window.NSAuth.paintNav();
    guardPage();
    /* 顶栏/侧栏里需要登录的入口 */
    document.querySelectorAll(".ns-need-login").forEach(a => {
      if (window.NSAuth.loggedIn()) return;
      a.addEventListener("click", e => {
        if (window.NSAuth.loggedIn()) return;
        e.preventDefault();
        window.NSAuth.askLogin(a.textContent.trim() === "账号设置" ? "进账号设置" : "看个人主页");
      });
    });
  });
})();
