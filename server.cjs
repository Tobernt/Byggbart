const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = __dirname;
const portfolio = path.resolve(root, '../SoftwareEngineerPortfolio');
const port = Number(process.argv.find((arg) => arg.startsWith('--port='))?.slice(7) || 4398);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.md': 'text/plain; charset=utf-8',
};
http
  .createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const isPortfolio = pathname.startsWith('/portfolio/');
      const base = isPortfolio ? portfolio : root;
      let relative = isPortfolio ? pathname.slice('/portfolio/'.length) : pathname.slice(1);
      if (!relative) relative = 'index.html';
      if (
        relative.includes('\\') ||
        relative.split('/').some((part) => part === '..' || part === '.')
      )
        throw Error('Invalid path');
      if (
        !/^(index\.html|redovisning\.html|gallery\.html|assets\/[^?]+|src\/[^?]+|docs\/[a-zA-Z0-9_.-]+\.md)$/.test(
          relative,
        )
      )
        throw Error('Not allowed');
      const target = path.resolve(base, relative);
      if (!target.startsWith(base + path.sep) || !fs.statSync(target).isFile())
        throw Error('Not found');
      const data = fs.readFileSync(target);
      res.writeHead(200, {
        'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Sidan kunde inte hittas.');
    }
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Konferens: http://127.0.0.1:${port}/`);
    console.log(`Öva redovisning: http://127.0.0.1:${port}/redovisning.html`);
    if (process.argv.includes('--open'))
      spawn('cmd', ['/c', 'start', '', `http://127.0.0.1:${port}/redovisning.html`], {
        windowsHide: true,
        stdio: 'ignore',
      }).unref();
  })
  .on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
