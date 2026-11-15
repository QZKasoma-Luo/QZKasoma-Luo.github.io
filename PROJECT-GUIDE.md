# 项目架构与增改说明

> 给下一个新 session 的秧秧：先读这份，再读 `README.md`、`docs/TECH.md`、`docs/content-fact-sheet.md`。
> 当前线上：<https://qzkasoma-luo.github.io>（英文 `/`、简体中文 `/zh/`、日文 `/ja/`）。

## 0. 五分钟接手

1. 进项目：`cd ~/projects/qz-homepage`
2. 读 `README.md` 的 “Run it / Languages / Quality checks”
3. 读 `docs/content-fact-sheet.md`，确认哪些内容能写、哪些不能写
4. 改完跑：`npm run check && npm run build && npm run i18n:offline`
5. 本地预览 + QA（见第 7 节）
6. 获得哥哥本次同意后再 `git push origin main`

不要建 goal，不要自动续行；大任务拆小步，每步汇报。

## 1. 一句话架构

Astro 7 静态站 → `npm run build` 生成英文 `dist/` → `scripts/i18n-build.mjs` 用 DeepSeek 翻译并写入 `/zh/`、`/ja/` 静态副本 → GitHub Actions 跑离线翻译缓存 → 上传 `dist/` 到 GitHub Pages。

```
src/content/*.md  ──┐
src/data/site.yaml ─┼─> astro build ─> dist/ (English)
src/pages/*.astro  ─┘                      │
                                           ├─> scripts/i18n-build.mjs
                                           │      ├─ DeepSeek (only missing strings)
                                           │      ├─ src/i18n/cache/{zh,ja}.json
                                           │      ├─ dist/zh/**, dist/ja/**
                                           │      ├─ localized RSS
                                           │      └─ sitemap append
                                           └─> GitHub Pages
```

## 2. 目录

```
src/
  components/        Header / Footer / Opening / LocaleScroll
  content/
    pages/           about.md（首页 About 正文）
    projects/        cuda-knn.md, changeover-dashboard.md, rag-demo.md, iot-iout-validation.md
    research/        ieee-access-iout-ddos.md, dp-hierarchical-counts.md
    experience/      research-assistant-solids.md, teaching-assistant-seng321.md, flex.md, nicholson.md
    blog/            4 篇 2023 课程笔记
  data/site.yaml     姓名、标题、描述、tagline、focus、社交链接、简历路径
  i18n/cache/        zh.json / ja.json（已提交，CI 离线构建用）
  layouts/BaseLayout.astro
  lib/content.ts     isPublic / byOrder
  pages/             index、projects、research、blog、feed、rss.xml、404
  styles/global.css  设计 token、导航、玻璃、通用排版
scripts/
  i18n-build.mjs     构建时翻译 + 本地化路由 + RSS + sitemap
  qa-browsers.mjs    三浏览器首页截图
  three-browser-pages.mjs  三浏览器关键页检查
  test-intro.mjs     开场动画行为
  check-links.mjs    死链
  scan-private.mjs   隐私扫描
  axe.mjs            WCAG A/AA
  record-intro.mjs   录开场视频
public/
  Qingze_Luo_Resume.pdf
  avatar-pig.jpg / favicon.ico / favicon.png / apple-touch-icon.png
  fonts/             self-hosted WOFF2
```

旧 Hexo 站的根目录文件（`index.html`、`images/`、`style/`、`js/`、`about/`、`WkExperience/` 等）只作参考和备份，**不是新站构建输入**；不要混进 `src/`。

## 3. 内容模型

| Collection | 用途 | 关键字段 |
| --- | --- | --- |
| `site` | 全站元数据 | `name`, `title`, `description`, `tagline`, `focus`, `socials`, `resume` |
| `pages` | About 正文 | `title`, `description`, `draft`, `verified` |
| `projects` | 项目 | `title`, `summary`, `year`, `kind`, `status`, `tags`, `links`, `featured`, `order`, `draft`, `verified` |
| `research` | 论文 | `title`, `summary`, `year`, `authors`, `venue`, `status`, `tags`, `links`, `featured`, `order` |
| `experience` | 经历 | `role`, `org`, `location`, `start`, `end`, `current`, `bullets`, `order` |
| `blog` | 文章 | `title`, `description`, `date`, `tags`, `courseNotes`, `draft` |

发布规则在 `src/lib/content.ts`：

- `draft: true` 或 `verified: false` 的条目**不会进生产构建**；
- 本地要看草稿：`INCLUDE_DRAFTS=1 npm run build`；
- 公开内容必须核对简历或哥哥的直接确认，不能编造数字/日期/作者顺序/部署状态。

当前公开内容：4 段经历、IEEE Access 论文、CUDA KNN（group）、Flextronics 看板（independent / not deployed）、RAG demo（in progress）、4 篇课程笔记。
仍是草稿：DP 论文、IoUT 项目（IoUT 已并入 SOLIDS Lab 经历）。

## 4. 设计系统

- Light：暖白档案纸 `#e5e3df`，近黑墨 `#0a0a0a`，烧橙 `#a83a22`，亮橙标记 `#ff7500`。
- Dark：近黑底 + 米白字 + 橙色强调；tokens 都在 `src/styles/global.css` 的 `:root` / `html[data-theme="dark"]`。
- 字体：Newsreader（标题）、Public Sans（正文）、IBM Plex Mono（标签），全部 self-hosted；不引入 Google Fonts / SF Pro / Apple 素材。
- 液态玻璃三层：`glass` 实底 → `glass-blur` 毛玻璃 → `glass-refract` SVG 折射；由 `BaseLayout.astro` 的 JS 探测，Firefox 走实底。
- 首页样式在 `src/pages/index.astro` 的 `<style>`（scoped）；通用样式在 `global.css`。
- 猪猪头像：`public/avatar-pig.jpg`；Header 和 About Profile 共用；favicon 是同一张图生成的 `.ico/.png` 与 `apple-touch-icon.png`。

## 5. 开场动画 / 语言切换

### 开场动画

文件：`src/components/Opening.astro`

- 1.78 秒，QL 线稿 + 准星 + 橙色扫描 + 结尾轻微故障。
- **每次刷新/直接进入会播放**；站内链接跳转不会重播（点击时写 `sessionStorage["qz-intro-skip-next"]`，目标页消费一次）。
- 点击/按键跳过；`prefers-reduced-motion` 直接跳过。
- `?intro=off` 只给 QA 截图用，正常用户不需要。
- 不要重新引入“localStorage 看过了就永远不播”，哥哥要的是刷新会播。
- 录视频：`BASE_URL=http://127.0.0.1:4322/ node scripts/record-intro.mjs`，再用 ffmpeg 转 H.264 720p；Telegram 发送上限 20MB（按要求控制在 20MB 内）。

### 语言切换

- `Header.astro` 里有 `nav.lang-switch` + 移动菜单 `.menu-langs`，链接带 `data-locale="en|zh|ja"`，`data-i18n-skip` 防止被翻译。
- 源码里的 `href` 是占位（`/`、`/zh/`、`/ja/`）；**构建后的 `i18n-build.mjs` 会把它们改写成当前页面对应语言**，例如 `/projects/` → `/zh/projects/`。
- 不要手工创建 `src/pages/zh/` 或 `src/pages/ja/`；三语页面由构建脚本生成。
- 新增一个页面时，只要它走 `BaseLayout`（Header 在），脚本会自动生成 `/zh/`、`/ja/` 版本并接好切换链接。
- **切换语言会保留当前阅读位置**：三语是三份静态文档，点切换是整页导航，浏览器默认回到顶部；`components/LocaleScroll.astro`（放在 `BaseLayout` 的 `<head>`）在点击时把「视口顶部所在带 id 的元素 + 偏移」写进 `sessionStorage`，目标页在 `DOMContentLoaded` 恢复；恢复期间 `<html class="locale-restoring">` 隐藏 body，避免先闪一下顶部（规则在 `global.css`）。字体/图片加载完会在读者未滚动时再校正一次。
- 如果目标页没有对应的 id 锚点，就退回复原原始 `scrollY`。不要改成“切换语言回顶部”，也不要手工在语言链接上加 `scrollTo(0, …)`。
- 回归测试：`BASE_URL=http://127.0.0.1:4322/ npm run test:locale`（桌面 + 移动折叠菜单，8 项）。

## 6. 三语翻译系统（重点）

### 原理

英文 HTML 是源文。`scripts/i18n-build.mjs` 在 `astro build` 之后：

1. 读取 `dist/**/*.html`（排除 `zh/`、`ja/`）；
2. 用 Cheerio 提取可见文本块、`alt/title/aria-label`、`<title>`、meta description / og / twitter；
3. 只把**缓存里没有的字符串**发给 DeepSeek（`deepseek-chat`），带术语表和语气要求；
4. 把译文写入 `src/i18n/cache/zh.json` / `ja.json`；
5. 生成 `dist/zh/**`、`dist/ja/**`；
6. 改写站内链接（PDF/图片等资源不前缀），保留当前页语言切换，补 canonical / hreflang / og:locale；
7. 生成 `/zh/rss.xml`、`/ja/rss.xml`；
8. 把 zh/ja URL 追加到 `dist/sitemap-0.xml`。

### 常用命令

```bash
# 本地：翻译新增/改动内容（需要 DeepSeek key）
npm run i18n

# CI / 离线：只读缓存重建三语页面（不需要 key）
npm run i18n:offline

# 只试一个语言/一个页面（调试）
node scripts/i18n-build.mjs --locale=zh --limit=3
```

本地 key 来源：`DEEPSEEK_API_KEY` 环境变量，或 `~/.dsh/.credentials.yaml` 里的 `refs.DEEPSEEK_API_KEY`。**不要把 key 写进仓库或页面。**

### 缓存与成本

- 缓存是 `src/i18n/cache/zh.json` + `ja.json`，当前约 352 条、合计 ~238KB；
- 缓存 key 是英文 HTML 字符串（含 Astro scoped 属性）。如果大改 CSS 导致 `data-astro-cid-*` 变化，可能触发一批重译；跑 `npm run i18n` 即可，成本很小；
- 不要为了省缓存去提交三份翻译 Markdown；现在这套只多两个 JSON，仓库 pack 仍约 24.5MB。

### 术语

`scripts/i18n-build.mjs` 顶部有：

- `GLOSSARY`：保留英文的专有名词（University of Victoria、IEEE Access、CUDA、co-op 等）；
- `SYSTEM_PROMPTS`：中文/日文语气；
- `TERM_OVERRIDES`：输出后统一替换（例如 `IT audit` → `IT 审计` / `IT 監査`、`Independent` → `独立项目`）。

发现固定译法不对：改 `TERM_OVERRIDES`，跑 `npm run i18n:offline` 重新生成，不用重翻全站。

### CI

`.github/workflows/deploy.yml`：

```
npm ci → npm run check → npm run build → npm run i18n:offline → upload dist → deploy
```

CI 不传 `DEEPSEEK_API_KEY`。如果新增英文内容没跑过本地 `npm run i18n`，`i18n:offline` 会失败并告诉缺哪些字符串；本地补翻、提交 cache 即可。

## 7. 常见增改 recipe

### 改个人信息 / 首页文案

1. 改 `src/data/site.yaml`（title/description/tagline/focus/resume/socials）；
2. 改 `src/content/pages/about.md`（首页 About 正文）；
3. `npm run build && npm run i18n`；
4. 看 `/zh/`、`/ja/` 首页，提交 cache。

### 加一个项目

1. 在 `src/content/projects/` 新建 `<slug>.md`；
2. 字段按 `src/content.config.ts`；`kind` 用 `group` / `independent` / `research` / `coursework`；
3. 真实才写 `verified: true`、`draft: false`；不确定就留草稿；
4. `order` 控制顺序；`featured` 控制首页卡片；
5. `npm run build && npm run i18n`，检查英文/中文/日文项目页和首页卡片。

### 加一篇论文

1. `src/content/research/<slug>.md`；
2. `authors` 按简历顺序；`venue`、`year`、`status`、`links.doi` 必须真实；
3. `npm run build && npm run i18n`。

### 加一段经历

1. `src/content/experience/<slug>.md`；
2. `start` / `end` / `current` 要和简历一致；`order` 倒序；
3. 跑 build + i18n。

### 加一篇 blog

1. `src/content/blog/<slug>.md`；
2. `date`、`description`、`tags`；旧课程笔记加 `courseNotes: true`；
3. 发布设 `draft: false`；
4. build + i18n；RSS 会自动包含。

### 换头像 / favicon

1. 原图放 `public/avatar-pig.jpg`；
2. 生成 `public/favicon.png`（192）、`public/favicon.ico`（64）、`public/apple-touch-icon.png`（180）；
3. `BaseLayout.astro` 的 icon link 已指向这些文件；
4. Header 和 About Profile 都引用 `/avatar-pig.jpg`，不需要改三语文案。

### 改样式

- 全站 token / 导航 / 玻璃：`src/styles/global.css`
- 首页专属：`src/pages/index.astro` 的 scoped `<style>`
- 内页：对应 page 的 scoped `<style>`
- 改完 `npm run build && npm run i18n:offline`；如果 scoped hash 变了导致 cache miss，再跑 `npm run i18n`。

### 加新页面

1. 在 `src/pages/` 建 `.astro`，用 `BaseLayout`；
2. 在 `Header.astro` / `Footer.astro` 或页面里加链接；
3. `npm run build` → 脚本会自动生成 `/zh/`、`/ja/` 版本、hreflang 和 sitemap；
4. `npm run i18n` 补新文案。

### 改 RSS / Feed 页

- RSS 源：`src/pages/rss.xml.ts`（Astro 生成英文）；
- 本地化 RSS 由 `i18n-build.mjs` 的 `translateRss()` 生成；
- Feed 说明页：`src/pages/feed.astro`；改完 build + i18n。

## 8. QA（发布前必跑）

```bash
cd ~/projects/qz-homepage
npm run check
npm run build
npm run i18n:offline
python3 -m http.server 4322 -d dist   # 另一个终端
BASE_URL=http://127.0.0.1:4322/ npm run test:intro
BASE_URL=http://127.0.0.1:4322/ npm run test:locale
BASE_URL=http://127.0.0.1:4322/ npm run qa:browsers
npm run qa:pages
BASE_URL=http://127.0.0.1:4322/ npm run check:links
npm run check:private
BASE_URL=http://127.0.0.1:4322/ node scripts/axe.mjs
```

当前基线（2026-11-15）：

- `npm run check`：0 errors / 0 warnings / 0 hints
- `qa:pages`：15 个页面 × 2 视口 × 3 浏览器，全过
- axe：32 个页面/主题组合 clean
- links：106 条，0 失败（LinkedIn 999 是反爬）
- private：0 处
- intro：8/8；locale scroll：8/8
- Lighthouse：手机 99/100/100/100；桌面 87/100/100/100（1.78s 开场影响 Speed Index；英文首页跳过开场 94）
- 结果文件：`docs/media/qa/lighthouse.json`、`docs/media/qa/three-browser-pages.json`、`docs/media/qa/report.json`

Lighthouse 需要单独跑，命令示例：

```bash
CHROME_PATH="$(node -e "console.log(require('playwright').chromium.executablePath())")" \
./node_modules/.bin/lighthouse http://127.0.0.1:4322/zh/ \
  --output=json --output-path=/tmp/lh-zh.json \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile --screenEmulation.mobile \
  --chrome-flags="--headless=new --no-sandbox" --quiet
```

## 9. 部署 / push

- 分支：`main` 就是线上；`rebuild-2026` 是历史重建分支。
- remote：`git@github-qz-homepage:QZKasoma-Luo/QZKasoma-Luo.github.io.git`（deploy key）。
- Pages Source：**GitHub Actions**（2026-11-15 已切）；旧的 `pages build and deployment` 不应再触发。若又出现 Jekyll 红叉，先检查 Pages Source，**不要加 `.nojekyll`**（会发布 repo 根目录旧站，覆盖新站）。
- `dist/` 在 `.gitignore`；不要提交。
- push 前必须获得哥哥本次同意；不要 `git push --force`。
- 部署后验证：`/`、`/zh/`、`/ja/`、`/zh/rss.xml`、`/ja/rss.xml`、语言切换是否保留当前页。

## 10. 坑 / 不要做

- ❌ 不要手工创建 `src/pages/zh/`、`src/pages/ja/`；那是脚本生成的。
- ❌ 不要手改 `dist/`；每次 build 会覆盖。
- ❌ 不要把 `DEEPSEEK_API_KEY` 写进代码、commit、客户端。
- ❌ 不要接入 Google Translate / Google Analytics / 第三方追踪。
- ❌ 不要为了翻译再复制三份 Markdown；缓存已经解决。
- ❌ 不要在未核对简历/哥哥确认时把 `verified` 改成 `true`。
- ❌ 不要删旧站文件/大图；先问哥哥。
- ❌ 不要把 `?intro=off` 当成正常入口；它只给 QA。
- ❌ 不要加会让 repo 变大的原始大图/视频；先压缩（图片 WebP/JPEG，视频 H.264 720p/20MB 内）。

## 11. 仍待确认

- CUDA 小组人数、哥哥的个人分工；
- DP 论文作者顺序、venue、状态；
- RAG demo 的检索内容、技术栈、是否有公开 repo/eval；
- 旧站大图是否清理（需哥哥同意）。

其余（设计 A、简历、LinkedIn、动画参考、blog 迁移、Pages、三语）都已定。
