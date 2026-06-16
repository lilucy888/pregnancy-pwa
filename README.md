# 二胎孕妈助手 PWA

怀孕全周期管理工具，手机浏览器打开即用，可添加到桌面。

## 功能

| 功能 | 说明 |
|------|------|
| 仪表盘 | 孕周进度环、预产期倒计时、宝宝水果大小、今日待办、饮食建议 |
| 产检管理 | 12项推荐产检自动生成、记录每次结果、本地通知提醒 |
| 营养打卡 | 叶酸/铁剂/钙片/DHA 按孕周推荐、每日勾选、补打卡 |
| 饮食忌口 | 绝对避免 / 谨慎食用分类、搜索 |
| 体重曲线 | 录入体重、自动绘制增长曲线图 |
| 胎动计数 | 28周解锁、10次计时器、异常提醒 |
| 待产包 | 勾选清单、进度条 |
| 二胎特色 | 大宝互动任务、准爸爸关怀任务 |

## 技术栈

React 18 + Vite 5 + Chart.js + PWA (vite-plugin-pwa)

## 本地运行

```bash
cd pregnancy-pwa
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可。

## 免费部署

### 方案一：Vercel（推荐，国内可访问）

1. 把代码推送到 GitHub
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
3. 点击「New Project」→ 导入你的仓库
4. 框架选 **Vite**，点击 Deploy
5. 1分钟后得到 `https://xxx.vercel.app` 域名
6. 手机浏览器打开即可使用，Safari/Chrome 都能添加到桌面

### 方案二：Netlify

1. 本地构建：`npm run build`
2. 打开 [app.netlify.com](https://app.netlify.com)
3. 把 `dist/` 文件夹拖入页面
4. 自动部署完成，得到 `https://xxx.netlify.app` 域名

### 方案三：GitHub Pages

1. 本地构建：`npm run build`
2. 把 `dist/` 内容推送到 GitHub 仓库的 `gh-pages` 分支
3. Settings → Pages → 选择 `gh-pages` 分支
4. 得到 `https://你的用户名.github.io/仓库名/`

## PWA 特性

- **添加到桌面**：浏览器菜单 →「添加到主屏幕」，之后像 App 一样打开
- **离线可用**：首次加载后缓存所有资源，断网也能使用
- **本地通知**：服药提醒和产检提醒通过浏览器通知推送（需授权）

## 项目结构

```
pregnancy-pwa/
├── index.html
├── package.json
├── vite.config.js          # PWA 插件配置
├── public/
│   ├── icon-192.png        # PWA 图标（需替换）
│   └── icon-512.png
└── src/
    ├── main.jsx
    ├── App.jsx             # 路由 + 提醒逻辑
    ├── index.css           # 全局样式（暖粉色系）
    ├── context/
    │   └── UserContext.jsx  # 用户数据 Context
    ├── utils/
    │   ├── gestation.js    # 孕周计算
    │   ├── constants.js    # 常量数据
    │   └── storage.js      # localStorage 封装
    ├── components/
    │   ├── TabBar.jsx       # 底部导航
    │   └── Card.jsx         # 卡片容器
    └── pages/
        ├── HomePage.jsx     # 首页仪表盘
        ├── CheckinPage.jsx  # 每日打卡
        ├── RecordPage.jsx   # 体重+胎动入口
        ├── KnowledgePage.jsx# 知识/互动
        ├── SettingsPage.jsx # 设置/我的
        ├── CheckupList.jsx  # 产检列表
        ├── CheckupDetail.jsx# 产检详情
        ├── DietPage.jsx     # 饮食忌口
        ├── FetalPage.jsx    # 胎动计时器
        └── HospitalBagPage.jsx # 待产包
```

## PWA 图标

`public/` 目录下的 `icon-192.png` 和 `icon-512.png` 目前是占位文件。你可以用任意工具生成两个 PNG 图标替换它们，例如：
- 打开 Figma/Canva 做一个粉底白心图标
- 或者用 favicon-generator 生成
