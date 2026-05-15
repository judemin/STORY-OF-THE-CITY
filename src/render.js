import { PALETTES, GRID_W, GRID_H, LOGICAL_W, LOGICAL_H } from './constants.js';
import { state } from './state.js';
import { getTimeOfDay, getSeason, SKY_COLORS, TREE_PAL } from './time.js';
import {
  cityBuildings, cityLamps, cityTrees, cityTraffic,
  cityBackdrop,
} from './world.js';

export const canvas = document.getElementById('city-canvas');
export const ctx = canvas.getContext('2d');

let DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
let animTick = 0;

export function resizeCanvas() {
  const hud = document.getElementById('hud');
  const hudH = hud ? hud.offsetHeight : 40;
  const availW = window.innerWidth;
  const availH = window.innerHeight - hudH;
  const ratio = LOGICAL_W / LOGICAL_H;
  let displayW, displayH;
  if (availW / availH > ratio) { displayH = availH; displayW = Math.floor(displayH * ratio); }
  else { displayW = availW; displayH = Math.floor(displayW / ratio); }
  canvas.style.position = 'fixed';
  canvas.style.left   = `${Math.floor((availW - displayW) / 2)}px`;
  canvas.style.top    = `${hudH + Math.floor((availH - displayH) / 2)}px`;
  canvas.style.width  = `${displayW}px`;
  canvas.style.height = `${displayH}px`;
  DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  canvas.width  = LOGICAL_W * DPR;
  canvas.height = LOGICAL_H * DPR;
  ctx.imageSmoothingEnabled = false;
}

// ── Color helpers ─────────────────────────────────────────────────────────────

function hexRgb(hex) {
  if (!hex || typeof hex !== 'string') return [0, 0, 0];
  // Handle rgb(...) strings returned by tint/mixHex
  if (hex.charCodeAt(0) === 114) {
    const m = hex.match(/(\d+),\s*(\d+),\s*(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  }
  const n = parseInt(hex.replace('#', ''), 16);
  return isNaN(n) ? [0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function tint(hex, amb, f) {
  const [r, g, b] = hexRgb(hex);
  const [ar, ag, ab] = amb;
  return `rgb(${Math.round(r+(ar-r)*f)},${Math.round(g+(ag-g)*f)},${Math.round(b+(ab-b)*f)})`;
}

function darkenHex(hex, f) {
  const [r, g, b] = hexRgb(hex);
  return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
}

// Returns hex string so it can be safely passed back to tint() or hexRgb()
function mixHex(a, b, t) {
  const [ar, ag, ab] = hexRgb(a);
  const [br, bg, bb] = hexRgb(b);
  const r = Math.round(ar + (br-ar)*t).toString(16).padStart(2,'0');
  const g = Math.round(ag + (bg-ag)*t).toString(16).padStart(2,'0');
  const bl= Math.round(ab + (bb-ab)*t).toString(16).padStart(2,'0');
  return `#${r}${g}${bl}`;
}

function clamp(v) { return Math.max(0, Math.min(1, v)); }

// ── Layout ────────────────────────────────────────────────────────────────────

const CW = LOGICAL_W;
const CH = LOGICAL_H;
const TILE_W_BASE = CW / GRID_W;
const FLOOR_H_BASE = 13;

const LAYERS = [
  { yMin: 0,  yMax: 7,  baseY: 208, tw: TILE_W_BASE*0.24, fh: FLOOR_H_BASE*0.20, mute: 0.88 },
  { yMin: 8,  yMax: 15, baseY: 264, tw: TILE_W_BASE*0.42, fh: FLOOR_H_BASE*0.36, mute: 0.66 },
  { yMin: 16, yMax: 23, baseY: 326, tw: TILE_W_BASE*0.62, fh: FLOOR_H_BASE*0.56, mute: 0.36 },
  { yMin: 24, yMax: 31, baseY: 382, tw: TILE_W_BASE*0.82, fh: FLOOR_H_BASE*0.78, mute: 0.14 },
  { yMin: 32, yMax: 41, baseY: 390, tw: TILE_W_BASE*1.00, fh: FLOOR_H_BASE*1.00, mute: 0.00 },
];

const HORIZON_Y  = 192;
const ROAD_TOP   = 416;
const ROAD_H     = 50;
const CURB_H     = 4;
const SIDEWALK_H = 22;

function sxOf(worldX, worldW) {
  return Math.round((worldX + worldW * 0.5) / GRID_W * CW);
}

// ── Building renderer ─────────────────────────────────────────────────────────

function draw2DBuilding(b, lyr, amb, lt, tod) {
  const night = tod === 'evening' || tod === 'night';
  // Distant layers blend extra toward ambient for atmospheric depth
  const tf  = clamp(lt * (1 - lyr.mute * 0.74));
  const atm = lyr.mute * 0.28;
  const bw  = Math.max(3, Math.floor(lyr.tw * b.w));
  const bh  = Math.max(3, Math.floor(lyr.fh * b.h));
  const sx  = sxOf(b.x, b.w);
  const x0  = sx - (bw >> 1);
  const y0  = lyr.baseY - bh;
  const arch = b.archetypeId || 0;
  const [cr, cg, cb] = hexRgb(b.color);

  // Body
  ctx.fillStyle = tint(b.color, amb, tf + atm);
  ctx.fillRect(x0, y0, bw, bh);

  // Left sunlit edge
  const hl = Math.max(2, bw >> 3);
  ctx.fillStyle = `rgb(${Math.min(255,Math.round(cr*(1+tf*0.34)))},${Math.min(255,Math.round(cg*(1+tf*0.22)))},${Math.min(255,Math.round(cb*(1+tf*0.10)))})`;
  ctx.fillRect(x0, y0, hl, bh);

  // Right shadow edge
  const sh = Math.max(2, bw >> 4);
  ctx.fillStyle = `rgb(${Math.round(cr*tf*0.44)},${Math.round(cg*tf*0.44)},${Math.round(cb*tf*0.44)})`;
  ctx.fillRect(x0 + bw - sh, y0, sh, bh);

  // Roof
  const rh = Math.max(2, Math.floor(lyr.fh * 0.38));
  ctx.fillStyle = tint(b.roofColor, amb, tf * 0.88);
  ctx.fillRect(x0, y0 - rh, bw, rh);
  ctx.fillStyle = tint(b.roofColor, amb, tf * 0.64);
  ctx.fillRect(x0, y0 - rh, bw, 1);

  // Floor slab lines — solid opaque (no rgba)
  if (lyr.fh >= 7 && b.h > 1) {
    ctx.fillStyle = `rgb(${Math.round(cr*0.58)},${Math.round(cg*0.58)},${Math.round(cb*0.58)})`;
    for (let f = 1; f < b.h; f++) {
      const fy = lyr.baseY - Math.round(f * lyr.fh);
      if (fy > y0 && fy < lyr.baseY) ctx.fillRect(x0, fy, bw, 1);
    }
  }

  // Windows — archetype-varied geometry + subtle night twinkle
  if (lyr.fh >= 5 && bw >= 5 && b.h > 1) {
    let ww, wh, gap;
    if (arch===1||arch===5) {
      ww=Math.max(1,Math.floor(lyr.tw*0.14)); wh=Math.max(2,Math.floor(lyr.fh*0.54)); gap=Math.max(1,Math.floor(lyr.tw*0.09));
    } else if (arch===0||arch===3) {
      ww=Math.max(3,Math.floor(lyr.tw*0.30)); wh=Math.max(1,Math.floor(lyr.fh*0.30)); gap=Math.max(2,Math.floor(lyr.tw*0.16));
    } else if (arch===2) {
      ww=Math.max(1,Math.floor(lyr.tw*0.16)); wh=Math.max(1,Math.floor(lyr.fh*0.38)); gap=Math.max(2,Math.floor(lyr.tw*0.18));
    } else {
      ww=Math.max(2,Math.floor(lyr.tw*0.22)); wh=Math.max(1,Math.floor(lyr.fh*0.44)); gap=Math.max(1,Math.floor(lyr.tw*0.12));
    }
    const cols=Math.max(1,Math.floor((bw-gap*2)/(ww+gap)));
    const xPad=(bw-(cols*ww+(cols-1)*gap))>>1;

    for (let f=0;f<b.h-1;f++) {
      const wy=lyr.baseY-Math.round((f+0.74)*lyr.fh)-wh;
      if (wy<y0||wy+wh>lyr.baseY) continue;
      for (let c=0;c<cols;c++) {
        const wx=x0+xPad+c*(ww+gap);
        if (night) {
          const wseed=(b.x*7+b.y*13+f*5+c*3)&0xffff;
          const dim=wseed%7===0?0.88+0.12*Math.sin((animTick/260+wseed*0.008)*Math.PI*2):1.0;
          ctx.fillStyle=`rgb(${Math.round(240*dim)},${Math.round(216*dim)},${Math.round(128*dim)})`;
          ctx.fillRect(wx,wy,ww,wh);
          if (ww>=3){ctx.fillStyle=`rgb(${Math.min(255,Math.round(255*dim))},${Math.min(255,Math.round(248*dim))},${Math.min(255,Math.round(184*dim))})`;ctx.fillRect(wx+1,wy,1,Math.min(wh,2));}
        } else {
          const [ar2,ag2,ab2]=amb;
          ctx.fillStyle=`rgb(${Math.round(ar2*0.60+cr*0.18)},${Math.round(ag2*0.60+cg*0.16)},${Math.round(ab2*0.70+cb*0.08)})`;
          ctx.fillRect(wx,wy,ww,wh);
        }
      }
    }
  }

  if (lyr.fh < 7) return;

  // Storefront (arch 0, 3)
  if (arch === 0 || arch === 3) {
    const gfTop = lyr.baseY - Math.round(lyr.fh * 0.92);
    const gfH   = Math.round(lyr.fh * 0.82);
    const dfW   = Math.max(4, Math.floor(bw * 0.58));
    ctx.fillStyle = night
      ? `rgb(${Math.min(255,cr/2+88)},${Math.min(255,cg/2+52)},${Math.min(255,cb/2+18)})`
      : tint('#98aec6', amb, tf * 0.74);
    ctx.fillRect(sx-(dfW>>1), gfTop+Math.round(gfH*0.08), dfW, Math.round(gfH*0.72));
    ctx.fillStyle = night ? '#c07838' : tint('#3a4656', amb, tf*0.58);
    ctx.fillRect(x0-2, gfTop-Math.round(lyr.fh*0.16), bw+4, Math.round(lyr.fh*0.18));
    ctx.fillStyle = night ? '#9c5a24' : tint('#2e3844', amb, tf*0.50);
    for (let i = 0; i < bw; i += 5) ctx.fillRect(x0+i, gfTop-Math.round(lyr.fh*0.16), 2, Math.round(lyr.fh*0.18));
  }

  // Tower cap (arch 1, 5)
  if (arch === 1 || arch === 5) {
    const capH = Math.max(3, Math.floor(lyr.fh * 0.44));
    ctx.fillStyle = tint(mixHex(b.roofColor,'#7888a8',0.50), amb, tf*0.80);
    ctx.fillRect(x0+Math.floor(bw*0.08), y0-rh-capH, Math.floor(bw*0.84), capH);
    ctx.fillStyle = tint(mixHex(b.roofColor,'#505878',0.52), amb, tf*0.64);
    ctx.fillRect(x0+Math.floor(bw*0.22), y0-rh-capH*2, Math.floor(bw*0.56), capH);
    const spireH = Math.floor(lyr.fh * (arch===5 ? 1.5 : 0.9));
    ctx.fillStyle = '#12161e';
    ctx.fillRect(sx-1, y0-rh-capH*2-spireH, 2, spireH);
    if (night && arch===5) { ctx.fillStyle='#ffa060'; ctx.fillRect(sx-2, y0-rh-capH*2-spireH, 4, 2); }
  }

  // Hub deck (arch 6)
  if (arch === 6) {
    const deckH = Math.max(2, Math.floor(lyr.fh * 0.32));
    ctx.fillStyle = tint(b.roofColor, amb, tf*0.70);
    ctx.fillRect(x0-2, y0-rh-deckH, bw+4, deckH);
    ctx.fillStyle = tint('#303c50', amb, tf*0.50);
    ctx.fillRect(x0-2, y0-rh-deckH-2, bw+4, 2);
    if (night) { ctx.fillStyle='#f0a858'; ctx.fillRect(x0, y0-rh-deckH-3, bw, 1); }
  }

  // Stepped mass (arch 4)
  if (arch === 4 || b.massing === 'stepped') {
    const sw  = Math.floor(bw * 0.62);
    const ssH = Math.floor(bh * 0.42);
    ctx.fillStyle = tint(b.color, amb, tf*1.04);
    ctx.fillRect(sx-(sw>>1), y0, sw, ssH);
    const [cr2,cg2,cb2] = hexRgb(b.color);
    ctx.fillStyle = `rgb(${Math.min(255,Math.round(cr2*(1+tf*0.28)))},${Math.min(255,Math.round(cg2*(1+tf*0.18)))},${Math.min(255,Math.round(cb2*(1+tf*0.10)))})`;
    ctx.fillRect(sx-(sw>>1), y0, Math.max(2,sw>>3), ssH);
    ctx.fillStyle = tint(b.roofColor, amb, tf*0.84);
    ctx.fillRect(sx-(sw>>1), y0-rh, sw, rh);
  }

  // HVAC (arch 2)
  if (arch === 2) {
    const hw = Math.max(3, Math.floor(bw*0.38));
    const hh = Math.max(2, Math.floor(lyr.fh*0.36));
    ctx.fillStyle = tint('#6a7284', amb, tf*0.58);
    ctx.fillRect(x0+Math.floor(bw*0.12), y0-rh-hh, hw, hh);
    ctx.fillRect(x0+Math.floor(bw*0.60), y0-rh-Math.floor(hh*0.68), Math.floor(hw*0.55), Math.floor(hh*0.68));
  }

  // Signs
  if (b.signType==='vertical' && bw>=8) {
    const sw2=Math.max(2,Math.floor(bw*0.10)), ssH=Math.floor(bh*0.46);
    const on=night&&(((animTick/55|0)+b.x+b.y)%20<18);
    ctx.fillStyle = on ? '#ff9850' : (night ? '#382a26' : tint('#505868',amb,tf*0.48));
    ctx.fillRect(x0+bw-sw2-1, y0+Math.floor(bh*0.10), sw2, ssH);
  }
  if (b.signType==='horizontal' && bw>=10) {
    const ssH=Math.max(2,Math.floor(lyr.fh*0.32));
    ctx.fillStyle = night ? '#f0a858' : tint('#485060',amb,tf*0.46);
    ctx.fillRect(x0+Math.floor(bw*0.12), y0+Math.floor(bh*0.38), Math.floor(bw*0.76), ssH);
  }
  if (b.signType==='blade' && bw>=8) {
    const on=night&&(((animTick/45|0)+b.x)%22>1);
    ctx.fillStyle = on ? '#ff8840' : tint('#38404e',amb,tf*0.40);
    ctx.fillRect(x0-Math.floor(bw*0.14), y0+Math.floor(bh*0.28), Math.max(3,Math.floor(bw*0.12)), Math.max(5,Math.floor(lyr.fh*0.56)));
  }
  if (b.signType==='panel' && bw>=10) {
    ctx.fillStyle = night ? '#f0b870' : tint('#445058',amb,tf*0.44);
    ctx.fillRect(x0+Math.floor(bw*0.22), y0+Math.floor(bh*0.44), Math.floor(bw*0.56), Math.max(3,Math.floor(lyr.fh*0.28)));
  }

  // Roof props
  if (lyr.fh >= 9) {
    const rs = b.roofSet;
    if (rs==='antenna'||rs==='mix') {
      ctx.fillStyle='#12161e'; ctx.fillRect(sx-1, y0-rh-Math.floor(lyr.fh*1.10), 2, Math.floor(lyr.fh*1.10));
      ctx.fillStyle='#464e58'; ctx.fillRect(sx-3, y0-rh-Math.floor(lyr.fh*1.10), 6, 1);
    }
    if (rs==='tank') {
      const tW=Math.max(3,Math.floor(bw*0.24)), tH=Math.max(3,Math.floor(lyr.fh*0.50));
      ctx.fillStyle=tint('#808898',amb,tf*0.50); ctx.fillRect(sx+Math.floor(bw*0.16), y0-rh-tH, tW, tH);
      ctx.fillStyle=tint('#707888',amb,tf*0.56); ctx.fillRect(sx+Math.floor(bw*0.16), y0-rh-tH-1, tW, 1);
    }
    if (rs==='hvac'||rs==='mix') {
      ctx.fillStyle=tint('#6c7488',amb,tf*0.60);
      ctx.fillRect(x0+Math.floor(bw*0.12), y0-rh-Math.max(2,Math.floor(lyr.fh*0.34)), Math.max(4,Math.floor(bw*0.36)), Math.max(2,Math.floor(lyr.fh*0.34)));
    }
    if (rs==='solar') {
      ctx.fillStyle=tint('#283858',amb,tf*0.68);
      ctx.fillRect(x0+Math.floor(bw*0.08), y0-rh-2, Math.floor(bw*0.84), 2);
    }
    if (rs==='garden') {
      ctx.fillStyle=tint('#264420',amb,tf*0.60);
      ctx.fillRect(x0+Math.floor(bw*0.10), y0-rh-Math.floor(lyr.fh*0.30), Math.floor(bw*0.80), Math.floor(lyr.fh*0.28));
      ctx.fillStyle=tint('#365a30',amb,tf*0.54);
      ctx.fillRect(x0+Math.floor(bw*0.20), y0-rh-Math.floor(lyr.fh*0.48), Math.floor(bw*0.18), Math.floor(lyr.fh*0.18));
      ctx.fillRect(x0+Math.floor(bw*0.58), y0-rh-Math.floor(lyr.fh*0.40), Math.floor(bw*0.16), Math.floor(lyr.fh*0.16));
    }
    if (rs==='crown') {
      ctx.fillStyle = night ? '#f0a058' : tint('#848ea4',amb,tf*0.56);
      ctx.fillRect(x0, y0-rh-Math.floor(lyr.fh*0.28), bw, Math.floor(lyr.fh*0.24));
    }
    if (rs==='spire') {
      ctx.fillStyle=tint('#8890a8',amb,tf*0.56);
      ctx.fillRect(x0+Math.floor(bw*0.12), y0-rh-Math.floor(lyr.fh*0.44), Math.floor(bw*0.76), Math.floor(lyr.fh*0.24));
      ctx.fillStyle='#12161e';
      ctx.fillRect(sx-1, y0-rh-Math.floor(lyr.fh*1.24), 2, Math.floor(lyr.fh*0.82));
    }
    if (rs==='deck') {
      ctx.fillStyle=tint('#4c5464',amb,tf*0.50);
      ctx.fillRect(x0-2, y0-rh-Math.floor(lyr.fh*0.30), bw+4, Math.floor(lyr.fh*0.28));
      if (night) { ctx.fillStyle='#f0a860'; ctx.fillRect(x0, y0-rh-Math.floor(lyr.fh*0.30)-1, bw, 1); }
    }
  }
}

// ── Car renderer ──────────────────────────────────────────────────────────────

function draw2DCar(tr, carX, carY, tod) {
  const night = tod==='evening'||tod==='night';
  const type  = tr.carType;
  const bodyL = type==='bus'?28:type==='truck'?22:type==='van'?17:14;
  const bodyH = type==='bus'?9 :type==='truck'?7 :6;
  const col   = tr.carColor;

  ctx.save();
  ctx.translate(Math.round(carX), Math.round(carY));
  if (tr.dir < 0) ctx.scale(-1,1);

  // Body
  ctx.fillStyle = col;
  ctx.fillRect(-(bodyL>>1), -bodyH, bodyL, bodyH);
  // Top highlight line
  ctx.fillStyle = mixHex(col,'#ffffff',0.18);
  ctx.fillRect(-(bodyL>>1), -bodyH, bodyL, 1);
  // Left sheen
  ctx.fillStyle = mixHex(col,'#ffffff',0.12);
  ctx.fillRect(-(bodyL>>1), -bodyH, 2, bodyH);

  if (type==='bus') {
    ctx.fillStyle = darkenHex(col,0.76);
    ctx.fillRect(-(bodyL>>1)+1, -bodyH, bodyL-2, 1);
    const wG=night?'#243648':'#8cb4cc', wC=4, wW=Math.floor((bodyL-6)/wC)-1;
    for (let w=0;w<wC;w++) { ctx.fillStyle=wG; ctx.fillRect(-(bodyL>>1)+2+w*(wW+2),-bodyH+2,wW,Math.floor(bodyH*0.46)); }
    ctx.fillStyle=darkenHex(col,0.80);
    ctx.fillRect(-(bodyL>>1)+Math.floor(bodyL*0.62),-bodyH+1,1,bodyH-2);
  } else {
    const cabH=4, cabL=type==='truck'?8:type==='van'?10:9;
    ctx.fillStyle=darkenHex(col,0.70);
    ctx.fillRect((bodyL>>1)-cabL,-bodyH-cabH,cabL,cabH);
    ctx.fillStyle=night?'#385068':'#aacae6';
    ctx.fillRect((bodyL>>1)-cabL+1,-bodyH-cabH+1,cabL-2,cabH-1);
    ctx.fillStyle=darkenHex(col,0.78);
    ctx.fillRect(-(bodyL>>1)+5,-bodyH+1,1,bodyH-2);
  }

  // Wheels
  ctx.fillStyle='#10101a';
  ctx.fillRect(-(bodyL>>1)+1,0,4,2); ctx.fillRect((bodyL>>1)-5,0,4,2);
  ctx.fillStyle=darkenHex(col,0.55);
  ctx.fillRect(-(bodyL>>1)+1,-2,4,2); ctx.fillRect((bodyL>>1)-5,-2,4,2);

  if (night) {
    const hl = bodyL >> 1;
    const tl = -(bodyL >> 1);

    // Ground light pool — oval flattened to simulate downward angle
    ctx.save();
    ctx.translate(hl + 10, 3);
    ctx.scale(1, 0.28);
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,230,100,0.20)';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(hl + 5, 2);
    ctx.scale(1, 0.28);
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,248,190,0.34)';
    ctx.fill();
    ctx.restore();

    // Headlight lens — semi-transparent warm glow
    ctx.fillStyle = 'rgba(255,245,195,0.72)';
    ctx.fillRect(hl-2, -bodyH+1, 2, bodyH-2);

    // Taillight
    ctx.fillStyle = '#b81000';
    ctx.fillRect(tl, -bodyH+1, 2, bodyH-2);
    ctx.fillStyle = 'rgba(255,30,14,0.80)';
    ctx.fillRect(tl, -bodyH+2, 2, Math.max(1, (bodyH-2)>>1));
  } else {
    ctx.fillStyle='#c4d0de'; ctx.fillRect((bodyL>>1)-2,-bodyH+2,2,2);
  }

  ctx.restore();
}

// ── Tree renderer ─────────────────────────────────────────────────────────────

function draw2DTree(sx, baseY, size, tc, amb, lt) {
  const tw = Math.max(2, Math.floor(size*0.12));
  const th = Math.floor(size*0.34);
  const r  = Math.floor(size*0.50);
  const vx = ((sx*37)%5)-2;
  const mx = sx + vx;
  const cy = baseY - th - Math.floor(r*0.84);

  // Trunk — clean, no base broadening
  ctx.fillStyle = tint(tc.trunk, amb, Math.max(lt,0.08)*0.52);
  ctx.fillRect(sx-(tw>>1), baseY-th, tw, th);

  // Main canopy
  ctx.fillStyle = tint(tc.c1, amb, lt*0.60);
  ctx.beginPath(); ctx.arc(mx, cy, r, 0, Math.PI*2); ctx.fill();

  // Interior shadow — dist+r=sqrt(0.14²+0.18²)+0.52=0.748r, fully inside
  ctx.fillStyle = tint(tc.c2||tc.c1, amb, lt*0.46);
  ctx.beginPath(); ctx.arc(mx+Math.floor(r*0.14), cy+Math.floor(r*0.18), Math.floor(r*0.52), 0, Math.PI*2); ctx.fill();

  // Highlight — dist+r=sqrt(0.20²+0.28²)+0.30=0.644r, fully inside
  ctx.fillStyle = tint(mixHex(tc.c1,'#ffffff',0.26), amb, lt*0.76);
  ctx.beginPath(); ctx.arc(mx-Math.floor(r*0.20), cy-Math.floor(r*0.28), Math.floor(r*0.30), 0, Math.PI*2); ctx.fill();
}

// ── Lamp renderer ─────────────────────────────────────────────────────────────

function draw2DLamp(lpx, baseY, poleH, on, amb, lt) {
  const pC = tint('#505868', amb, lt*0.44);
  // Slim base — 3×2, not bench-like
  ctx.fillStyle = tint('#3c4450', amb, lt*0.42);
  ctx.fillRect(lpx-1, baseY-2, 3, 2);
  // Pole
  ctx.fillStyle = pC;
  ctx.fillRect(lpx-1, baseY-poleH, 2, poleH-2);
  ctx.fillRect(lpx,   baseY-poleH, 10, 2);
  ctx.fillRect(lpx+9, baseY-poleH, 2, 4);
  ctx.fillRect(lpx+8, baseY-poleH+4, 5, 2);
  ctx.fillStyle = on ? '#f0d838' : tint('#606878',amb,lt*0.36);
  ctx.fillRect(lpx+7, baseY-poleH+2, 7, 5);
  ctx.fillStyle = on ? '#fffab0' : tint('#686e80',amb,lt*0.32);
  ctx.fillRect(lpx+8, baseY-poleH+3, 5, 3);
  if (on) {
    ctx.fillStyle = '#685c38';
    ctx.fillRect(lpx+5, baseY-3, 8, 1);
  }
}

// ── Main render ───────────────────────────────────────────────────────────────

export function render() {
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const cw=LOGICAL_W, ch=LOGICAL_H;
  const pal  = PALETTES[state.tier];
  const tod  = getTimeOfDay();
  const sky  = SKY_COLORS[tod];
  const amb  = hexRgb(sky.ambient);
  const tc   = TREE_PAL[getSeason()];
  const night = tod==='evening'||tod==='night';

  document.body.style.background = sky.sky;

  const lighting = {
    dawn:      { t:0.34, l:0.0,  fog:0.88 },
    morning:   { t:0.56, l:0.0,  fog:0.56 },
    day:       { t:0.52, l:0.0,  fog:0.38 },
    afternoon: { t:0.46, l:0.0,  fog:0.52 },
    evening:   { t:0.24, l:0.82, fog:0.88 },
    night:     { t:0.12, l:1.0,  fog:1.06 },
  }[tod];
  const lt = lighting.t;

  const hour = new Date().getHours() + new Date().getMinutes()/60;

  // ── Sky ───────────────────────────────────────────────────────────────────────
  const SKY_STOPS = {
    dawn:      [['#080e1e',0],['#1c1240',0.20],['#562450',0.44],['#a44c54',0.66],['#d87848',0.84],['#ecb868',1]],
    morning:   [['#2860a8',0],['#4686c8',0.26],['#72b2de',0.56],['#a6cef0',0.78],['#e2d6b4',0.92],['#f8e8d4',1]],
    day:       [['#0c50a0',0],['#2a78bc',0.28],['#58a2da',0.55],['#7ebef0',0.78],['#a4d6f8',1]],
    afternoon: [['#0e4e98',0],['#2a6ab4',0.28],['#508ec6',0.54],['#a87040',0.80],['#dc9248',0.92],['#eeb668',1]],
    evening:   [['#060918',0],['#170e38',0.16],['#621e50',0.36],['#bc4836',0.58],['#dc6a36',0.76],['#e88e4c',1]],
    night:     [['#010208',0],['#020610',0.16],['#040b1a',0.40],['#060e1e',0.64],['#0b1526',0.84],['#111e30',1]],
  };
  const sSt = SKY_STOPS[tod];
  const skyG = ctx.createLinearGradient(0,0,0,HORIZON_Y+60);
  for (const [c,p] of sSt) skyG.addColorStop(p,c);
  ctx.fillStyle = skyG;
  ctx.fillRect(0,0,cw,HORIZON_Y+60);

  // City glow bloom at horizon for night/evening
  if (night) {
    const cgG = ctx.createLinearGradient(0, HORIZON_Y-52, 0, HORIZON_Y+8);
    cgG.addColorStop(0, 'rgba(8,18,48,0)');
    cgG.addColorStop(0.52, 'rgba(12,24,58,0.17)');
    cgG.addColorStop(1, 'rgba(20,36,78,0.32)');
    ctx.fillStyle = cgG;
    ctx.fillRect(0, HORIZON_Y-52, cw, 60);
  }

  // ── Sun ───────────────────────────────────────────────────────────────────────
  if (hour >= 6 && hour < 18) {
    const sunT = clamp((hour-6)/12);
    const sunX = Math.round(cw*(0.90-sunT*0.80));
    const sunY = Math.round(HORIZON_Y*(0.84-Math.sin(sunT*Math.PI)*0.68));
    const sunR = tod==='dawn'?5:tod==='morning'||tod==='afternoon'?7:9;
    const sunC = tod==='dawn'?'#ff7838':tod==='morning'?'#ffc048':tod==='afternoon'?'#ffbe48':'#fff0a0';

    // Wide haze
    const sg2 = ctx.createRadialGradient(sunX,sunY,sunR*2,sunX,sunY,sunR*10);
    sg2.addColorStop(0,`rgba(255,220,120,${tod==='day'?'0.07':'0.12'})`);
    sg2.addColorStop(1,'rgba(255,220,120,0)');
    ctx.fillStyle=sg2; ctx.fillRect(sunX-sunR*10,sunY-sunR*10,sunR*20,sunR*20);
    // Inner glow
    const sg = ctx.createRadialGradient(sunX,sunY,sunR,sunX,sunY,sunR*4);
    sg.addColorStop(0,`rgba(255,230,150,${tod==='day'?'0.16':'0.22'})`);
    sg.addColorStop(1,'rgba(255,230,150,0)');
    ctx.fillStyle=sg; ctx.fillRect(sunX-sunR*4,sunY-sunR*4,sunR*8,sunR*8);
    // Disc
    ctx.fillStyle=sunC;
    ctx.beginPath(); ctx.arc(sunX,sunY,sunR,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=mixHex(sunC,'#ffffff',0.52);
    ctx.beginPath(); ctx.arc(sunX-1,sunY-1,Math.floor(sunR*0.40),0,Math.PI*2); ctx.fill();
  }

  // ── Moon ──────────────────────────────────────────────────────────────────────
  if (hour < 6 || hour >= 18) {
    const mHour = hour>=18 ? hour-18 : hour+6;
    const moonT = clamp(mHour/12);
    const moonX = Math.round(cw*(0.82-moonT*0.64));
    const moonY = Math.round(HORIZON_Y*(0.82-Math.sin(moonT*Math.PI)*0.60));
    const moonR = 7;
    // Halo
    const mg2 = ctx.createRadialGradient(moonX,moonY,moonR,moonX,moonY,moonR*6);
    mg2.addColorStop(0,'rgba(155,190,240,0.10)'); mg2.addColorStop(1,'rgba(155,190,240,0)');
    ctx.fillStyle=mg2; ctx.fillRect(moonX-moonR*6,moonY-moonR*6,moonR*12,moonR*12);
    // Full moon disc
    ctx.fillStyle='#c6daf0';
    ctx.beginPath(); ctx.arc(moonX,moonY,moonR,0,Math.PI*2); ctx.fill();
    // Surface shadow tone (lower-right)
    ctx.fillStyle='#a8c0e0';
    ctx.beginPath(); ctx.arc(moonX+2,moonY+2,Math.floor(moonR*0.70),0,Math.PI*2); ctx.fill();
    // Main lit face
    ctx.fillStyle='#d8ecff';
    ctx.beginPath(); ctx.arc(moonX-1,moonY-1,Math.floor(moonR*0.78),0,Math.PI*2); ctx.fill();
    // Bright highlight
    ctx.fillStyle='#eef6ff';
    ctx.beginPath(); ctx.arc(moonX-2,moonY-2,Math.floor(moonR*0.34),0,Math.PI*2); ctx.fill();
  }

  // ── Stars ─────────────────────────────────────────────────────────────────────
  if (hour>=20||hour<6||tod==='dawn'||tod==='evening') {
    const sAlpha = tod==='dawn'?0.13:tod==='evening'?0.21:0.56;
    for (let i=0;i<72;i++) {
      const stx = ((i*397+53)^(i*31))%cw;
      const sty = ((i*223+19)^(i*47))%Math.floor(HORIZON_Y*0.85);
      const tier = i<14?2:i<44?1:0;
      const baseA = tier===2?sAlpha:tier===1?sAlpha*0.60:sAlpha*0.30;
      const tw = i%3===0?0.22*(Math.sin((animTick/160+i*2.1)*Math.PI*2)*0.5+0.5):0;
      const a = Math.max(0.03, baseA*(1+tw*0.40));
      ctx.fillStyle = `rgba(${tier===2?'255,248,235':tier===1?'215,230,255':'170,195,238'},${a.toFixed(2)})`;
      ctx.fillRect(stx, sty, tier===2?2:1, tier===2?2:1);
    }
  }

  // ── Clouds ────────────────────────────────────────────────────────────────────
  if (!night) {
    const cBase = tod==='morning'?'rgba(255,246,230,':tod==='afternoon'?'rgba(255,238,208,':'rgba(255,255,255,';
    const cA = tod==='morning'||tod==='afternoon'?0.13:0.08;
    for (let i=0;i<4;i++) {
      const cx2=((animTick*(0.012+i*0.003))+i*220)%(cw+360)-180;
      const cy2=HORIZON_Y*(0.06+i*0.11);
      const cr2=65+i*28;
      const cg=ctx.createRadialGradient(cx2,cy2,4,cx2,cy2,cr2);
      cg.addColorStop(0,`${cBase}${cA})`);
      cg.addColorStop(0.55,`${cBase}${(cA*0.45).toFixed(3)})`);
      cg.addColorStop(1,`${cBase}0)`);
      ctx.fillStyle=cg; ctx.fillRect(cx2-cr2-8,cy2-cr2*0.42,(cr2+8)*2,cr2*0.85);
    }
  }

  // ── Airplane ──────────────────────────────────────────────────────────────────
  const pEpoch=Math.floor(animTick/1600), pSeed=((pEpoch*1234567+89)>>>0);
  if (pSeed%100<8) {
    const pDir=pSeed%2===0?1:-1, pT=(animTick%1600)/1600;
    const px=pDir>0?Math.round(pT*(cw+88)-44):Math.round((cw+44)-pT*(cw+88));
    const py=Math.round(HORIZON_Y*(0.16+(pSeed%60)/180));
    if (px>-44&&px<cw+44) {
      for (let ct=1;ct<=6;ct++) {
        const tx=pDir>0?px-22-ct*12:px+22+ct*12;
        ctx.fillStyle=`rgba(255,255,255,${(0.14-ct*0.020).toFixed(3)})`;
        ctx.fillRect(tx,py-1,Math.max(1,10-ct),2);
      }
      ctx.save(); ctx.translate(px,py); if(pDir<0) ctx.scale(-1,1);
      const pC=night?'#8ca0b8':'#ccdcee', pD=night?'#607080':'#9ab0c8';
      ctx.fillStyle=pC;
      ctx.fillRect(-19,-2,37,4); ctx.fillRect(17,-1,4,2); ctx.fillRect(-22,-4,6,2);
      ctx.fillRect(-7,-1,17,1); ctx.fillRect(-11,0,21,1); ctx.fillRect(-15,1,13,1); ctx.fillRect(-17,2,6,1);
      ctx.fillStyle=pD;
      ctx.fillRect(-20,-7,4,3); ctx.fillRect(-22,-2,8,1); ctx.fillRect(-22,1,8,1);
      ctx.fillRect(-8,2,9,2); ctx.fillRect(-8,4,3,1);
      ctx.fillStyle=night?'#2a3c50':'#88b8d8';
      for(let w=0;w<5;w++) ctx.fillRect(-6+w*5,-1,3,2);
      ctx.restore();
    }
  }

  // ── Ground base ───────────────────────────────────────────────────────────────
  const gG=ctx.createLinearGradient(0,HORIZON_Y,0,ch);
  gG.addColorStop(0,  tint(pal.road,  amb,lt*0.42));
  gG.addColorStop(0.5,tint(pal.road,  amb,lt*0.38));
  gG.addColorStop(1,  tint(pal.ground,amb,lt*0.32));
  ctx.fillStyle=gG; ctx.fillRect(0,HORIZON_Y,cw,ch-HORIZON_Y);

  // Horizon seam
  const hB=ctx.createLinearGradient(0,HORIZON_Y-18,0,HORIZON_Y+28);
  hB.addColorStop(0,'rgba(0,0,0,0)'); hB.addColorStop(0.45,'rgba(0,0,0,0.08)'); hB.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=hB; ctx.fillRect(0,HORIZON_Y-18,cw,46);

  // ── Layer loop ────────────────────────────────────────────────────────────────
  const allBuildings=[...cityBackdrop,...cityBuildings];

  for (let li=0;li<LAYERS.length;li++) {
    const lyr=LAYERS[li];
    const nextBase=li<LAYERS.length-1?LAYERS[li+1].baseY:ROAD_TOP;
    const gStripH=Math.min(22,nextBase-lyr.baseY);
    ctx.fillStyle=tint(pal.road,amb,lt*(0.32+li*0.060));
    ctx.fillRect(0,lyr.baseY,cw,gStripH);

    for (const b of allBuildings) {
      if (b.y<lyr.yMin||b.y>lyr.yMax) continue;
      if (li<=1&&(b.x+b.y)%2!==0) continue;
      const bsx=sxOf(b.x,b.w);
      if (bsx<-80||bsx>cw+80) continue;
      draw2DBuilding(b,lyr,amb,lt,tod);
    }

    for (const t of cityTrees) {
      if (t.y<lyr.yMin||t.y>lyr.yMax) continue;
      const tsx=sxOf(t.x,1);
      if (tsx<-24||tsx>cw+24) continue;
      draw2DTree(tsx,lyr.baseY,Math.max(4,Math.floor(lyr.tw*1.30)),tc,amb,lt);
    }

    if (li>=2) {
      const poleH=Math.max(6,Math.floor(lyr.fh*1.10));
      for (const lp of cityLamps) {
        if (lp.y<lyr.yMin||lp.y>lyr.yMax) continue;
        const lpx=sxOf(lp.x,1);
        if (lpx<-10||lpx>cw+10) continue;
        draw2DLamp(lpx,lyr.baseY,poleH,((lp.x*31+lp.y*13)%1000)/1000<=lighting.l,amb,lt);
      }
    }
  }

  // ── Sidewalk + road ───────────────────────────────────────────────────────────
  ctx.fillStyle=tint('#383c4a',amb,lt*0.54);
  ctx.fillRect(0,ROAD_TOP-SIDEWALK_H-CURB_H,cw,SIDEWALK_H);
  ctx.fillStyle=tint('#2e3240',amb,lt*0.48);
  for (let dx=0;dx<cw;dx+=30) ctx.fillRect(dx,ROAD_TOP-SIDEWALK_H-CURB_H,1,SIDEWALK_H);
  ctx.fillStyle=tint('#4a5066',amb,lt*0.56);
  ctx.fillRect(0,ROAD_TOP-CURB_H,cw,CURB_H);
  ctx.fillStyle=tint('#565c74',amb,lt*0.58);
  ctx.fillRect(0,ROAD_TOP-CURB_H,cw,1);

  ctx.fillStyle=tint(pal.road,amb,lt*0.58);
  ctx.fillRect(0,ROAD_TOP,cw,ROAD_H);
  ctx.fillStyle=tint('#565c6c',amb,lt*0.48);
  ctx.fillRect(0,ROAD_TOP+3,cw,2);
  ctx.fillRect(0,ROAD_TOP+ROAD_H-5,cw,2);

  const laneY=ROAD_TOP+Math.floor(ROAD_H*0.47);
  ctx.fillStyle=tint(tod==='day'||tod==='morning'?'#c0c8d8':'#a0a8bc',amb,lt*0.44);
  for (let dx=0;dx<cw;dx+=36) ctx.fillRect(dx,laneY,18,2);

  // ── Traffic ───────────────────────────────────────────────────────────────────
  const laneTop=ROAD_TOP+Math.floor(ROAD_H*0.20);
  const laneBot=ROAD_TOP+Math.floor(ROAD_H*0.68);
  for (const tr of cityTraffic) {
    if (tr.axis!=='h') continue;
    if (tr.carId%2!==0) continue;
    const t=(animTick*tr.speed+tr.offset)%1;
    const carX=tr.dir>0?t*(cw+60)-30:(cw+30)-t*(cw+60);
    if (carX<-15||carX>cw+15) continue;
    draw2DCar(tr,carX,tr.dir>0?laneTop:laneBot,tod);
  }

  // ── Bottom fill ───────────────────────────────────────────────────────────────
  ctx.fillStyle=tint(pal.ground,amb,lt*0.38);
  ctx.fillRect(0,ROAD_TOP+ROAD_H,cw,ch-ROAD_TOP-ROAD_H);
  ctx.fillStyle=tint('#323640',amb,lt*0.46);
  ctx.fillRect(0,ROAD_TOP+ROAD_H,cw,12);

  // ── Atmospheric fog ───────────────────────────────────────────────────────────
  const fogA=Math.min(0.28,(parseFloat(sky.fog.match(/[\d.]+(?=\))/)?.[0]||'0.10'))*lighting.fog);
  ctx.fillStyle=sky.fog.replace(/[\d.]+(?=\))/,fogA.toFixed(3));
  ctx.fillRect(0,0,cw,ch);

  if (state.running) animTick++;
}
