import http from 'http';
import { exec, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const PORT = 3001;

// Global array to hold SSE connections for general logs
let logClients = [];
let currentProcess = null;

function broadcastLog(msg, type = 'info') {
  const data = JSON.stringify({ msg, type });
  logClients.forEach(client => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (e) {}
  });
}

// Helper to check if a port is in use
function checkPortActive(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => { socket.destroy(); resolve(false); };
    socket.setTimeout(500);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => { socket.end(); resolve(true); });
  });
}

// Spawner without blocking
async function ensureServersRunning() {
  console.log('[SIGAP] Memeriksa status port server Laravel & Vite...');
  
  const isLaravelActive = await checkPortActive(8000);
  if (!isLaravelActive) {
    console.log('[SIGAP] ⚠️ Server Laravel belum aktif! Mencoba memulai...');
    const laravelProcess = spawn('php', ['artisan', 'serve'], { 
        cwd: ROOT_DIR, 
        detached: true, 
        stdio: 'ignore',
        shell: true 
    });
    laravelProcess.unref();
  }

  const isViteActive = await checkPortActive(5173);
  if (!isViteActive) {
    console.log('[SIGAP] ⚠️ Server Vite belum aktif! Mencoba memulai...');
    const viteProcess = spawn('cmd.exe', ['/c', 'npm run dev'], { 
        cwd: ROOT_DIR, 
        detached: true, 
        stdio: 'ignore' 
    });
    viteProcess.unref();
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Endpoint PING
  if (pathname === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // SSE Logs
  if (pathname === '/logs' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    logClients.push(res);
    req.on('close', () => { logClients = logClients.filter(c => c !== res); });
    return;
  }

  // Reset Results
  if (pathname === '/reset-results' && req.method === 'POST') {
    const p = path.join(__dirname, 'test-cases.json');
    try {
      if (fs.existsSync(p)) {
        const cases = JSON.parse(fs.readFileSync(p, 'utf8'));
        const reset = cases.map(tc => ({ ...tc, status: '', actual: '', screenshot: '', video: '' }));
        fs.writeFileSync(p, JSON.stringify(reset, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } else { res.writeHead(404); res.end(); }
    } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    return;
  }

  // Clear Artifacts
  if (pathname === '/clear-artifacts' && req.method === 'POST') {
    try {
      const playwrightDir = path.join(__dirname, 'playwright');
      const dirs = [ path.join(playwrightDir, 'test-results'), path.join(__dirname, 'reports'), path.join(playwrightDir, 'reports') ];
      dirs.forEach(dir => {
        if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir, { recursive: true });
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Artifacts cleared.' }));
    } catch (e) { res.writeHead(500); res.end(); }
    return;
  }

  // Static serving
  if (req.method === 'GET') {
    let localPath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const ext = path.extname(localPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(localPath).pipe(res);
      return;
    }
  }

  // PHPUnit
  if (pathname === '/run-phpunit' && req.method === 'POST') {
    const reportPath = path.join(__dirname, 'reports', 'phpunit-report.xml');
    if (!fs.existsSync(path.dirname(reportPath))) fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    currentProcess = spawn('vendor\\bin\\phpunit', ['--log-junit', 'automation-testing\\reports\\phpunit-report.xml'], { cwd: ROOT_DIR, shell: true });
    const child = currentProcess;
    child.stdout.on('data', d => broadcastLog(d.toString()));
    child.stderr.on('data', d => broadcastLog(d.toString(), 'error'));
    child.on('close', () => {
      const results = {};
      const mapping = fs.existsSync(path.join(__dirname, 'test-mapping.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'test-mapping.json'), 'utf8')) : {};
      if (fs.existsSync(reportPath)) {
        const xml = fs.readFileSync(reportPath, 'utf8');
        const regex = /<testcase\s+name="([^"]+)"(.*?)(?:><\/testcase>|\/>|>(.*?)<\/testcase>)/gs;
        let m;
        while ((m = regex.exec(xml)) !== null) {
          const methodName = m[1]; const inner = m[3] || '';
          let ids = mapping[methodName] || Object.entries(mapping).find(([k]) => methodName.includes(k))?.[1];
          if (ids && !Array.isArray(ids)) ids = [ids];
          if (ids) ids.forEach(id => {
            const status = (inner.includes('<failure') || inner.includes('<error')) ? 'Fail' : (inner.includes('<skipped') ? 'Skip' : 'Pass');
            results[id] = { status, actual: status === 'Pass' ? 'Verified by PHPUnit.' : 'Failed in PHPUnit.' };
          });
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, results }));
    });
    return;
  }

  // Playwright SSE
  if (pathname === '/run-tests-stream' && req.method === 'POST') {
    let body = ''; req.on('data', c => body += c);
    req.on('end', () => {
      let params = {}; try { params = JSON.parse(body); } catch(e) {}
      const playwrightDir = path.join(__dirname, 'playwright');
      const target = params.module && params.module !== 'all' ? `tests/${params.module}` : 'tests';
      const workers = params.workers || 1;

      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
      const sendEvent = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      const reportPath = path.join(playwrightDir, 'reports', 'playwright-report.json');
      if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath); 
      const playwrightBin = path.join(playwrightDir, 'node_modules', '.bin', 'playwright.cmd');
      const cmd = fs.existsSync(playwrightBin) ? `"${playwrightBin}"` : 'npx playwright';
      const fullCmd = `${cmd} test ${target} --reporter=line,json --workers=${workers}`;
      broadcastLog(`Executing Playwright: ${fullCmd}`);
      currentProcess = spawn(fullCmd, [], { 
          cwd: playwrightDir, 
          shell: true, 
          env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: 'reports/playwright-report.json' } 
      });
      const child = currentProcess;

      let buffer = ''; 
      // Improved regex: matches SIGAP pattern (e.g. LGN-F-001, TC-P-F01) and skips path segments
      const regex = /\[(\d+)\/(\d+)\]\s+\[\w+\].*?([A-Z]{2,5}(?:-[A-Z0-9]{1,4}){1,3})/;

      child.stdout.on('data', d => {
        const str = d.toString(); broadcastLog(str);
        buffer += str; const lines = buffer.split(/\r?\n/); buffer = lines.pop();
        lines.forEach(line => { const m = line.match(regex); if (m) sendEvent('test-progress', { current: m[1], total: m[2], testId: m[3].toUpperCase() }); });
      });
      child.stderr.on('data', d => broadcastLog(d.toString(), 'error'));
      child.on('close', () => {
        let results = {};
        if (fs.existsSync(reportPath)) {
          try {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            const traverse = (s) => {
              if (s.specs) s.specs.forEach(spec => {
                const idMatch = spec.title.match(/([A-Z]{2,5}(?:-[A-Z0-9]{1,4}){1,3})/i);
                if (idMatch) {
                  const id = idMatch[1].toUpperCase(); const pass = spec.tests?.[0]?.results?.slice(-1)[0]?.status === 'passed';
                  results[id] = { status: pass ? 'Pass' : 'Fail', actual: pass ? 'Verified by UI.' : 'UI failed.' };
                }
              });
              if (s.suites) s.suites.forEach(traverse);
            };
            report.suites?.forEach(traverse);
          } catch(e) {}
        }
        sendEvent('test-complete', { results }); res.end();
      });
    });
    return;
  }

  // Postman
  if (pathname === '/run-postman' && req.method === 'POST') {
    const postmanDir = path.join(__dirname, 'postman');
    const col = path.join(postmanDir, 'modules', 'FullSystem_collection.json');
    const env = path.join(postmanDir, 'SIGAP-Local.postman_environment.json');
    broadcastLog('Executing Newman...');
    exec(`newman run "${col}" -e "${env}" --reporters cli,json --reporter-json-export reports/postman-report.json`, { cwd: postmanDir }, (err, stdout) => {
      broadcastLog(stdout);
      const results = {}; const rep = path.join(postmanDir, 'reports', 'postman-report.json');
      if (fs.existsSync(rep)) {
        try {
          const data = JSON.parse(fs.readFileSync(rep, 'utf8'));
          data.run?.executions?.forEach(e => {
            const m = e.item.name.match(/([a-zA-Z0-9-]{3,15})/i);
            if (m) results[m[1].toUpperCase()] = { status: (e.assertions?.every(a => !a.error) ? 'Pass' : 'Fail'), actual: 'API validation complete.' };
          });
        } catch(e) {}
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, results }));
    });
    return;
  }

  // k6
  if (pathname === '/run-k6' && req.method === 'POST') {
    const script = path.join(__dirname, 'k6', 'modules', 'Common', 'full-load.js');
    broadcastLog('Executing k6...');
    exec(`k6 run "${script}"`, (err, stdout) => {
      if (err) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, error: 'k6 not found.' })); return; }
      broadcastLog(stdout); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // 8. Stop Tests Endpoint
  if (pathname === '/stop-tests' && req.method === 'POST') {
    if (currentProcess) {
      try {
        console.log('[SIGAP] Memaksa berhenti proses pengujian (Kill)...');
        broadcastLog('⚠️ Menghentikan paksa pengujian...', 'warn');
        
        // Use taskkill on Windows to ensure child processes are also killed
        exec(`taskkill /F /T /PID ${currentProcess.pid}`);
        currentProcess = null;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Proses dihentikan paksa.' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Tidak ada proses yang berjalan.' }));
    }
    return;
  }

  if (pathname === '/shutdown' && req.method === 'POST') {
    res.writeHead(200); res.end(JSON.stringify({ success: true }));
    setTimeout(() => process.exit(0), 500); return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => {
  console.log(`SIGAP Runner active on http://localhost:${PORT}`);
  ensureServersRunning();
});
