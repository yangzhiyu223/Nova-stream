# Nova Stream

视频站前端静态页面，纯 HTML / CSS / JS，无后端依赖。

## 本地预览

直接双击 `index.html`，或起个静态服务器：

```powershell
python -m http.server 8080
```

然后访问 http://localhost:8080

## 目录结构

```
index.html       首页推荐流
categories.html  分类浏览
search.html      搜索结果
watch.html       播放详情
creators.html    创作者列表
creator.html     创作者主页
feed.html        动态时间线
friends.html     好友与私聊
messages.html    消息中心
profile.html     我的主页
settings.html    账号设置
upload.html      创作中心
login.html       登录注册
404.html         404
empty.html       空状态

css/style.css    基础版式与变量
css/extra.css    组件扩展
js/data.js       数据：VIDEOS / CATS / CREATORS / RECOMMEND
js/notify.js     站内通知
docs/            架构脑图
```

## 部署

推送后用 GitHub Pages，来源选 `main` 分支根目录，无需构建。
