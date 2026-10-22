function debounce(fn, delay=250){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>fn.apply(this,a),delay);};}
/* ascii.js — ASCII intro, hero field, ASCII radar, footer wordmark.
   Works on top of the existing index.html: it only ADDS elements and never touches #post-grid,
   the blog search, the filter pills, the cookie banner or the favicon pulse.
   Intro plays once per browser session. ?intro replays it, ?nointro skips it. */
(() => {
  const de = document.documentElement;
  const MONO = "'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace", S = ".-:/+=<!?3I254968AON", SL = S.length, TAU = Math.PI * 2;
  const cs = () => getComputedStyle(de), css = (n, d) => cs().getPropertyValue(n).trim() || d;
  const Hh = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), rc = () => S[Math.random() * SL | 0];
  let FG = "#e9eef5", ACC = "#ff9d3d";
  const $ = s => document.querySelector(s);

  function grid(cv, W, H, fs = 12, lh = 14) {
    const d = Math.min(devicePixelRatio || 1, 2), x = cv.getContext("2d");
    cv.width = Math.max(1, W * d); cv.height = Math.max(1, H * d); x.setTransform(d, 0, 0, d, 0, 0);
    x.font = fs + "px " + MONO; x.textBaseline = "top";
    const cw = x.measureText("M").width;
    return { x, W, H, cw, lh, cols: Math.ceil(W / cw), rows: Math.ceil(H / lh) };
  }
  const mo = document.createElement("canvas");
  function mask(g, text, hf, hs) {
    mo.width = g.cols; mo.height = g.rows;
    const c = mo.getContext("2d", { willReadFrequently: true });
    c.setTransform(1 / g.cw, 0, 0, 1 / g.lh, 0, 0); c.clearRect(0, 0, g.W, g.H);
    c.font = "700 " + g.H * hf + "px 'Space Grotesk',Arial,sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff";
    c.translate(g.W / 2, g.H / 2); c.scale(hs, 1); c.fillText(text, 0, 0);
    const d = c.getImageData(0, 0, g.cols, g.rows).data, m = new Uint8Array(g.cols * g.rows);
    for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3];
    return m;
  }
  function fitHs(g, text, hf, frac) {   // horizontal scale so the measured word is `frac` of the canvas width (max 1.6)
    const c = mo.getContext("2d", { willReadFrequently: true }); c.setTransform(1, 0, 0, 1, 0, 0);
    c.font = "700 " + g.H * hf + "px 'Space Grotesk',Arial,sans-serif";
    return Math.min(1.6, g.W * frac / Math.max(1, c.measureText(text).width));
  }
  function layer(g, a, fn, col) {
    const x = g.x; x.globalAlpha = a; x.fillStyle = col || FG;
    for (let y = 0; y < g.rows; y++) {
      let s = "", any = 0;
      for (let i = 0; i < g.cols; i++) { const c = fn(i, y); if (c && c !== " ") any = 1; s += c || " "; }
      if (any) x.fillText(s, 0, y * g.lh);
    }
    x.globalAlpha = 1;
  }
  const vis = new Map();
  const watch = el => { vis.set(el, true); new IntersectionObserver(e => vis.set(el, e[0].isIntersecting)).observe(el); };

  /* ---------------- intro ---------------- */
  let intro, ic, cur, ig, stage = "done", T0 = 0, clickT = 0, tF = 0, ent = 0;
  const seen = !de.classList.contains("cd-intro");
  let hs0 = .8;
  function beads(t) {
    const cx = ig.cols / 2, N = 1.2 + 3.2 * (.5 + .5 * Math.sin(t * .5)), ph = t * .35, mw = [];
    for (let y = 0; y < ig.rows; y++) { const s = Math.abs(Math.sin(Math.PI * ((y + .5) / ig.rows * N + ph))); mw.push(ig.cols * .5 * Math.max(.08, 1.15 - .17 * N) * Math.pow(s, .85)); }
    return (x, y) => { const m = mw[y], d = Math.abs(x + .5 - cx); if (d > m || m < .6) return " "; return S[Math.min(SL - 1, Math.pow(d / m, 1.1) * SL | 0)]; };
  }
  function endIntro() {
    intro.remove(); cur.remove(); stage = "done";
    de.classList.remove("cd-intro", "cd-intro-run", "cd-in", "cd-lock");
    try { sessionStorage.setItem("cd-intro", "1"); } catch (e) {}
  }
  /* exposed so the "Skip intro" button can end the overlay cleanly (removes canvas,
     cursor, scroll lock and marks it as seen for the session) */
  window.cdEndIntro = () => { if (intro && intro.isConnected) endIntro(); };
  function startIntro() {
    intro = document.createElement("div"); intro.id = "cd-intro";
    ic = document.createElement("canvas"); intro.appendChild(ic);
    cur = document.createElement("div"); cur.id = "cd-cur"; cur.textContent = "CLICK";
    document.body.appendChild(intro); document.body.appendChild(cur);
    de.classList.remove("cd-intro"); de.classList.add("cd-intro-run", "cd-lock");   // overlay is in place, drop the pre-JS cover
    stage = "idle"; T0 = performance.now();
    const click = () => { if (stage !== "idle") return; stage = "go"; clickT = performance.now(); tF = (clickT - T0) / 1000; cur.style.opacity = 0; };
    intro.addEventListener("pointerdown", click);
    addEventListener("keydown", e => { if (stage === "idle" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); click(); } });
    addEventListener("pointermove", e => { if (stage === "idle") { cur.style.opacity = 1; cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; } });
  }
  function introFrame(now) {
    ig.x.clearRect(0, 0, ig.W, ig.H);
    const cx = ig.cols / 2, cy = ig.rows / 2;
    if (stage === "idle") { layer(ig, .85, beads((now - T0) / 1000)); return; }
    const ts = (now - clickT) / 1000, bf = beads(tF);
    if (ts < 2.6) {
      const wp = cl((ts - .9) / 1.5), m = mask(ig, "ciberdefensa", .5 + .1 * wp, hs0), sc = cl(ts / .4);
      layer(ig, .85, (x, y) => {
        if (ts < .7 && Hh(x, y) > ts / .6) { const c = bf(x, y); if (c !== " ") return c; }
        const ex = (x - cx) / (ig.cols * .3), ey = (y - cy) / (ig.rows * .32), r = ex * ex + ey * ey;
        if (r < 1 && Math.random() < .4 * sc * (1 - r * .6) * (1 - wp)) return rc();
        return " ";
      });
      if (wp > 0) layer(ig, .3 + .5 * (1 - wp), (x, y) => m[y * ig.cols + x] > 128 && Hh(x + 7, y + 3) < wp * 1.1 ? (wp < .6 ? rc() : S[5 + (Hh(x, y) * 8 | 0)]) : " ", ACC);
    } else if (ts < 3.6) {
      const z = ts - 2.6, m = mask(ig, "ciberdefensa", .6 * Math.pow(9, z * 1.1), hs0);
      layer(ig, .7 * (1 - z), (x, y) => m[y * ig.cols + x] > 128 ? S[5 + (Hh(x, y) * 8 | 0)] : " ", ACC);
    }
    if (ts >= 3 && !ent) { ent = 1; intro.classList.add("clear"); de.classList.add("cd-in"); }
    if (ts >= 3) {
      const p = cl((ts - 3) / 1.8);
      if (p < 1) layer(ig, .5 * (1 - p * .6), (x, y) => Hh(x + 3, y) < p * 1.15 ? " " : S[cl((.5 + .3 * Math.sin(x * .07 + y * .11) + .2 * Math.sin(x * .03 - y * .05)) * SL | 0, 0, SL - 1)]);
    }
    if (ts > 4.9) endIntro();
  }

  /* ---------------- hero ASCII field ---------------- */
  let bgC, bg, mx = -1, my = -1, lastBg = 0;
  function bgFrame(now) {
    if (!bg || !vis.get(bgC) || now - lastBg < 50) return; lastBg = now;
    const t = now / 1000; bg.x.clearRect(0, 0, bg.W, bg.H);
    layer(bg, .15, (x, y) => {
      const dx = x - mx, dy = (y - my) * 1.7, rp = Math.exp(-(dx * dx + dy * dy) / 90) * 1.2;
      const v = Math.sin(x * .05 + t * .4) + Math.sin(y * .09 - t * .3) + Math.sin((x + y) * .04 + t * .2) + rp * Math.sin(Math.sqrt(dx * dx + dy * dy) * .9 - t * 5);
      return v > .7 ? S[cl((v - .7) / 2.3 * SL | 0, 0, SL - 1)] : " ";
    });
  }

  /* ---------------- ASCII radar ---------------- */
  let rcC, rg, blips = [];
  function radarFrame(now) {
    if (!rg || !vis.get(rcC)) return;
    const t = now / 1000, x = rg.x, lh = rg.lh; x.clearRect(0, 0, rg.W, rg.H);
    const cx = rg.W / 2, cy = rg.H / 2, R = Math.min(rg.W, rg.H) / 2 - 6, sa = -Math.PI / 2 + t * TAU / 4, cw = rg.cw;   // 4s rotation, same as the CSS sweep
    const pol = (i, y) => { const dx = (i + .5) * cw - cx, dy = y * lh + lh / 2 - cy; return [dx, dy, Math.hypot(dx, dy) / R]; };
    layer(rg, .35, (i, y) => { const [dx, dy, r] = pol(i, y); if (r > 1.03) return " "; if (Math.abs(dx) < cw * .5 && Math.abs(dy) < lh * .5) return "+"; for (const q of [.38, .69, 1]) if (Math.abs(r - q) * R < cw * .55) return "·"; if (Math.abs(dx) < cw * .5) return "¦"; if (Math.abs(dy) < lh * .5) return "-"; return " "; });
    layer(rg, .95, (i, y) => { const [dx, dy, r] = pol(i, y); if (r > 1) return " "; const d = (((sa - Math.atan2(dy, dx)) % TAU) + TAU) % TAU; if (d > 1.5) return " "; const k = Math.pow(1 - d / 1.5, 1.4); return k < .08 ? " " : S[cl(k * SL | 0, 0, SL - 1)]; }, ACC);
    x.fillStyle = ACC;
    for (const b of blips) {
      const br = 1 - ((((sa - b.a) % TAU) + TAU) % TAU) / TAU; if (br < .12) continue;
      const px = cx + Math.cos(b.a) * b.r * R, py = cy + Math.sin(b.a) * b.r * R;
      x.globalAlpha = Math.min(1, br * 1.4); x.fillText(br > .7 ? "@" : br > .4 ? "O" : "o", px - cw / 2, py - lh / 2);
      if (br > .3) x.fillText(b.l, px + cw, py - lh / 2);
    }
    x.globalAlpha = 1;
  }

  /* ---------------- footer wordmark ---------------- */
  let fcC, fg, fm;
  function footFrame(now) {
    if (!fg || !vis.get(fcC)) return;
    const t = now / 1000; fg.x.clearRect(0, 0, fg.W, fg.H);
    layer(fg, .75, (x, y) => { const sh = Math.round(Math.sin(y * .25 + t * 1.5) * 3), xx = cl(x + sh, 0, fg.cols - 1); if (fm[y * fg.cols + xx] < 128) return " "; return S[(Math.sin(x * .12 + y * .35 - t * 2.4) * .5 + .5) * (SL - 1) | 0]; });
  }

  /* ---------------- setup ---------------- */
  function size() {
    if (intro && intro.isConnected) { ig = grid(ic, innerWidth, innerHeight); hs0 = fitHs(ig, "ciberdefensa", .6, .72); }
    if (bgC) { const h = bgC.parentElement; bg = grid(bgC, h.clientWidth, h.clientHeight); }
    if (rcC) rg = grid(rcC, rcC.clientWidth, rcC.clientHeight, 10, 11);
    if (fcC) { fg = grid(fcC, fcC.clientWidth, fcC.clientHeight); fm = mask(fg, "CIBERDEFENSA", .7, fitHs(fg, "CIBERDEFENSA", .7, .94)); }
  }
  function init() {
    const hero = $(".hero"), radar = $(".radar"), footWrap = $("footer .wrap"), contact = $("footer .contact-inner");
    if (hero) { bgC = document.createElement("canvas"); bgC.className = "cd-bg"; bgC.setAttribute("aria-hidden", "true"); hero.insertBefore(bgC, hero.firstChild); watch(bgC);
      hero.addEventListener("pointermove", e => { const r = bgC.getBoundingClientRect(); mx = (e.clientX - r.left) / (bg ? bg.cw : 7); my = (e.clientY - r.top) / 14; }); }
    if (radar) {
      blips = [...radar.querySelectorAll(".radar-blip")].map((c, i) => { const dx = (+c.getAttribute("cx") - 150) / 130, dy = (+c.getAttribute("cy") - 150) / 130; return { r: Math.hypot(dx, dy), a: Math.atan2(dy, dx), l: "T-0" + (i + 1) }; });
      rcC = document.createElement("canvas"); rcC.className = "cd-rc"; rcC.setAttribute("aria-hidden", "true"); radar.appendChild(rcC); radar.classList.add("cd-radar"); watch(rcC);
    }
    if (footWrap && contact) { const w = document.createElement("div"); w.className = "cd-foot"; w.setAttribute("aria-hidden", "true"); fcC = document.createElement("canvas"); w.appendChild(fcC); contact.after(w); watch(fcC); }
    if (!seen) startIntro();
    size(); addEventListener("resize", debounce(size, 200)); if (document.fonts) document.fonts.ready.then(size);
    (function loop(n) {
      FG = css("--text", FG); ACC = css("--accent", ACC);
      if (stage !== "done") introFrame(n);
      bgFrame(n); radarFrame(n); footFrame(n);
      requestAnimationFrame(loop);
    })(performance.now());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
