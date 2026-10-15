'use strict';
// C++ Dojo server: static files, a small JSON API, a WebSocket for the terminal
// and a streaming proxy to Ollama for the tutor chat.
//
// It only listens on 127.0.0.1 and rejects requests whose Host or Origin is not
// this server, because it compiles and runs code: a web page on another site must
// never be able to talk to it.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const lib = require('./lib/curriculum');
const progress = require('./lib/progress');
const tutor = require('./lib/tutor');
const { Job, getToolchain } = require('./lib/runner');

const HOST = '127.0.0.1';
const START_PORT = Number(process.env.PORT) || 4173;
const ROOT = lib.ROOT;

const STATIC_MOUNTS = [
  ['/vendor/monaco/', path.join(ROOT, 'node_modules', 'monaco-editor', 'min')],
  ['/vendor/xterm/', path.join(ROOT, 'node_modules', '@xterm', 'xterm')],
  ['/vendor/xterm-fit/', path.join(ROOT, 'node_modules', '@xterm', 'addon-fit')],
  ['/', path.join(ROOT, 'public')],
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

let allowedHosts = new Set();

function hostOk(req) {
  return allowedHosts.has(req.headers.host);
}

// Browsers always send Origin on cross-site requests and WebSocket upgrades.
// A missing Origin means a non-browser client on this machine.
function originOk(req) {
  const origin = req.headers.origin;
  if (origin === undefined) return true;
  return [...allowedHosts].some((h) => origin === `http://${h}`);
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readJsonBody(req, limit = 400_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error('Request body too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        resolve(parsed && typeof parsed === 'object' ? parsed : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  for (const [prefix, dir] of STATIC_MOUNTS) {
    if (!pathname.startsWith(prefix)) continue;
    let rel = pathname.slice(prefix.length);
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    let decoded;
    try {
      decoded = decodeURIComponent(rel);
    } catch {
      res.writeHead(400).end('Bad request');
      return true;
    }
    const file = path.resolve(dir, decoded);
    if (file !== dir && !file.startsWith(dir + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return true;
    }
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file).pipe(res);
    return true;
  }
  return false;
}

function exerciseView(ex) {
  return {
    id: ex.id,
    track: ex.track,
    title: ex.title,
    summary: ex.summary,
    concepts: ex.concepts,
    minutes: ex.minutes,
    hintCount: ex.hints.length,
  };
}

function requireExercise(res, id) {
  const ex = lib.findExercise(id);
  if (!ex) sendJson(res, 404, { error: 'Unknown exercise' });
  return ex;
}

async function handleApi(req, res, pathname) {
  const method = req.method;
  let m;

  if (method === 'GET' && pathname === '/api/status') {
    const tc = getToolchain();
    return sendJson(res, 200, {
      compiler: tc.cmd ? { name: tc.cmd, version: tc.version, std: tc.std, sanitizers: tc.sanitizers } : null,
    });
  }

  if (method === 'GET' && pathname === '/api/models') {
    const result = await tutor.listModels();
    return sendJson(res, 200, { ...result, settings: progress.getSettings() });
  }

  if (method === 'PUT' && pathname === '/api/settings') {
    const body = await readJsonBody(req);
    return sendJson(res, 200, progress.setSettings(body));
  }

  if (method === 'GET' && pathname === '/api/curriculum') {
    const tracks = lib.listTracks().map((t) => ({
      id: t.id,
      title: t.title,
      blurb: t.blurb,
      exercises: t.exercises.map((ex) => ({ ...exerciseView(ex), progress: progress.view(ex.id) })),
    }));
    return sendJson(res, 200, { tracks });
  }

  if ((m = pathname.match(/^\/api\/exercise\/([^/]+)$/)) && method === 'GET') {
    const ex = requireExercise(res, m[1]);
    if (!ex) return;
    const p = progress.view(ex.id);
    return sendJson(res, 200, {
      ...exerciseView(ex),
      prompt: lib.readPrompt(ex),
      code: lib.readCode(ex),
      hints: ex.hints.slice(0, p.hintsUsed),
      progress: p,
    });
  }

  if ((m = pathname.match(/^\/api\/exercise\/([^/]+)\/code$/)) && method === 'PUT') {
    const ex = requireExercise(res, m[1]);
    if (!ex) return;
    const body = await readJsonBody(req);
    if (typeof body.code !== 'string' || body.code.length > 200_000) {
      return sendJson(res, 400, { error: 'code must be a string of at most 200,000 characters' });
    }
    lib.writeCode(ex, body.code);
    return sendJson(res, 200, { ok: true });
  }

  if ((m = pathname.match(/^\/api\/exercise\/([^/]+)\/hint$/)) && method === 'POST') {
    const ex = requireExercise(res, m[1]);
    if (!ex) return;
    const index = progress.useHint(ex.id, ex.hints.length);
    if (index === null) return sendJson(res, 409, { error: 'You have already seen every hint.' });
    return sendJson(res, 200, {
      index,
      hint: ex.hints[index],
      remaining: ex.hints.length - index - 1,
      progress: progress.view(ex.id),
    });
  }

  if ((m = pathname.match(/^\/api\/exercise\/([^/]+)\/reveal$/)) && method === 'POST') {
    const ex = requireExercise(res, m[1]);
    if (!ex) return;
    const body = await readJsonBody(req);
    const p = progress.view(ex.id);
    if (!body.confirm) return sendJson(res, 400, { error: 'Confirmation required.' });
    if (p.attempts < 1) {
      return sendJson(res, 403, { error: 'Run the tests at least once before looking at the reference solution.' });
    }
    if (p.hintsUsed < ex.hints.length) {
      return sendJson(res, 403, { error: 'Use all the hints first: they are cheaper than the answer.' });
    }
    const reference = lib.readReference(ex);
    if (reference === null) return sendJson(res, 404, { error: 'No reference solution for this exercise.' });
    return sendJson(res, 200, { code: reference, progress: progress.markRevealed(ex.id) });
  }

  if ((m = pathname.match(/^\/api\/exercise\/([^/]+)\/reset$/)) && method === 'POST') {
    const ex = requireExercise(res, m[1]);
    if (!ex) return;
    return sendJson(res, 200, { code: lib.archiveAndReset(ex) });
  }

  if ((m = pathname.match(/^\/api\/exercise\/([^/]+)\/review$/)) && method === 'POST') {
    const ex = requireExercise(res, m[1]);
    if (!ex) return;
    const p = progress.startReview(ex.id);
    if (!p) return sendJson(res, 409, { error: 'Solve the exercise before reviewing it.' });
    return sendJson(res, 200, { code: lib.archiveAndReset(ex), progress: p, hints: [] });
  }

  if (method === 'POST' && pathname === '/api/chat') {
    const body = await readJsonBody(req);
    const ex = lib.findExercise(body.exerciseId);
    if (!ex) return sendJson(res, 404, { error: 'Unknown exercise' });
    if (typeof body.model !== 'string' || !body.model) {
      return sendJson(res, 400, { error: 'Choose a model first.' });
    }
    const messages = tutor.buildMessages(body, ex, lib.readPrompt(ex));
    res.writeHead(200, {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    });
    return tutor.streamChat({ model: body.model, messages }, res);
  }

  return sendJson(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  try {
    if (!hostOk(req) || !originOk(req)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' }).end('Forbidden');
      return;
    }
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname.startsWith('/api/')) {
      await handleApi(req, res, pathname);
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end('Method not allowed');
      return;
    }
    if (pathname === '/favicon.ico') {
      res.writeHead(204).end();
      return;
    }
    if (!serveStatic(req, res, pathname)) res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  } catch (e) {
    if (res.headersSent) {
      res.end();
      return;
    }
    sendJson(res, e.status || 500, { error: e.status ? e.message : 'Internal error' });
    if (!e.status) console.error(e);
  }
});

// ---------------------------------------------------------------------------
// WebSocket: compile / run / test and stream the output
// ---------------------------------------------------------------------------

const wss = new WebSocketServer({ noServer: true, maxPayload: 400_000 });

server.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname !== '/ws' || !hostOk(req) || !originOk(req)) {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws));
});

wss.on('connection', (ws) => {
  let job = null;
  const send = (obj) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
  };

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'run' || msg.type === 'test') {
      if (job) return send({ type: 'error', message: 'A program is already running. Stop it first.' });
      const ex = lib.findExercise(msg.exerciseId);
      if (!ex) return send({ type: 'error', message: 'Unknown exercise.' });
      if (typeof msg.code !== 'string' || msg.code.length > 200_000) {
        return send({ type: 'error', message: 'The code is missing or too large.' });
      }
      lib.writeCode(ex, msg.code);
      const current = new Job({ mode: msg.type, workDir: lib.workDir(ex), exerciseDir: ex.dir });
      job = current;
      current.on('phase', (phase) => send({ type: 'phase', phase }));
      current.on('out', (data) => send({ type: 'out', data }));
      current.on('done', (summary) => {
        let view = progress.view(ex.id);
        if (msg.type === 'test' && summary.compiled && !summary.killed) {
          const r = summary.results;
          const passedAll = Boolean(r && r.total > 0 && r.failed === 0 && summary.exitCode === 0 && !summary.timedOut);
          view = progress.recordTestRun(ex.id, passedAll);
          summary.passedAll = passedAll;
        }
        job = null;
        send({ type: 'done', mode: msg.type, exerciseId: ex.id, summary, progress: view });
      });
      current.start().catch((e) => {
        console.error(e);
        if (job === current) {
          job = null;
          send({ type: 'error', message: 'The runner failed unexpectedly.' });
        }
      });
      return;
    }

    if (msg.type === 'stdin' && job && typeof msg.data === 'string') return job.writeStdin(msg.data);
    if (msg.type === 'stdin-end' && job) return job.endStdin();
    if (msg.type === 'kill' && job) return job.kill();
  });

  ws.on('close', () => {
    if (job) job.kill();
  });
});

// ---------------------------------------------------------------------------

function listen(port, attemptsLeft) {
  server.once('error', (e) => {
    if (e.code === 'EADDRINUSE' && attemptsLeft > 0) listen(port + 1, attemptsLeft - 1);
    else {
      console.error(`Could not start the server: ${e.message}`);
      process.exit(1);
    }
  });
  server.listen(port, HOST, () => {
    allowedHosts = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);
    const url = `http://localhost:${port}`;
    const tc = getToolchain();
    console.log('');
    console.log('  C++ Dojo');
    console.log(`  ${url}`);
    console.log('');
    if (tc.cmd) {
      console.log(`  compiler:   ${tc.version} (${tc.std}${tc.sanitizers ? ', sanitizers on' : ', sanitizers unavailable'})`);
    } else {
      console.log('  compiler:   NOT FOUND (macOS: run `xcode-select --install`)');
    }
    console.log(`  tutor:      Ollama at ${tutor.ollamaBase()}`);
    console.log('');
    if (process.argv.includes('--open')) {
      const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      require('child_process').spawn(opener, [url], { stdio: 'ignore', detached: true }).unref();
    }
  });
}

if (require.main === module) listen(START_PORT, 10);

module.exports = { server, listen };
