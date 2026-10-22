#!/usr/bin/env node
/**
 * generate-sitemap.js
 *
 * Scans public/ HTML files and writes public/sitemap.xml.
 * Wired into Vercel build via vercel.json (buildIndex + sitemap).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

function toISO(d) {
  return d.toISOString().replace(/\.\d{3}Z/, '+00:00').replace('T', 'T');
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

function buildSitemap() {
  const urls = [];
  const entries = [];

  function addFile(filePath, href) {
    const stat = fs.statSync(filePath);
    const html = fs.readFileSync(filePath, 'utf8');
    const title = extractTitle(html) || path.basename(filePath, '.html');
    urls.push({ href, title, lastmod: stat.mtime, priority: 0.8, freq: 'weekly' });
  }

  // Root + about + projects + all blog posts
  addFile(path.join(PUBLIC_DIR, 'index.html'), '/');
  [
    'about/index.html',
    'projects/index.html',
  ].forEach(p => {
    const full = path.join(PUBLIC_DIR, p);
    if (fs.existsSync(full)) addFile(full, '/' + p.replace(/index\.html$/, ''));
  });

  const blogDir = path.join(PUBLIC_DIR, 'blog');
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir).filter(f => f.toLowerCase().endsWith('.html'));
    files.forEach(f => {
      // Skip redirect-only stubs (meta refresh) — they should not be indexed.
      const full = path.join(blogDir, f);
      const html = fs.readFileSync(full, 'utf8');
      if (/http-equiv=["']refresh["']/i.test(html)) return;
      addFile(full, '/blog/' + f);
    });
  }

  // Sort: root first, then by lastmod desc, then by href
  urls.sort((a, b) => {
    if (a.href === '/') return -1;
    if (b.href === '/') return 1;
    return b.lastmod - a.lastmod || a.href.localeCompare(b.href);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="https://www.ciberdefensa.uk/sitemap_files/sitemap_CpMz.css" type="text/css"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => `  <url>
    <loc>https://www.ciberdefensa.uk${encodeURI(u.href)}</loc>
    <lastmod>${toISO(u.lastmod)}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority.toFixed(4)}</priority>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`✅ sitemap.xml regenerated with ${urls.length} URL(s)`);
}

buildSitemap();
