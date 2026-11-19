import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const raiz = 'produtos';

const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ordenar = (a, b) => a.localeCompare(b, 'pt-BR', { numeric: true });

// Procura pastas com index.html. Ao achar um protótipo, não desce mais.
function coletar(dir, rel = '') {
  const achados = [];
  const nomes = readdirSync(dir)
    .filter((n) => !n.startsWith('_') && !n.startsWith('.'))
    .sort(ordenar);

  for (const nome of nomes) {
    const caminho = join(dir, nome);
    if (!statSync(caminho).isDirectory()) continue;
    const relNovo = rel ? `${rel}/${nome}` : nome;
    if (existsSync(join(caminho, 'index.html'))) {
      achados.push(relNovo);
    } else {
      achados.push(...coletar(caminho, relNovo));
    }
  }
  return achados;
}

// Agrupa pelo primeiro nível (cliente ou produto)
const grupos = new Map();
for (const p of coletar(raiz)) {
  const [grupo, ...resto] = p.split('/');
  const rotulo = resto.length ? resto.join('/') : grupo;
  if (!grupos.has(grupo)) grupos.set(grupo, []);
  grupos.get(grupo).push({ caminho: p, rotulo });
}

let html = '';
for (const [grupo, itens] of grupos) {
  html += `<h2>${esc(grupo)}</h2><ul>${itens
    .map((i) => `<li><a href="${esc(i.caminho)}/">${esc(i.rotulo)}</a></li>`)
    .join('')}</ul>`;
}

writeFileSync(
  join(raiz, 'index.html'),
  `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Protótipos</title>
<style>
body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem}
ul{padding-left:1.2rem}li{margin:.3rem 0}
</style>
<h1>Protótipos</h1>${html || '<p>Nenhum protótipo ainda.</p>'}</html>`
);
console.log(`Índice gerado com ${[...grupos.values()].flat().length} protótipos.`);