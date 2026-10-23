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
  /* Bull logo silhouette (traced from the Ciberdefensa logo, viewBox ~610x458). Replaces the "ciberdefensa" wordmark in the intro. */
  const BULL = { d: "M52 420C51 419 51 417 51 411C52 403 51 401 46 400C40 398 40 397 46 385C52 372 57 358 60 342C62 336 63 330 64 328C64 327 67 322 72 318C84 304 85 303 85 288C87 257 89 244 95 233C100 224 99 224 86 225C65 226 52 226 46 223C16 209 20 169 54 147C62 142 62 142 62 136C62 121 72 113 94 111C116 109 123 104 126 88C129 78 136 96 135 109C134 119 129 125 120 130C115 132 116 134 121 134C126 134 126 135 119 142C109 151 108 151 92 151C66 151 51 159 41 179C28 205 45 218 84 211C92 209 102 208 106 208C114 208 114 208 120 203C132 192 138 190 163 185C197 180 232 160 265 129C306 91 334 79 363 87C370 90 370 90 369 98C366 115 373 128 391 137C401 142 401 143 390 147C380 150 380 151 385 155C390 158 396 159 405 159C421 157 420 156 419 165C419 178 427 166 428 153C428 145 428 145 433 143C441 138 440 137 430 138C376 141 363 91 409 61C429 47 435 47 422 61C399 87 402 106 431 110C439 112 439 112 442 109C445 105 465 105 497 111C505 112 513 124 517 140C518 145 521 151 522 154C526 161 526 164 523 170C519 179 526 206 536 218C541 224 541 225 535 236C528 248 528 248 521 247C516 246 515 246 508 248C494 253 487 251 474 238C464 228 461 227 446 226C422 225 409 215 406 196C405 183 401 191 402 207C404 237 404 236 402 245C399 258 388 276 383 276C383 276 382 271 382 265C382 244 376 226 364 210C359 202 358 203 362 213C374 238 372 273 358 286C355 289 355 289 345 285C332 279 331 279 339 287C368 320 370 344 345 357C340 360 336 363 328 372C317 384 317 384 300 380C295 378 287 377 283 376C269 374 267 371 275 361C284 352 296 348 303 352C312 357 329 346 329 335C329 329 328 328 314 318C279 296 273 288 276 270C279 248 279 236 277 243C276 244 274 250 272 256C262 281 262 285 269 299C274 309 274 309 261 310C244 311 229 307 206 297C187 289 181 287 172 287C162 287 162 287 166 277C171 260 174 234 171 228C170 225 170 226 168 238C163 270 140 304 105 329C99 334 93 338 91 339C88 342 82 356 77 372C71 390 71 389 75 394C82 401 90 419 87 419C83 421 54 421 52 420ZM221 420C210 420 210 420 209 412C208 406 206 405 202 406C197 407 195 405 185 391C176 379 165 364 156 354C151 349 151 344 156 333C158 328 160 324 160 320C161 304 168 322 168 342C168 351 170 355 180 367C190 378 194 380 201 376C205 374 205 374 210 378C212 381 217 385 220 387C231 394 248 414 247 419C246 421 241 421 221 420ZM484 419C484 418 483 414 483 410C482 401 481 399 474 398C468 396 468 396 468 390C467 384 466 380 453 361C443 345 445 346 432 335C414 321 415 321 405 322C391 323 388 321 397 316C411 308 417 302 424 287C429 276 431 273 439 265C444 259 445 259 444 270C443 283 444 288 460 312C464 318 466 324 468 330C472 346 494 380 507 393C508 393 511 396 514 398C519 403 525 413 525 417C525 420 487 422 484 419ZM505 228C507 226 509 225 511 225C514 225 514 224 511 221C506 216 496 223 499 229C499 232 501 231 505 228ZM480 173C475 165 471 160 466 158C457 153 450 156 454 161C455 162 456 165 457 167C459 170 464 172 469 172C472 171 473 171 476 175C481 180 483 179 480 173ZM527 144C525 142 517 124 517 122C517 121 519 121 524 121C550 121 562 109 562 83C562 74 564 74 568 81C580 103 574 130 554 141C545 145 529 147 527 144Z", x: 26, y: 50, w: 547, h: 370 };
  const bullPath = new Path2D(BULL.d);
  function maskBull(g, k) {   // k = 1 -> bull fills ~62% of the canvas height (or 80% of its width, whichever is smaller)
    mo.width = g.cols; mo.height = g.rows;
    const c = mo.getContext("2d", { willReadFrequently: true });
    c.setTransform(1 / g.cw, 0, 0, 1 / g.lh, 0, 0); c.clearRect(0, 0, g.W, g.H);
    const sc = Math.min(g.H * .62 / BULL.h, g.W * .8 / BULL.w) * k;
    c.translate(g.W / 2, g.H / 2); c.scale(sc, sc); c.translate(-(BULL.x + BULL.w / 2), -(BULL.y + BULL.h / 2));
    c.fillStyle = "#fff"; c.fill(bullPath, "evenodd");
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
      const wp = cl((ts - .9) / 1.5), m = maskBull(ig, .85 + .15 * wp), sc = cl(ts / .4);
      layer(ig, .85, (x, y) => {
        if (ts < .7 && Hh(x, y) > ts / .6) { const c = bf(x, y); if (c !== " ") return c; }
        const ex = (x - cx) / (ig.cols * .3), ey = (y - cy) / (ig.rows * .32), r = ex * ex + ey * ey;
        if (r < 1 && Math.random() < .4 * sc * (1 - r * .6) * (1 - wp)) return rc();
        return " ";
      });
      if (wp > 0) layer(ig, .3 + .5 * (1 - wp), (x, y) => m[y * ig.cols + x] > 128 && Hh(x + 7, y + 3) < wp * 1.1 ? (wp < .6 ? rc() : S[5 + (Hh(x, y) * 8 | 0)]) : " ", ACC);
    } else if (ts < 3.6) {
      const z = ts - 2.6, m = maskBull(ig, Math.pow(9, z * 1.1));
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
