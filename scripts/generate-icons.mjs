/**
 * Build every crest asset from the school's actual logo scan.
 *
 *   pnpm icons        (reads assets/crest-source.jpg)
 *
 * The scan is cleaned rather than redrawn: upscaled, every pixel mapped to the
 * crest's two colours (burgundy + white, which removes JPEG noise and the scan's
 * tint while keeping the original letterforms), the white background cut away,
 * and a subtle sheen added to the burgundy.
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "assets/crest-source.jpg";
const SCALE = 5;

/** Brand burgundy (theme --primary) and the sheen's light / dark ends. */
const BURGUNDY = [143, 26, 38];
const SHEEN_LIGHT = [172, 38, 52];
const SHEEN_DARK = [112, 16, 28];
const WHITE = [255, 255, 255];

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

async function cleanCrest() {
  const meta = await sharp(SOURCE).metadata();
  const width = meta.width * SCALE;
  const height = meta.height * SCALE;
  const { data } = await sharp(SOURCE)
    .resize(width, height, { kernel: "lanczos3" })
    .blur(1.2) // melt JPEG blocks before thresholding
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // How "white" each pixel is: position between burgundy and white (0..1).
  const n = width * height;
  const t = new Float32Array(n);
  const [br, bg, bb] = BURGUNDY;
  const dx = 255 - br,
    dy = 255 - bg,
    dz = 255 - bb;
  const len2 = dx * dx + dy * dy + dz * dz;
  for (let i = 0; i < n; i++) {
    const r = data[i * 3],
      g = data[i * 3 + 1],
      b = data[i * 3 + 2];
    t[i] = Math.min(1, Math.max(0, ((r - br) * dx + (g - bg) * dy + (b - bb) * dz) / len2));
  }

  // Background = white region connected to the image border (flood fill).
  const bgMask = new Uint8Array(n);
  const stack = [];
  const seed = (x, y) => {
    const i = y * width + x;
    if (!bgMask[i] && t[i] > 0.5) {
      bgMask[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < width; x++) {
    seed(x, 0);
    seed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    seed(0, y);
    seed(width - 1, y);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % width,
      y = (i - x) / width;
    if (x > 0) seed(x - 1, y);
    if (x < width - 1) seed(x + 1, y);
    if (y > 0) seed(x, y - 1);
    if (y < height - 1) seed(x, y + 1);
  }

  // Pixels within a few px of the background form the anti-aliased outer edge.
  const EDGE = SCALE * 2;
  const nearBg = new Uint8Array(n);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!bgMask[i]) continue;
      for (let oy = -EDGE; oy <= EDGE; oy += SCALE) {
        for (let ox = -EDGE; ox <= EDGE; ox += SCALE) {
          const xx = x + ox,
            yy = y + oy;
          if (xx >= 0 && yy >= 0 && xx < width && yy < height) nearBg[yy * width + xx] = 1;
        }
      }
    }
  }

  const out = Buffer.alloc(n * 4);
  for (let y = 0; y < height; y++) {
    // Sheen: lighter towards the top-left, deeper towards the point.
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const k = smooth(0, 1, (y / height) * 0.75 + (x / width) * 0.25);
      const base = [0, 1, 2].map((c) =>
        k < 0.5
          ? lerp(SHEEN_LIGHT[c], BURGUNDY[c], k * 2)
          : lerp(BURGUNDY[c], SHEEN_DARK[c], (k - 0.5) * 2),
      );
      const s = smooth(0.38, 0.62, t[i]); // 0 = burgundy, 1 = white (crisp, anti-aliased)
      let rgb, alpha;
      if (bgMask[i] || nearBg[i]) {
        // Outer edge: fade burgundy into transparency instead of into white.
        rgb = base;
        alpha = bgMask[i] || s > 0.5 ? 1 - s : 1;
      } else {
        rgb = [0, 1, 2].map((c) => lerp(base[c], WHITE[c], s));
        alpha = 1;
      }
      out[i * 4] = Math.round(rgb[0]);
      out[i * 4 + 1] = Math.round(rgb[1]);
      out[i * 4 + 2] = Math.round(rgb[2]);
      out[i * 4 + 3] = Math.round(alpha * 255);
    }
  }

  return sharp(out, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 1 })
    .png()
    .toBuffer();
}

/** The crest centred on a square canvas (`pad` = margin fraction). */
async function square(crest, size, { pad = 0.04, background } = {}) {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await sharp(crest)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .sharpen(size <= 64 ? { sigma: 0.5 } : undefined)
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: art, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** .ico with embedded PNG images (supported by every current browser and Windows). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const crest = await cleanCrest();
await mkdir("public/brand", { recursive: true });
await mkdir("public/icons", { recursive: true });
const white = { r: 255, g: 255, b: 255, alpha: 1 };

const outputs = {
  // Full-resolution cleaned crest (transparent, tight crop) for the UI and the website.
  "public/brand/crest.png": await sharp(crest).png({ compressionLevel: 9 }).toBuffer(),
  "public/brand/crest-512.png": await square(crest, 512, { pad: 0.02 }),
  "public/icons/icon-192.png": await square(crest, 192),
  "public/icons/icon-512.png": await square(crest, 512),
  // Maskable: crest inside the 80% safe zone on a solid background.
  "public/icons/maskable-512.png": await square(crest, 512, { pad: 0.14, background: white }),
  // iOS home screen (no transparency there).
  "src/app/apple-icon.png": await square(crest, 180, { pad: 0.08, background: white }),
  // Browser tab (Next.js serves it as <link rel="icon">).
  "src/app/icon.png": await square(crest, 96, { pad: 0.02 }),
};
for (const [file, data] of Object.entries(outputs)) await writeFile(file, data);

const icoImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await square(crest, size, { pad: 0 }) })),
);
await writeFile("src/app/favicon.ico", ico(icoImages));

const { width, height } = await sharp(crest).metadata();
console.log(`Cleaned crest ${width}x${height}. Generated:`);
console.log([...Object.keys(outputs), "src/app/favicon.ico"].join("\n"));
