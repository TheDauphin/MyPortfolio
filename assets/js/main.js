/* ============================================================
   BRANDON — PORTFOLIO / interaction layer
   No dependencies. Vanilla ES6.
   ============================================================ */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. GEOMETRY ENGINE — Andalusi star-and-cross
     Straight-line girih geometry: the eight-pointed star (khatam)
     tessellated with the diamond cross that fills the gap between
     four of them. The same construction runs from the Alhambra
     through Talavera tile. All lines, no curves, no fills.
  ---------------------------------------------------------- */
  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, attrs = {}) => {
    const e = document.createElementNS(NS, n);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  /* Star polygon as a closed path: `pts` vertices alternating between
     the outer radius Ro and inner radius Ri. */
  function starPath(cx, cy, pts, Ro, Ri, rot = 0) {
    let d = '';
    for (let i = 0; i < pts * 2; i++) {
      const a = rot + (i / (pts * 2)) * Math.PI * 2;
      const r = i % 2 ? Ri : Ro;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(2) + ',' +
                             (cy + Math.sin(a) * r).toFixed(2);
    }
    return d + 'Z';
  }

  /* The octagram is two squares laid over each other. Their edges cross at
     22.5°, which fixes the inner radius at exactly this ratio — no fudging. */
  const OCTA = Math.sqrt(0.5 + Math.pow(1 - Math.SQRT1_2, 2)); // 0.7654
  const octagram = (cx, cy, Ro) => starPath(cx, cy, 8, Ro, Ro * OCTA, -Math.PI / 8);
  const regular  = (cx, cy, n, R, rot = 0) => starPath(cx, cy, n, R, R, rot);

  /* --- the tessellating lattice, as an SVG <pattern> --- */
  /* `centre: true` shifts the tile half a step so whole stars land on the
     middle of a short strip — that's what makes the border bands read. */
  function latticeSVG(tile = 132, weight = 1, centre = false) {
    const S = tile, Ro = S * 0.5, Rd = S * (Math.SQRT1_2 - 0.5); // 0.2071·S — exact
    const svg = el('svg', { 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' });
    svg.style.width = '100%'; svg.style.height = '100%';

    const defs = el('defs');
    const pat = el('pattern', {
      id: 'girih-' + Math.random().toString(36).slice(2, 8),
      width: S, height: S, patternUnits: 'userSpaceOnUse'
    });
    if (centre) pat.setAttribute('patternTransform', `translate(${S / 2},${S / 2})`);
    const g = el('g', {
      stroke: 'currentColor', fill: 'none',
      'stroke-width': 1 * weight, 'stroke-linejoin': 'miter'
    });

    // stars sit on the lattice points; the tile clips them and the
    // neighbouring tiles supply the other halves
    [[0, 0], [S, 0], [0, S], [S, S]].forEach(([x, y]) =>
      g.appendChild(el('path', { d: octagram(x, y, Ro) })));
    // the diamond that exactly fills the gap between four stars
    g.appendChild(el('path', { d: regular(S / 2, S / 2, 4, Rd, Math.PI / 4) }));
    // inner echo — a second, smaller star inside each, for depth
    [[0, 0], [S, 0], [0, S], [S, S]].forEach(([x, y]) =>
      g.appendChild(el('path', { d: octagram(x, y, Ro * 0.5), opacity: 0.55 })));

    pat.appendChild(g);
    defs.appendChild(pat);
    svg.appendChild(defs);
    svg.appendChild(el('rect', { width: '100%', height: '100%', fill: `url(#${pat.id})` }));
    return svg;
  }

  /* --- single motifs --- */
  const MOTIFS = {
    /* khatam — the eight-pointed seal, framed */
    khatam(g, w) {
      g.appendChild(el('path', { d: octagram(0, 0, 100), 'stroke-width': 1.6 * w }));
      g.appendChild(el('path', { d: octagram(0, 0, 62),  'stroke-width': 1.2 * w, opacity: 0.75 }));
      g.appendChild(el('path', { d: regular(0, 0, 8, 30, Math.PI / 8), 'stroke-width': 1.2 * w, opacity: 0.6 }));
      g.appendChild(el('path', { d: regular(0, 0, 4, 13, Math.PI / 4), 'stroke-width': 1 * w, opacity: 0.5 }));
    },
    /* nasrid — sixteen points, the rosette off a palace vault */
    nasrid(g, w) {
      g.appendChild(el('path', { d: starPath(0, 0, 16, 104, 78), 'stroke-width': 1.3 * w }));
      g.appendChild(el('path', { d: regular(0, 0, 16, 78), 'stroke-width': 0.8 * w, opacity: 0.5 }));
      g.appendChild(el('path', { d: octagram(0, 0, 62), 'stroke-width': 1.2 * w, opacity: 0.8 }));
      g.appendChild(el('path', { d: regular(0, 0, 8, 26, Math.PI / 8), 'stroke-width': 1 * w, opacity: 0.55 }));
    },
    /* mark — the compact seal used at small sizes */
    mark(g, w) {
      g.appendChild(el('path', { d: octagram(0, 0, 96), 'stroke-width': 2.4 * w }));
      g.appendChild(el('path', { d: regular(0, 0, 4, 40, Math.PI / 4), 'stroke-width': 2 * w, opacity: 0.7 }));
    }
  };

  function buildMotif(name = 'khatam', weight = 1) {
    const svg = el('svg', { viewBox: '-110 -110 220 220', fill: 'none', 'aria-hidden': 'true' });
    svg.style.width = '100%'; svg.style.height = '100%';
    const g = el('g', { stroke: 'currentColor', fill: 'none', 'stroke-linejoin': 'miter' });
    (MOTIFS[name] || MOTIFS.khatam)(g, weight);
    svg.appendChild(g);
    return svg;
  }

  document.querySelectorAll('[data-motif]').forEach(node => {
    node.innerHTML = '';
    node.appendChild(buildMotif(node.dataset.motif, parseFloat(node.dataset.motifWeight) || 1));
  });

  document.querySelectorAll('[data-lattice]').forEach(node => {
    node.innerHTML = '';
    node.appendChild(latticeSVG(parseFloat(node.dataset.lattice) || 132,
                                parseFloat(node.dataset.latticeWeight) || 1,
                                node.dataset.latticeCentre !== undefined));
  });

  /* --- illuminated initials -------------------------------------------
     Lifts the first letter of a block into a lattice-filled cartouche, the
     way a manuscript initial sits in its box. Walks to the first text node
     so inline markup inside the paragraph survives untouched. */
  function firstTextNode(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) if (n.nodeValue.trim()) return n;
    return null;
  }

  document.querySelectorAll('[data-dropcap]').forEach(node => {
    const tn = firstTextNode(node);
    if (!tn) return;
    const raw = tn.nodeValue.replace(/^\s+/, '');
    if (!raw) return;
    tn.nodeValue = raw.slice(1);

    /* NB: document.createElement, not the SVG-namespaced el() helper above —
       an SVG-namespaced <span> does not render as HTML. */
    const box = document.createElement('span');
    box.className = 'dropcap';
    box.setAttribute('aria-hidden', 'true');
    const bg = document.createElement('span');
    bg.className = 'dc-lattice';
    bg.appendChild(latticeSVG(24, 0.7, true));
    const ltr = document.createElement('span');
    ltr.className = 'dc-letter';
    ltr.textContent = raw[0];
    box.appendChild(bg);
    box.appendChild(ltr);
    node.insertBefore(box, node.firstChild);
    node.classList.add('has-dropcap');
  });

  /* ----------------------------------------------------------
     1b. DITHER ENGINE
     Bayer 8x8 ordered dithering — the 1-bit screen. Runs over real
     photographs when they're dropped in, and generates the glow fields
     that stand in for them until then.
  ---------------------------------------------------------- */
  const BAYER8 = [
    [ 0, 32,  8, 40,  2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44,  4, 36, 14, 46,  6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [ 3, 35, 11, 43,  1, 33,  9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47,  7, 39, 13, 45,  5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21]
  ];
  const threshold = (x, y) => (BAYER8[y & 7][x & 7] + 0.5) / 64;

  /* Paint a 1-bit canvas from a luminance function. `px` is the size of one
     dithered dot in CSS pixels — bigger reads coarser, more photocopied. */
  function ditherField(w, h, px, lum, ink, paper) {
    const cw = Math.max(1, Math.round(w / px));
    const ch = Math.max(1, Math.round(h / px));
    const cv = document.createElement('canvas');
    cv.width = cw; cv.height = ch;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(cw, ch);
    const [ir, ig, ib] = ink, [pr, pg, pb] = paper;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const on = lum(x / cw, y / ch) > threshold(x, y);
        const i = (y * cw + x) * 4;
        img.data[i]     = on ? pr : ir;
        img.data[i + 1] = on ? pg : ig;
        img.data[i + 2] = on ? pb : ib;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    cv.style.width = '100%'; cv.style.height = '100%';
    cv.style.imageRendering = 'pixelated';
    cv.style.display = 'block';
    return cv;
  }

  /* Soft off-centre bloom with a little turbulence — the ethereal figure
     ground from the reference boards, before any real photograph exists.
     Tuned to leave most of the field black so it reads as a light source. */
  function glowLum(seed) {
    const cx = 0.44 + ((seed * 37) % 15) / 100;
    const cy = 0.36 + ((seed * 53) % 19) / 100;
    const r  = 0.21 + ((seed * 29) % 9) / 100;
    return (u, v) => {
      const dx = (u - cx) * 1.22, dy = (v - cy) * 0.92;
      const d = Math.sqrt(dx * dx + dy * dy);
      let a = 1 - d / (r * 2.15);
      a += Math.sin(u * 11 + seed) * Math.cos(v * 9 - seed) * 0.05;
      a += Math.sin((u + v) * 26 + seed * 2) * 0.018;
      return Math.max(0, Math.min(0.97, a * 1.02));
    };
  }

  const rgb = v => {
    const m = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const d = document.createElement('div');
    d.style.color = m; document.body.appendChild(d);
    const c = getComputedStyle(d).color.match(/\d+/g).map(Number);
    d.remove();
    return [c[0], c[1], c[2]];
  };

  /* Always light-on-dark, in both light and dark sections. A dithered photo
     reads as a light source; inverting it in light sections made the slot a
     bright slab instead. Consistency also means real photographs drop in
     looking the same everywhere. */
  function paintPlaceholders() {
    const dark  = rgb('--ink');
    const light = rgb('--vellum');
    document.querySelectorAll('.slot:not(.has-img)').forEach((slot, i) => {
      const r = slot.getBoundingClientRect();
      const w = Math.max(120, r.width), h = Math.max(120, r.height);
      slot.querySelector('.dither-fill')?.remove();
      const wrap = document.createElement('div');
      wrap.className = 'dither-fill';
      wrap.appendChild(ditherField(w, h, +(slot.dataset.px || 3),
        glowLum(i + 1), dark, light));
      slot.insertBefore(wrap, slot.firstChild);
    });
  }

  /* Real photographs: <img data-dither> is replaced by its 1-bit screen. */
  function ditherImage(img) {
    const px = +(img.dataset.dither) || 2;
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w) return;
    const cw = Math.max(1, Math.round(w / (px * 2)));
    const ch = Math.max(1, Math.round(h / (px * 2)));
    const src = document.createElement('canvas');
    src.width = cw; src.height = ch;
    const sx = src.getContext('2d');
    sx.drawImage(img, 0, 0, cw, ch);
    const data = sx.getImageData(0, 0, cw, ch);
    const out = sx.createImageData(cw, ch);
    const gain = +(img.dataset.ditherGain) || 1;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const i = (y * cw + x) * 4;
        const l = (0.299 * data.data[i] + 0.587 * data.data[i + 1] +
                   0.114 * data.data[i + 2]) / 255;
        const on = Math.min(1, l * gain) > threshold(x, y);
        const v = on ? 255 : 0;
        out.data[i] = out.data[i + 1] = out.data[i + 2] = v;
        out.data[i + 3] = 255;
      }
    }
    sx.putImageData(out, 0, 0);
    src.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;' +
                        'object-fit:cover;image-rendering:pixelated;display:block';
    src.className = 'dithered';
    img.replaceWith(src);
  }

  document.querySelectorAll('img[data-dither]').forEach(img => {
    img.closest('.slot')?.classList.add('has-img');
    if (img.complete) ditherImage(img);
    else img.addEventListener('load', () => ditherImage(img), { once: true });
  });

  requestAnimationFrame(paintPlaceholders);
  let rz;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(paintPlaceholders, 260);
  });

  /* ----------------------------------------------------------
     2. PRELOADER
  ---------------------------------------------------------- */
  const pre = $('.preload');
  if (pre) {
    const num = $('.pl-num', pre);
    let n = 0;
    const tick = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 11));
      if (num) num.textContent = String(n).padStart(3, '0') + ' / 100';
      if (n >= 100) clearInterval(tick);
    }, 70);
    const finish = () => {
      clearInterval(tick);
      if (num) num.textContent = '100 / 100';
      setTimeout(() => {
        pre.classList.add('done');
        document.body.classList.add('loaded');
        setTimeout(() => pre.remove(), 1200);
      }, 260);
    };
    window.addEventListener('load', () => setTimeout(finish, 420));
    setTimeout(finish, 2600); // hard ceiling
  }

  /* ----------------------------------------------------------
     3. CUSTOM CURSOR
  ---------------------------------------------------------- */
  const cur = $('.cursor'), dot = $('.cursor-dot'), curLabel = $('.cursor .label');
  if (cur && dot && window.matchMedia('(hover:hover)').matches) {
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
    }, { passive: true });
    (function loop() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
    const hoverables = 'a, button, .work-row, [data-cursor]';
    document.addEventListener('pointerover', e => {
      const t = e.target.closest(hoverables);
      if (!t) return;
      cur.classList.add('is-hover');
      if (curLabel) curLabel.textContent = t.dataset.cursor || '';
    });
    document.addEventListener('pointerout', e => {
      if (!e.target.closest(hoverables)) return;
      cur.classList.remove('is-hover');
      if (curLabel) curLabel.textContent = '';
    });
  }

  /* ----------------------------------------------------------
     4. SCROLL REVEALS
  ---------------------------------------------------------- */
  const revealables = $$('.rv, .mask, .wipe');
  if (reduced) {
    revealables.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));
  }

  /* ----------------------------------------------------------
     5. HERO LINE-IN
  ---------------------------------------------------------- */
  $$('.hero-title .ln > span').forEach((el, i) => {
    if (reduced) return;
    el.style.transform = 'translateY(106%)';
    el.style.transition = `transform 1.25s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.09}s`;
  });
  const heroIn = () => $$('.hero-title .ln > span').forEach(el => { el.style.transform = 'none'; });
  window.addEventListener('load', () => setTimeout(heroIn, pre ? 900 : 120));
  setTimeout(heroIn, 3000);

  /* ----------------------------------------------------------
     6. WORK INDEX — cursor-follow preview
  ---------------------------------------------------------- */
  const peek = $('.peek');
  const rows = $$('.work-row');
  if (peek && rows.length && window.matchMedia('(hover:hover)').matches) {
    rows.forEach((row, i) => {
      const card = document.createElement('div');
      card.className = 'pk';
      card.dataset.i = i;
      const img = row.dataset.peekImg;
      if (img) {
        card.innerHTML = `<img src="${img}" alt="" style="width:100%;height:100%;object-fit:cover">`;
      } else {
        card.innerHTML = `
          <div class="slot tall" style="height:100%;aspect-ratio:auto">
            <span class="tick tl"></span><span class="tick tr"></span>
            <span class="tick bl"></span><span class="tick br"></span>
            <span class="cap">${row.dataset.peekLabel || ''}</span>
          </div>`;
      }
      peek.appendChild(card);
    });
    const cards = $$('.pk', peek);
    let px = 0, py = 0, tx = 0, ty = 0, active = false;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      px += (tx - px) * 0.1;
      py += (ty - py) * 0.1;
      peek.style.transform =
        `translate(${px}px,${py}px) translate(-50%,-50%) scale(${active ? 1 : 0.9}) rotate(${((tx - px) * 0.05).toFixed(2)}deg)`;
      requestAnimationFrame(loop);
    })();
    rows.forEach((row, i) => {
      row.addEventListener('pointerenter', () => {
        active = true;
        peek.classList.add('on');
        cards.forEach(c => c.classList.toggle('on', +c.dataset.i === i));
      });
      row.addEventListener('pointerleave', () => {
        active = false;
        peek.classList.remove('on');
      });
    });
  }

  /* ----------------------------------------------------------
     7. MARQUEE — clone track for seamless loop
  ---------------------------------------------------------- */
  $$('.marquee').forEach(m => {
    const track = $('.track', m);
    if (!track) return;
    for (let i = 0; i < 2; i++) m.appendChild(track.cloneNode(true));
  });

  /* ----------------------------------------------------------
     8. SCROLL PROGRESS
  ---------------------------------------------------------- */
  const bar = $('.progress i');
  if (bar) {
    const upd = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    };
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  }

  /* ----------------------------------------------------------
     9. LIVE CLOCK
  ---------------------------------------------------------- */
  const clock = $('[data-clock]');
  if (clock) {
    const tz = clock.dataset.clock || 'America/New_York';
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const run = () => { clock.textContent = fmt.format(new Date()); };
    run(); setInterval(run, 1000);
  }

  /* ----------------------------------------------------------
     10. YEAR
  ---------------------------------------------------------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

})();
