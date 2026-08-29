#!/usr/bin/env node
/**
 * build-index.js
 *
 * Regenerates the #post-grid section of index.html from the actual
 * .html files in /blog. Nothing about a post is hand-maintained on
 * the homepage anymore — every card is derived straight from that
 * post's own <section class="article-hero">:
 *
 *   <section class="article-hero">
 *     <div class="wrap">
 *       <a href="../index.html#blog" class="back-link mono">← back to blog</a>
 *       <div class="post-meta">
 *         <span class="post-tag mono">infra</span>       <- category + displayed tag
 *         <span class="mono">2026-08-29</span>            <- date
 *         <span class="mono">7 min</span>                 <- read time
 *       </div>
 *       <h1>Post title</h1>
 *     </div>
 *   </section>
 *
 * The card excerpt comes from <meta name="excerpt" content="..."> in
 * the post's <head>, falling back to <meta name="description" ...>
 * if no dedicated excerpt tag exists yet.
 *
 * Run manually with:  node scripts/build-index.js
 * Run automatically via Vercel's build command (see vercel.json).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const INDEX_PATH = path.join(ROOT, 'index.html');

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function extractTag(regex, html, label, filename) {
  const match = html.match(regex);
  if (!match) {
    throw new Error(`[${filename}] could not find ${label}`);
  }
  return match[1].trim();
}

function parsePost(filename) {
  const filePath = path.join(BLOG_DIR, filename);
  const html = readFile(filePath);

  const heroMatch = html.match(/<section\s+class="article-hero">([\s\S]*?)<\/section>/i);
  if (!heroMatch) {
    console.warn(`⚠️  Skipping ${filename}: no <section class="article-hero"> found.`);
    return null;
  }
  const hero = heroMatch[1];

  let tag, title;
  let metaSpans;
  try {
    tag = extractTag(/<span\s+class="post-tag mono">([^<]*)<\/span>/i, hero, 'post-tag span', filename);
    title = extractTag(/<h1>([\s\S]*?)<\/h1>/i, hero, '<h1> title', filename).replace(/\s+/g, ' ').trim();
    // Exact class="mono" (not "post-tag mono") — matches the date and
    // read-time spans only, in document order.
    metaSpans = [...hero.matchAll(/<span\s+class="mono">([^<]*)<\/span>/gi)].map(m => m[1].trim());
  } catch (err) {
    console.warn(`⚠️  Skipping ${filename}: ${err.message}`);
    return null;
  }

  if (metaSpans.length < 2) {
    console.warn(`⚠️  Skipping ${filename}: expected a date and a read-time span in post-meta, found ${metaSpans.length}.`);
    return null;
  }
  const [date, readTime] = metaSpans;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.warn(`⚠️  ${filename}: date "${date}" doesn't look like YYYY-MM-DD — sorting may be off.`);
  }

  const excerptMatch =
    html.match(/<meta\s+name="excerpt"\s+content="([^"]*)"/i) ||
    html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const excerpt = excerptMatch ? excerptMatch[1].trim() : '';
  if (!excerpt) {
    console.warn(`⚠️  ${filename}: no <meta name="excerpt"> or <meta name="description"> found — card excerpt will be empty.`);
  }

  const category = tag.toLowerCase();

  return { filename, tag, category, date, readTime, title, excerpt };
}

function renderCard(post) {
  return [
    `<a class="post-card" href="blog/${post.filename}" data-category="${post.category}">`,
    `<div class="post-meta">`,
    `<span class="post-tag mono">${post.tag}</span>`,
    `<span class="mono">${post.date}</span>`,
    `<span class="mono">${post.readTime}</span>`,
    `</div>`,
    `<h3>${post.title}</h3>`,
    `<p>${post.excerpt}</p>`,
    `<span class="readmore mono">read entry →</span>`,
    `</a>`
  ].join('\n');
}

// Finds the post-grid container's inner bounds by tracking div depth,
// so nested divs inside each card (.post-meta) don't confuse a naive
// regex into stopping at the wrong closing </div>.
function findPostGridBounds(indexHtml) {
  const openTag = '<div class="post-grid" id="post-grid">';
  const openIndex = indexHtml.indexOf(openTag);
  if (openIndex === -1) {
    throw new Error('Could not find <div class="post-grid" id="post-grid"> in index.html');
  }
  const contentStart = openIndex + openTag.length;

  const divRegex = /<div\b[^>]*>|<\/div>/gi;
  divRegex.lastIndex = contentStart;
  let depth = 1;
  let match;
  while ((match = divRegex.exec(indexHtml)) !== null) {
    if (match[0].toLowerCase().startsWith('</div')) {
      depth--;
      if (depth === 0) {
        return { contentStart, contentEnd: match.index };
      }
    } else {
      depth++;
    }
  }
  throw new Error('Could not find the matching closing </div> for post-grid');
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`No /blog directory found at ${BLOG_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.toLowerCase().endsWith('.html'));
  if (files.length === 0) {
    console.warn('No .html files found in /blog — post-grid will end up empty.');
  }

  const posts = files
    .map(parsePost)
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)); // newest first

  const cardsHtml = posts.map(renderCard).join('\n\n');

  const indexHtml = readFile(INDEX_PATH);
  const { contentStart, contentEnd } = findPostGridBounds(indexHtml);
  const newIndexHtml =
    indexHtml.slice(0, contentStart) + '\n' + cardsHtml + '\n' + indexHtml.slice(contentEnd);

  fs.writeFileSync(INDEX_PATH, newIndexHtml, 'utf8');
  console.log(`✅ Regenerated post-grid with ${posts.length} post(s):`);
  posts.forEach(p => console.log(`   ${p.date}  [${p.category}]  ${p.title}`));
}

main();
