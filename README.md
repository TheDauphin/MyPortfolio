# Brandon — Portfolio

Static site. No build step, no dependencies, no external requests.
Open `index.html` in a browser and it works.

## Structure

```
index.html                    single-page scroll: hero, statement, work, capabilities, approach, about, contact
work/ummah-connect.html       case study 01
work/matrimonial.html         case study 02
work/cannon-pro-cutz.html     case study 03
assets/css/main.css           everything visual — tokens at the top
assets/js/main.js             geometry engine + interaction layer
assets/fonts/                 self-hosted woff2 (Grenze Gotisch, Grenze, Inter, JetBrains Mono)
assets/img/                   drop your images here
```

## Deploying

Drag the whole folder onto **Netlify Drop** (app.netlify.com/drop), or push to a
GitHub repo and turn on **GitHub Pages**, or `vercel --prod` in this directory.
Nothing needs to be compiled.

## The display face

**UnifrakturCook Bold** — real textura, the hand of an actual manuscript scribe,
drawn heavy and wide enough to stay legible at a glance. SIL Open Font Licence:
free for commercial use, self-hosted, no attribution needed in the page.

Nine other faces are bundled if you ever want to change course — see the
`SWITCH HERE` block at the top of `main.css`. Three values (family, weight,
tracking) and the whole site re-sets.

**If you still want ED Celandine later:** buy it with a *web* licence, convert to
`.woff2` at [transfonter.org](https://transfonter.org), drop it in `assets/fonts/`,
then add this line next to the other `@font-face` rules in `main.css`:

```css
@font-face{font-family:"ED Celandine";src:url("../fonts/ed-celandine.woff2") format("woff2");font-weight:400;font-display:swap}
```

and put `"ED Celandine",` at the front of `--f-display`. Don't use the "free
download" sites that come up in search — those are pirated copies, and the licence
matters if this is going on job applications.

## The outline style

Celandine ships an outline as a separate font file. You don't need one — the browser
can stroke any typeface and knock the fill out, which is what the `.outline` class does.
It's on two moments, both of which fill solid on hover so the outline reads as a state
rather than decoration:

- the huge email address in the contact section
- the next-project title at the foot of each case study

To use it anywhere else, add `class="outline"` to any display-type element. Stroke
thickness is `--outline-w` in `:root`. Browsers without `-webkit-text-stroke` get solid
type rather than invisible type — the fallback is already written.

## The 1-bit dither system

Every image on the site gets screened through an 8×8 Bayer ordered dither — the
same technique as the reference boards. It runs in the browser, on the fly.

To dither a real photo, put an `<img>` inside a slot and add `data-dither`:

```html
<div class="slot wide">
  <img src="../assets/img/cannon-storefront.jpg" alt="" data-dither="2">
  <span class="tick tl"></span><span class="tick tr"></span>
  <span class="tick bl"></span><span class="tick br"></span>
</div>
```

- `data-dither="2"` — dot size. `1` is fine and detailed, `4` is coarse and
  photocopied. `2` is the default look.
- `data-dither-gain="1.3"` — optional brightness push, if a photo comes out too dark.

Every empty slot currently shows a generated dithered bloom instead of a grey box,
so the site reads finished before your work is in it.

**What this means for the photos you send:** dithering throws away all colour and
most mid-tones, so pick images with strong light and clear shapes. Portraits, hard
side-light, storefronts, signage — those screen beautifully. Flat, evenly-lit
product shots turn to mush. Send the colour originals anyway; the dither happens
in the browser and you can always turn it off by deleting the `data-dither`.

## Dropping in your images

Every image position is a `<div class="slot">` with a caption describing what
belongs there. To fill one, add an `<img>` as its first child:

```html
<div class="slot wide">
  <img src="../assets/img/cannon-storefront.jpg" alt="Cannon Pro Cutz storefront">
  <span class="tick tl"></span><span class="tick tr"></span>
  <span class="tick bl"></span><span class="tick br"></span>
</div>
```

Delete the `<span class="cap">…</span>` line once a real image is in.
Aspect ratios: `.slot` = 16:10 · `.wide` = 21:9 · `.tall` = 4:5 · `.square` = 1:1 · `.phone` = 9:17.5

Export JPEGs at roughly 2× the display size, then run them through
[squoosh.app](https://squoosh.app) — aim for under 300 KB each.

## Changing the look

All colour, type and spacing lives in `:root` at the top of `main.css`.
Change `--vellum` and `--ink` and the entire site follows, light and dark sections included.

### The manuscript layer

Beyond the background pattern there's a set of ornament components, all generated:

- **Page frame** — the double ruled border with a star at each corner, on every page. It's
  `<div class="frame">`; delete that block from a page to remove it.
- **Ornament bands** — `<div class="band" data-lattice="46" data-lattice-centre>` renders one
  row of whole stars as a woven border strip. `class="band tall"` makes it deeper,
  `class="band faint"` quieter.
- **Illuminated initials** — add `data-dropcap` to any paragraph and its first letter is
  lifted into a lattice-filled cartouche. Works with inline markup inside the paragraph.
- **Ornamented rules** — `<div class="orn-rule">` with three `<i data-motif="…">` children
  gives a hairline rule that tapers to a star.
- **Numeral cartouches** — the `§ 01` labels in section heads are boxed with diamond ticks.
- **Section lattice** — `<div class="sec-lattice" data-lattice="118">` as the first child of a
  dark section gives it its own fading texture.

To dial the density down, the quickest lever is deleting the `.band` divs and the `.frame`
block; everything else is subtle enough to leave alone.

### The pattern

The ornament is Andalusi star-and-cross geometry — the eight-pointed star tessellated
with the diamond that fills the gap between four of them. Same construction that runs
from the Alhambra through Spanish and Mexican Talavera tile. It's generated in
`main.js`, not drawn, so it stays sharp at any size and weighs nothing.

- `data-lattice="208"` on an element fills it with the tiling pattern. The number is the
  tile size in pixels — bigger is calmer, smaller is busier.
- `data-motif="khatam|nasrid|mark"` places a single star. `khatam` is the eight-pointed
  seal, `nasrid` is the sixteen-point rosette, `mark` is the simplified one for small sizes.
- `data-motif-weight="2"` thickens the lines when a motif is placed small.

### The type — and how to change the display face

Currently **Italiana at weight 400** — hairline strokes, very high contrast, almost
weightless at large sizes. Because it's too fine to survive small settings, anything under
roughly 28px (capability titles, card headings, case-study sub-heads) is set in
`--f-display-sm` instead, which is Grenze. Grenze also does all the running text, JetBrains
Mono handles labels and data, Inter covers the smallest UI text.

Six display faces are already bundled and licensed. To switch, open `assets/css/main.css`
and change **three lines** near the top, in the `:root` block marked `SWITCH HERE`:

| | Family | Weight | Tracking | |
|---|---|---|---|---|
| A | `"Grenze Gotisch"` | `300` | `.015em` | ethereal blackletter |
| B | `"Cormorant"` | `300` | `-.012em` | high-contrast, finest detail |
| C | `"Cinzel"` | `400` | `.035em` | monumental Roman caps |
| D | `"Italiana"` | `400` | `.025em` | hairline, most ethereal *(current)* |
| E | `"Marcellus"` | `400` | `.018em` | warm classical |
| F | `"Amiri"` | `400` | `0` | Andalusi lineage |

Change all three values together and the entire site — headlines, project names, capability
titles, the email — re-sets itself. Nothing else needs touching.

### Turning on an accent colour

The site is monochrome by default. In `:root` there's `--accent: currentColor;` — set it
to `#F4685C` (coral) or `#FFC629` (yellow) to bring in the single-colour poster
treatment from the reference board.

Weight is a real dial, not just presets: Grenze Gotisch and Cormorant are variable fonts, so
any number between 100 and 900 works. Try 200 for something even more ghostly.

## For whoever rebuilds this in React

Each section is self-contained and uses no global JS state. The only pieces with
behaviour are the geometry generator, the cursor, the scroll-reveal observer and the
work-list hover preview — all in `main.js`, all independent of each other. The CSS is
plain and can move to CSS modules or a global stylesheet untouched. The fonts are
already local, so nothing needs to be re-sourced.

Nothing here needs a build step to work, so it can also just be deployed as-is.

## Still to do

- Replace image slots with real work
- Fill in the LinkedIn / Instagram / Dribbble URLs in the footer of `index.html`
- Add `resume.pdf` to the root and point the footer link at it
- Search the HTML for `EDIT:` comments — those mark copy to confirm or replace
- Add a `favicon.ico` and an `og-image.jpg` (1200×630) to the root
