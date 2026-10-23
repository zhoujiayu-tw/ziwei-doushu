import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const OpenCC = require(process.env.S + '/proto/node_modules/opencc-js');
const tw = OpenCC.Converter({ from: 'cn', to: 'tw' });
const stars = JSON.parse(fs.readFileSync('stars.6.json'));
const names = JSON.parse(fs.readFileSync('starnames.json'));
const lines = JSON.parse(fs.readFileSync('constellations.lines.cn.json'));
const cons = JSON.parse(fs.readFileSync('constellations.cn.json'));
const r2 = x => Math.round(x * 100) / 100;
const S = stars.features.filter(f => f.properties.mag < 5.0)
  .map(f => [r2(f.geometry.coordinates[0]), r2(f.geometry.coordinates[1]), r2(f.properties.mag), r2(parseFloat(f.properties.bv) || 0.6)]);
// 依 Bayer 名與星座找出要標示的星
const find = (bayer, c) => { for (const [id, n] of Object.entries(names)) if (n.bayer === bayer && n.c === c) { const f = stars.features.find(x => String(x.id) === id); if (f) return { hip: id, ra: f.geometry.coordinates[0], dec: f.geometry.coordinates[1], mag: f.properties.mag }; } return null; };
const KEY = {
  '勾陳一': ['α', 'UMi'], '北極二': ['β', 'UMi'],
  '天樞': ['α', 'UMa'], '天璇': ['β', 'UMa'], '天璣': ['γ', 'UMa'], '天權': ['δ', 'UMa'], '玉衡': ['ε', 'UMa'], '開陽': ['ζ', 'UMa'], '搖光': ['η', 'UMa'],
  '斗宿一': ['φ', 'Sgr'], '斗宿二': ['λ', 'Sgr'], '斗宿三': ['μ', 'Sgr'], '斗宿四': ['σ', 'Sgr'], '斗宿五': ['τ', 'Sgr'], '斗宿六': ['ζ', 'Sgr'],
};
const K = {};
for (const [k, [b, c]] of Object.entries(KEY)) { const s = find(b, c); if (!s) console.error('missing', k); K[k] = [r2(s.ra), r2(s.dec), s.mag, s.hip]; }
// 星官連線：重點星官另外標記
const HL = { '北斗': 'n', '勾陈': 'p', '北极': 'p', '紫微右垣': 'z', '紫微左垣': 'z', '斗宿': 's' };
const nameById = Object.fromEntries(cons.features.map(f => [f.id, f.properties.name]));
const L = [];
for (const f of lines.features) {
  const nm = nameById[f.id] || '';
  const tag = HL[nm] || '';
  for (const ls of f.geometry.coordinates) L.push([tag, ls.map(([a, d]) => [r2(a), r2(d)]).flat()]);
}
const labels = cons.features.filter(f => HL[f.properties.name] !== undefined || ['天市右垣', '太微左垣', '天皇大帝', '华盖', '五帝内座'].includes(f.properties.name))
  .map(f => [tw(f.properties.name), r2(f.properties.display[0]), r2(f.properties.display[1])]);
const out = { stars: S, key: K, lines: L, labels };
fs.writeFileSync('sky.json', JSON.stringify(out));
console.log('stars', S.length, 'lines', L.length, 'bytes', fs.statSync('sky.json').size);
console.log(K); console.log(labels);
