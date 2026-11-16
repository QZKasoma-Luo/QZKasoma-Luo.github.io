#!/usr/bin/env node
/**
 * Build-time translation pass.
 *
 * English is the source of truth. This script runs after `astro build`,
 * translates the visible English strings into Simplified Chinese, Japanese,
 * and Korean with DeepSeek, caches every translation, and writes static
 * /zh/, /ja/, and /ko/ copies of the generated HTML.
 *
 * The cache is committed so CI can run with --offline and no API key.
 */
import { readFileSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const CACHE_DIR = join(ROOT, 'src/i18n/cache');
const SITE = 'https://qzkasoma-luo.github.io';
const VERSION = 1;

const LOCALES = {
  zh: { htmlLang: 'zh-Hans', ogLocale: 'zh_CN', label: 'Simplified Chinese', rssLang: 'zh-cn' },
  ja: { htmlLang: 'ja', ogLocale: 'ja_JP', label: 'Japanese', rssLang: 'ja' },
  ko: { htmlLang: 'ko', ogLocale: 'ko_KR', label: 'Korean', rssLang: 'ko' },
};
const ALL_LANGS = ['en', 'zh', 'ja', 'ko'];
const HREFLANG = { en: 'en', zh: 'zh-Hans', ja: 'ja', ko: 'ko' };

const args = new Set(process.argv.slice(2));
const OFFLINE = args.has('--offline');
const LIMIT = Number([...args].find((a) => a.startsWith('--limit='))?.split('=')[1] || 0);
const ONLY_LOCALE = [...args].find((a) => a.startsWith('--locale='))?.split('=')[1];

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'PRE', 'CODE', 'SVG', 'MATH', 'TEXTAREA', 'NOSCRIPT', 'TEMPLATE']);
const INLINE_TAGS = new Set([
  'A', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'S', 'SMALL', 'SUP', 'SUB', 'MARK',
  'ABBR', 'TIME', 'BR', 'IMG', 'CODE', 'Q', 'CITE', 'KBD', 'VAR', 'SAMP', 'WBR',
  'DEL', 'INS', 'BDI', 'BDO',
]);
const FORCE_WALK_TAGS = new Set([
  'NAV', 'UL', 'OL', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'DL', 'DETAILS',
  'MENU', 'HEADER', 'FOOTER', 'MAIN', 'SECTION', 'ARTICLE', 'FORM',
]);

const ASSET_RE = /\.(?:pdf|xml|png|jpe?g|webp|gif|svg|ico|css|js|mjs|woff2?|zip|txt|mp4|webm)$/i;
const URL_RE = /^(?:https?:)?\/\//i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER_ONLY_RE = /^[\d\s.,:;·—–\-/]+$/;

const GLOSSARY = `
Keep these names and terms in English:
Qingze Luo, University of Victoria, UVic, IEEE Access, IoUT, Internet of Underwater Things,
DDoS, CUDA, KNN, k-NN, MNIST, Vue.js, Element UI, ECharts, ASP.NET, GitHub, LinkedIn,
Flextronics, Nicholson Manufacturing Ltd., SOLIDS Lab, BlueOS, Docker, co-op, IT audit,
SYS 321 / SENG 321, CompTIA Security+, Azure Fundamentals, pigy, Android, Kotlin,
Jetpack Compose, Material 3, Navigation Compose, Hilt, SQLCipher, Tink, DataStore, Room,
ML Kit Document Scanner, Android Keystore, FLAG_SECURE, StateFlow, USE_BIOMETRIC,
Wuthering Waves, 秧秧, 秧秧·玄翎, 穗穗, 清宵, 千咲.
Keep all HTML tags, attributes, href/src values, code, URLs, numbers, dates, and email
addresses exactly as they are. Do not translate text inside <code>...</code>.
`.trim();

const SYSTEM_PROMPTS = {
  zh: `You are a careful professional translator for a personal academic and co-op portfolio. Translate the input strings from English to Simplified Chinese (简体中文). Use a calm, precise, professional tone. Keep the HTML structure and all attributes intact; translate only visible text. ${GLOSSARY} Return only JSON of the form {"translations":["...", "..."]} with exactly the same number and order as the input strings. Do not add notes or explanations.`,
  ja: `You are a careful professional translator for a personal academic and co-op portfolio. Translate the input strings from English to natural Japanese. Use a calm, precise, professional tone; use です・ます for prose and concise labels for UI. Keep the HTML structure and all attributes intact; translate only visible text. ${GLOSSARY} Return only JSON of the form {"translations":["...", "..."]} with exactly the same number and order as the input strings. Do not add notes or explanations.`,
  ko: `You are a careful professional translator for a personal academic and co-op portfolio. Translate the input strings from English to natural Korean (한국어). Use a calm, precise, professional tone: 합니다체 for prose and concise noun-style labels for UI. Use natural Korean technical vocabulary while keeping the glossary terms in English. Keep the HTML structure and all attributes intact; translate only visible text. ${GLOSSARY} Return only JSON of the form {"translations":["...", "..."]} with exactly the same number and order as the input strings. Do not add notes or explanations.`,
};

let apiKey = null;
function getApiKey() {
  if (apiKey) return apiKey;
  if (process.env.DEEPSEEK_API_KEY) {
    apiKey = process.env.DEEPSEEK_API_KEY.trim();
    return apiKey;
  }
  const text = readFileSync(join(homedir(), '.dsh/.credentials.yaml'), 'utf8');
  const match = text.match(/^\s*DEEPSEEK_API_KEY:\s*([^\s#]+)\s*$/m);
  if (!match) throw new Error('DEEPSEEK_API_KEY is not available');
  apiKey = match[1];
  return apiKey;
}

function cachePath(lang) {
  return join(CACHE_DIR, `${lang}.json`);
}

async function loadCache(lang) {
  try {
    const data = JSON.parse(await readFile(cachePath(lang), 'utf8'));
    if (data?.version !== VERSION || typeof data.entries !== 'object') {
      return { version: VERSION, entries: {} };
    }
    return { version: VERSION, entries: data.entries };
  } catch {
    return { version: VERSION, entries: {} };
  }
}

async function saveCache(lang, cache) {
  await mkdir(CACHE_DIR, { recursive: true });
  const sorted = Object.fromEntries(Object.entries(cache.entries).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(cachePath(lang), `${JSON.stringify({ version: VERSION, entries: sorted }, null, 2)}\n`);
}

function chunkSources(sources, maxChars = 3600, maxItems = 36) {
  const chunks = [];
  let current = [];
  let chars = 0;
  for (const source of sources) {
    if (current.length > 0 && (chars + source.length > maxChars || current.length >= maxItems)) {
      chunks.push(current);
      current = [];
      chars = 0;
    }
    current.push(source);
    chars += source.length;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callDeepSeek(lang, sources) {
  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS[lang] },
      { role: 'user', content: JSON.stringify({ strings: sources }) },
    ],
    temperature: 0.2,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
  };
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content ?? '';
      let parsed;
      try {
        parsed = JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, ''));
      } catch {
        if (attempt === 4) throw new Error(`DeepSeek returned non-JSON for ${lang}`);
        await sleep(800 * attempt);
        continue;
      }
      const translations = parsed?.translations;
      if (!Array.isArray(translations) || translations.length !== sources.length) {
        if (sources.length > 1) {
          const half = Math.ceil(sources.length / 2);
          const left = await callDeepSeek(lang, sources.slice(0, half));
          const right = await callDeepSeek(lang, sources.slice(half));
          return [...left, ...right];
        }
        throw new Error(`DeepSeek returned ${translations?.length ?? 0} translations for 1 source (${lang})`);
      }
      return translations.map((value) => String(value));
    }
    if (response.status === 429 || response.status >= 500) {
      if (attempt < 4) {
        await sleep(1200 * attempt);
        continue;
      }
    }
    const detail = await response.text().catch(() => '');
    throw new Error(`DeepSeek ${response.status} for ${lang}: ${detail.slice(0, 300)}`);
  }
  throw new Error(`DeepSeek failed for ${lang}`);
}

function uniqueMissing(sources, cache) {
  return [...new Set(sources)].filter((source) => !Object.hasOwn(cache.entries, source));
}

async function ensureTranslations(lang, sources, cache, stats) {
  const missing = uniqueMissing(sources, cache);
  if (missing.length === 0) return;
  if (OFFLINE) {
    const sample = missing.slice(0, 5).map((s) => s.slice(0, 80));
    throw new Error(`Offline cache is missing ${missing.length} ${lang} strings; run npm run i18n locally. Samples: ${sample.join(' | ')}`);
  }
  for (const chunk of chunkSources(missing)) {
    let translations;
    try {
      translations = await callDeepSeek(lang, chunk);
    } catch (error) {
      // A single malformed/too-large string should not lose the whole run.
      if (chunk.length > 1) {
        for (const source of chunk) {
          const [translation] = await callDeepSeek(lang, [source]);
          cache.entries[source] = translation;
          stats.translated += 1;
        }
        await saveCache(lang, cache);
        continue;
      }
      throw error;
    }
    chunk.forEach((source, index) => {
      cache.entries[source] = translations[index];
      stats.translated += 1;
    });
    await saveCache(lang, cache);
    console.log(`[i18n] ${lang}: ${stats.translated} new strings translated (${missing.length} missing)`);
  }
}

function isSkipped($, el) {
  const tag = (el.tagName ?? '').toUpperCase();
  if (SKIP_TAGS.has(tag)) return true;
  if ($(el).closest('[data-i18n-skip]').length > 0) return true;
  return false;
}


function hasBlockDescendant($, el) {
  return $(el).find('*').toArray().some((child) => {
    const tag = (child.tagName ?? '').toUpperCase();
    return tag && !INLINE_TAGS.has(tag) && !SKIP_TAGS.has(tag);
  });
}

function hasText($, el) {
  return $(el).text().replace(/\s+/g, ' ').trim().length > 0;
}

const TERM_OVERRIDES = {
  zh: [
    ['Enhancing Underwater Network Security: ML-Based Detection and Prediction of DDoS Attacks in IoUT Networks', '增强水下网络安全：基于机器学习的 IoUT 网络 DDoS 攻击检测与预测'],
    ['VICTORIA, BC · 48.4°N', '维多利亚，BC · 48.4°N'],
    ['Independent', '独立项目'],
    ['Wuthering Waves', '鸣潮'],
    ['Jinzhou', '今州'],
    ['Rinascita', '黎那汐塔'],
    ['Dreamland', '梦州'],
    ['New Federation', '新联邦'],
    ['Rover', '漂泊者'],
    ['Jinhsi', '今汐'],
    ['Xuanbird', '玄鸟'],
    ['Shell Credits', '贝币'],
    ['Resonance Chain', '共鸣链'],
    ['锦州', '今州'],
    ['梦境地图', '梦州地图'],
    ['在梦境中', '在梦州'],
    ['梦境的故事', '梦州的故事'],
    ['巡林者', '巡林官'],
    ['第一共鸣链', '一命'],
    ['高冷剑客', '清冷女剑仙'],
    ['姐姐气场', '姐姐属性'],
    ['出场时间最少的看板娘', '戏份最少的看板娘'],
    ['最初的秧秧纯粹是个写信的人', '初版秧秧纯纯写信娘'],
    ['等等，《鸣潮》4.0 没有梦境？！那我和穗穗的约会怎么办？！', '鸣潮4.0怎么就没梦州了！跟穗穗约好的约会怎么办！？'],
    ['跳过梦境', '跳过梦州'],
    ['官方美术', '官方立绘'],
    ['官方角色美术', '官方角色立绘'],
    ['Victoria, BC, Canada', '加拿大不列颠哥伦比亚省维多利亚'],
    ['SOLIDS Lab, University of Victoria · Victoria, BC, Canada', 'SOLIDS Lab, University of Victoria · 加拿大不列颠哥伦比亚省维多利亚'],
    ['University of Victoria · Victoria, BC, Canada', 'University of Victoria · 加拿大不列颠哥伦比亚省维多利亚'],
  ],
  ja: [
    ['Enhancing Underwater Network Security: ML-Based Detection and Prediction of DDoS Attacks in IoUT Networks', '水中ネットワークセキュリティの強化：IoUTネットワークにおけるDDoS攻撃の機械学習ベースの検出と予測'],
    ['VICTORIA, BC · 48.4°N', 'ビクトリア、BC州 · 北緯48.4°'],
    ['Independent', '個人プロジェクト'],
    ['Victoria, BC, Canada', 'ビクトリア、BC州、カナダ'],
    ['SOLIDS Lab, University of Victoria · Victoria, BC, Canada', 'SOLIDS Lab, University of Victoria · カナダ ブリティッシュコロンビア州ビクトリア'],
    ['University of Victoria · Victoria, BC, Canada', 'University of Victoria · カナダ ブリティッシュコロンビア州ビクトリア'],
  ],
  ko: [
    ['Enhancing Underwater Network Security: ML-Based Detection and Prediction of DDoS Attacks in IoUT Networks', '수중 네트워크 보안 강화: 머신러닝 기반 IoUT 네트워크 DDoS 공격 탐지 및 예측'],
    ['VICTORIA, BC · 48.4°N', '빅토리아, BC · 48.4°N'],
    ['Independent', '개인 프로젝트'],
    ['<strong>Document scanner</strong>', '<strong>문서 스캐너</strong>'],
    ['<strong>Reminders</strong>', '<strong>알림</strong>'],
    ['<strong>Polish</strong>', '<strong>마무리</strong>'],
    ['REV 2026.11 · PORTFOLIO', 'REV 2026.11 · 포트폴리오'],
    ['MASc Electrical &amp; Computer Engineering', '전기 및 컴퓨터 공학 석사(MASc)'],
    ['University of Victoria · BSc Computer Science', 'University of Victoria · 컴퓨터 과학 학사(BSc)'],
    ['Electrical and Computer Engineering', '전기 및 컴퓨터 공학'],
    ['Computer Science', '컴퓨터 과학'],
    ['Download PDF', 'PDF 다운로드'],
    ['Research Assistant', '연구 조교'],
    ['Teaching Assistant — SENG 321', '조교 — SENG 321'],
    ['Engineering Technician', '엔지니어링 테크니션'],
    ['Production Planning Support', '생산 계획 지원'],
    ['Flextronics · Zhuhai, Guangdong, China', 'Flextronics · 중국 광둥성 주하이'],
    ['Nicholson Manufacturing Ltd. · Sidney, BC, Canada', 'Nicholson Manufacturing Ltd. · 캐나다 브리티시컬럼비아주 시드니'],
    ['Minimum Spanning Tree — Qingze Luo', '최소 신장 트리 — Qingze Luo'],
    ['Victoria, BC, Canada', '캐나다 브리티시컬럼비아주 빅토리아'],
    ['SOLIDS Lab, University of Victoria · Victoria, BC, Canada', 'SOLIDS Lab, University of Victoria · 캐나다 브리티시컬럼비아주 빅토리아'],
    ['University of Victoria · Victoria, BC, Canada', 'University of Victoria · 캐나다 브리티시컬럼비아주 빅토리아'],
  ],
};

function polish(text, lang) {
  if (typeof text !== 'string') return text;
  let value = text;
  if (lang === 'zh') value = value.replace(/\bIT audit\b/gi, 'IT 审计').replace(/独立完成/g, '独立项目');
  if (lang === 'ja') value = value.replace(/\bIT audit\b/gi, 'IT 監査').replace(/個人制作/g, '個人プロジェクト').replace(/>個人</g, '>個人プロジェクト<');
  if (lang === 'ko') value = value.replace(/\bIT audit\b/gi, 'IT 감사').replace(/개인 제작/g, '개인 프로젝트');
  for (const [from, to] of TERM_OVERRIDES[lang] ?? []) {
    value = value.split(from).join(to);
  }
  return value;
}

function shouldTranslate(text) {
  const value = text.trim();
  if (!value) return false;
  if (URL_RE.test(value) || EMAIL_RE.test(value) || NUMBER_ONLY_RE.test(value)) return false;
  if (!/[\p{L}]/u.test(value)) return false;
  if (/^[\w./-]+\.(?:html?|pdf|xml|png|jpe?g|webp|svg|css|js|mjs|woff2?)$/i.test(value)) return false;
  return true;
}

function collectPage($) {
  const entries = [];
  const attrs = [];

  const processElement = (el) => {
    if (isSkipped($, el)) return;
    const html = $(el).html();
    if (html === null || html === undefined) return;
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (!shouldTranslate(text)) return;
    if (/<script[\s>]/i.test(html) || /<style[\s>]/i.test(html)) return;
    if (/<(?:img|svg|video|canvas|picture)[\s>]/i.test(html)) return;
    entries.push({ el, source: html });
  };

  const walk = (el) => {
    for (const child of $(el).children().toArray()) {
      const tag = (child.tagName ?? '').toUpperCase();
      if (!tag || isSkipped($, child)) continue;
      if (tag === 'LI' || tag === 'BLOCKQUOTE') {
        if (hasText($, child)) {
          processElement(child);
          continue;
        }
        walk(child);
        continue;
      }
      if (FORCE_WALK_TAGS.has(tag) || hasBlockDescendant($, child)
        || $(child).find('img, svg, video, canvas, picture').length > 0) {
        walk(child);
        continue;
      }
      processElement(child);
    }
  };

  walk($('body')[0]);

  const collectAttr = (selector, attribute) => {
    $(selector).each((_, el) => {
      if (isSkipped($, el)) return;
      const value = ($(el).attr(attribute) ?? '').trim();
      if (!shouldTranslate(value)) return;
      attrs.push({ el, attribute, source: value });
    });
  };
  collectAttr('[alt]', 'alt');
  collectAttr('[title]', 'title');
  collectAttr('[aria-label]', 'aria-label');
  collectAttr('[placeholder]', 'placeholder');

  const headEntries = [];
  const title = $('head title').first();
  if (title.length && shouldTranslate(title.text())) {
    headEntries.push({ el: title, kind: 'title', source: title.text().trim() });
  }
  const metaSelectors = [
    ['meta[name="description"]', 'content'],
    ['meta[property="og:title"]', 'content'],
    ['meta[property="og:description"]', 'content'],
    ['meta[name="twitter:title"]', 'content'],
    ['meta[name="twitter:description"]', 'content'],
  ];
  for (const [selector, attribute] of metaSelectors) {
    $(selector).each((_, el) => {
      const value = ($(el).attr(attribute) ?? '').trim();
      if (!shouldTranslate(value)) return;
      headEntries.push({ el, kind: 'meta', attribute, source: value });
    });
  }

  return { entries, attrs, headEntries };
}

function applyPage($, pageData, cache, currentLang) {
  for (const entry of pageData.entries) {
    const translation = cache.entries[entry.source];
    if (translation !== undefined) $(entry.el).html(polish(translation, currentLang));
  }
  for (const entry of pageData.attrs) {
    const translation = cache.entries[entry.source];
    if (translation !== undefined) $(entry.el).attr(entry.attribute, polish(translation, currentLang));
  }
  for (const entry of pageData.headEntries) {
    const translation = cache.entries[entry.source];
    if (translation === undefined) continue;
    const value = polish(translation, currentLang);
    if (entry.kind === 'title') $(entry.el).text(value);
    else $(entry.el).attr(entry.attribute, value);
  }
}

function pagePath(file) {
  const rel = relative(DIST, file).replaceAll('\\', '/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/index\.html$/, '')}`;
}

function localePath(lang, path) {
  if (lang === 'en') return path;
  return path === '/' ? `/${lang}/` : `/${lang}${path}`;
}


function localizeHref(href, lang) {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
  if (href.startsWith('/_astro/') || href.startsWith('/fonts/') || href.startsWith('/images/')) return href;
  const [pathPart, hashPart] = href.split('#');
  const [pathname, queryPart] = pathPart.split('?');
  if (pathPart === '/rss.xml') return `/${lang}/rss.xml${hashPart ? `#${hashPart}` : ''}`;
  if (ASSET_RE.test(pathname)) return href;
  if (pathname.startsWith(`/${lang}/`)) return href;
  const localized = pathname === '/' ? `/${lang}/` : `/${lang}${pathname}`;
  const query = queryPart ? `?${queryPart}` : '';
  const hash = hashPart ? `#${hashPart}` : '';
  return `${localized}${query}${hash}`;
}

function addHreflang($, path) {
  $('link[rel="alternate"][hreflang]').remove();
  for (const lang of ALL_LANGS) {
    const href = `${SITE}${localePath(lang, path)}`;
    $('head').append(`<link rel="alternate" hreflang="${HREFLANG[lang]}" href="${href}" />`);
  }
  $('head').append(`<link rel="alternate" hreflang="x-default" href="${SITE}${localePath('en', path)}" />`);
}

function setLanguageSwitcher($, path, lang) {
  $('a[data-locale]').each((_, el) => {
    const target = $(el).attr('data-locale');
    if (!ALL_LANGS.includes(target)) return;
    const href = localePath(target, path);
    $(el).attr('href', href);
    if (target === lang) $(el).attr('aria-current', 'page');
    else $(el).removeAttr('aria-current');
  });
}

function setLocalizedHead($, lang, path) {
  const meta = LOCALES[lang];
  $('html').attr('lang', meta.htmlLang);
  $('link[rel="canonical"]').attr('href', `${SITE}${localePath(lang, path)}`);
  $('meta[property="og:url"]').attr('content', `${SITE}${localePath(lang, path)}`);
  $('meta[property="og:locale"]').attr('content', meta.ogLocale);
  $('link[rel="alternate"][type="application/rss+xml"]').attr('href', `${SITE}/${lang}/rss.xml`);
  addHreflang($, path);
}

function setEnglishHead($, path) {
  addHreflang($, path);
}

function localizePageLinks($, lang) {
  $('a[href]').each((_, el) => {
    if ($(el).attr('data-locale')) return;
    const href = $(el).attr('href');
    if (typeof href !== 'string') return;
    $(el).attr('href', localizeHref(href, lang));
  });
  // The feed page shows the feed URL as text inside <code>, which is otherwise
  // skipped by the translator. Point the copied URL at this locale's feed.
  $('code').each((_, el) => {
    const value = $(el).text().trim();
    if (value === `${SITE}/rss.xml`) $(el).text(`${SITE}${localePath(lang, '/rss.xml')}`);
    else if (value === '/rss.xml') $(el).text(localePath(lang, '/rss.xml'));
  });
}

async function walkHtml(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'zh' || entry.name === 'ja' || entry.name === 'ko' || entry.name === '_astro') continue;
      await walkHtml(path, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(path);
    }
  }
  return out;
}

async function translateRss(lang, cache, stats) {
  const sourcePath = join(DIST, 'rss.xml');
  let xml;
  try {
    xml = await readFile(sourcePath, 'utf8');
  } catch {
    return;
  }
  const $ = load(xml, { xmlMode: true });
  const sources = [];
  const nodes = [];
  $('channel > title, channel > description, item > title, item > description').each((_, el) => {
    const value = $(el).text().trim();
    if (shouldTranslate(value)) {
      sources.push(value);
      nodes.push({ el, value });
    }
  });
  await ensureTranslations(lang, sources, cache, stats);
  for (const node of nodes) {
    const translation = cache.entries[node.value];
    if (translation !== undefined) $(node.el).text(polish(translation, lang));
  }
  $('channel > language').text(LOCALES[lang].rssLang);
  $('channel > link').each((_, el) => {
    const value = $(el).text();
    if (value === SITE || value === `${SITE}/`) $(el).text(`${SITE}${localePath(lang, '/')}`);
  });
  $('item > link, item > guid').each((_, el) => {
    const value = $(el).text();
    if (value.startsWith(`${SITE}/`)) $(el).text(`${SITE}${localizeHref(value.slice(SITE.length), lang)}`);
  });
  await mkdir(join(DIST, lang), { recursive: true });
  await writeFile(join(DIST, lang, 'rss.xml'), $.xml());
}

async function updateSitemap(paths) {
  const sitemapPath = join(DIST, 'sitemap-0.xml');
  let xml;
  try {
    xml = await readFile(sitemapPath, 'utf8');
  } catch {
    return;
  }
  const existing = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const additions = [];
  for (const lang of Object.keys(LOCALES)) {
    for (const path of paths) {
      if (path === '/404.html') continue;
      const loc = `${SITE}${localePath(lang, path)}`;
      if (existing.has(loc)) continue;
      existing.add(loc);
      additions.push(`<url><loc>${loc}</loc></url>`);
    }
  }
  if (additions.length) {
    await writeFile(sitemapPath, xml.replace('</urlset>', `${additions.join('')}</urlset>`));
  }
}

async function main() {
  const pages = (await walkHtml(DIST)).sort();
  const selected = LIMIT > 0 ? pages.slice(0, LIMIT) : pages;
  if (selected.length === 0) throw new Error('No HTML pages in dist; run npm run build first');
  console.log(`[i18n] ${selected.length} English pages; offline=${OFFLINE}`);

  const locales = ONLY_LOCALE ? { [ONLY_LOCALE]: LOCALES[ONLY_LOCALE] } : LOCALES;
  const caches = {};
  const stats = {};
  for (const lang of Object.keys(locales)) {
    caches[lang] = await loadCache(lang);
    stats[lang] = { translated: 0 };
  }

  for (const file of selected) {
    const path = pagePath(file);
    const html = await readFile(file, 'utf8');
    const $ = load(html);
    // English page: only add hreflang and make the language switcher point
    // at the equivalent page in each locale.
    setLanguageSwitcher($, path, 'en');
    setEnglishHead($, path);
    await writeFile(file, $.html());

    for (const lang of Object.keys(locales)) {
      const $locale = load(html);
      const localeData = collectPage($locale);
      // Ensure every string in this page has a translation before writing.
      const missing = [
        ...localeData.entries.map((entry) => entry.source),
        ...localeData.attrs.map((entry) => entry.source),
        ...localeData.headEntries.map((entry) => entry.source),
      ];
      await ensureTranslations(lang, missing, caches[lang], stats[lang]);
      applyPage($locale, localeData, caches[lang], lang);
      setLocalizedHead($locale, lang, path);
      setLanguageSwitcher($locale, path, lang);
      localizePageLinks($locale, lang);
      const target = join(DIST, lang, path === '/' ? 'index.html' : path.replace(/^\//, '').replace(/\/$/, '/index.html'));
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, $locale.html());
    }
    console.log(`[i18n] page ${path}`);
  }

  for (const lang of Object.keys(locales)) {
    await translateRss(lang, caches[lang], stats[lang]);
  }
  await updateSitemap(selected.map(pagePath));
  for (const lang of Object.keys(locales)) {
    console.log(`[i18n] ${lang}: ${stats[lang].translated} new strings; cache ${Object.keys(caches[lang].entries).length} strings`);
  }
}

main().catch((error) => {
  console.error(`[i18n] FAILED: ${error.message}`);
  process.exitCode = 1;
});
