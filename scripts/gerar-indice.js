import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const raiz = 'produtos';
const dirs = (p) =>
  readdirSync(p).filter((n) => !n.startsWith('_') && statSync(join(p, n)).isDirectory()).sort();

let html = '';
for (const produto of dirs(raiz)) {
  html += `<h2>${produto}</h2>`;
  for (const fluxo of dirs(join(raiz, produto))) {
    const versoes = dirs(join(raiz, produto, fluxo)).filter((v) =>
      existsSync(join(raiz, produto, fluxo, v, 'index.html'))
    );
    html += `<h3>${fluxo}</h3><ul>${versoes
      .map((v) => `<li><a href="${produto}/${fluxo}/${v}/">${v}</a></li>`)
      .join('')}</ul>`;
  }
}

writeFileSync(
  join(raiz, 'index.html'),
  `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Protótipos</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem}</style>
<h1>Protótipos</h1>${html}</html>`
);
console.log('Índice gerado.');