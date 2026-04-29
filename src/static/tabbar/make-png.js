/**
 * 用纯 Node.js 生成最小 PNG（无需第三方库）
 * 原理：手写 PNG 文件头 + IDAT 压缩块
 * 生成 81x81 单色图标
 */
const fs = require('fs');
const zlib = require('zlib');

function createPNG(width, height, drawFn) {
  // RGBA 像素数组
  const pixels = new Uint8Array(width * height * 4);
  // 提供 setPixel(x, y, r, g, b, a)
  const setPixel = (x, y, r, g, b, a = 255) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const i = (y * width + x) * 4;
    pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a;
  };
  drawFn(setPixel, width, height);

  // 构建 PNG raw data（每行前加 filter byte 0）
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]   = pixels[src];
      raw[dst+1] = pixels[src+1];
      raw[dst+2] = pixels[src+2];
      raw[dst+3] = pixels[src+3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  function crc32(buf) {
    let c = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let v = i;
      for (let j = 0; j < 8; j++) v = (v & 1) ? 0xEDB88320 ^ (v >>> 1) : v >>> 1;
      table[i] = v;
    }
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcBuf = Buffer.concat([typeBytes, data]);
    const crcVal = Buffer.alloc(4); crcVal.writeUInt32BE(crc32(crcBuf));
    return Buffer.concat([len, typeBytes, data, crcVal]);
  }

  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // bit depth 8, RGBA
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, chunk('IHDR', ihdr), idat, iend]);
}

// ── 绘制函数 ──────────────────────────────────────────────────────────────

function drawCircle(set, cx, cy, r, R, G, B, A = 255) {
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++)
      if ((x-cx)**2 + (y-cy)**2 <= r*r) set(x, y, R, G, B, A);
}

function drawLine(set, x0, y0, x1, y1, w, R, G, B) {
  const dx = Math.abs(x1-x0), dy = Math.abs(y1-y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, x = x0, y = y0;
  while (true) {
    for (let ox = -w; ox <= w; ox++)
      for (let oy = -w; oy <= w; oy++)
        set(x+ox, y+oy, R, G, B);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx)  { err += dx; y += sy; }
  }
}

function drawRect(set, x, y, w, h, R, G, B, fill = false) {
  if (fill) {
    for (let iy = y; iy < y+h; iy++)
      for (let ix = x; ix < x+w; ix++)
        set(ix, iy, R, G, B);
  } else {
    for (let ix = x; ix < x+w; ix++) { set(ix, y, R, G, B); set(ix, y+h-1, R, G, B); }
    for (let iy = y; iy < y+h; iy++) { set(x, iy, R, G, B); set(x+w-1, iy, R, G, B); }
  }
}

// 首页图标（房子）
function drawHome(set, W, H, r, g, b) {
  const cx = W/2, top = 12, base = 69;
  // 屋顶三角
  for (let y = top; y <= 38; y++) {
    const half = Math.round((y - top) / (38 - top) * 30);
    drawLine(set, cx - half, y, cx + half, y, 1, r, g, b);
  }
  // 左墙
  drawRect(set, 18, 38, 14, 31, r, g, b, true);
  // 右墙
  drawRect(set, 49, 38, 14, 31, r, g, b, true);
  // 门
  drawRect(set, 33, 51, 15, 18, r, g, b, true);
}

// AI 机器人图标
function drawAI(set, W, H, r, g, b) {
  // 头部圆角矩形（近似）
  for (let y = 22; y <= 58; y++)
    for (let x = 18; x <= 62; x++) {
      const rx = Math.min(x-18, 62-x), ry = Math.min(y-22, 58-y);
      if (rx >= 6 || ry >= 6 || (rx-6)**2 + (ry-6)**2 <= 36) set(x, y, r, g, b);
    }
  // 眼睛（白色）
  drawCircle(set, 30, 40, 5, 255, 255, 255);
  drawCircle(set, 51, 40, 5, 255, 255, 255);
  // 眼珠
  drawCircle(set, 30, 40, 2, r, g, b);
  drawCircle(set, 51, 40, 2, r, g, b);
  // 天线
  drawLine(set, 30, 22, 30, 14, 1, r, g, b);
  drawLine(set, 51, 22, 51, 14, 1, r, g, b);
  drawCircle(set, 30, 13, 3, r, g, b);
  drawCircle(set, 51, 13, 3, r, g, b);
}

const W = 81, H = 81;

// 普通色 #888 = 136,136,136
// 激活色 #a78bfa = 167,139,250

const homeNormal = createPNG(W, H, (set) => drawHome(set, W, H, 136, 136, 136));
const homeActive = createPNG(W, H, (set) => drawHome(set, W, H, 167, 139, 250));
const aiNormal   = createPNG(W, H, (set) => drawAI(set, W, H, 136, 136, 136));
const aiActive   = createPNG(W, H, (set) => drawAI(set, W, H, 167, 139, 250));

fs.writeFileSync('home.png',        homeNormal);
fs.writeFileSync('home-active.png', homeActive);
fs.writeFileSync('ai.png',          aiNormal);
fs.writeFileSync('ai-active.png',   aiActive);
console.log('PNG icons generated');
