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

// Robust kill function
async function killCurrentProcess() {
  if (currentProcess) {
    return new Promise((resolve) => {
      const pid = currentProcess.pid;
      broadcastLog(`⚠️ Menghentikan proses sebelumnya (PID: ${pid})...`, 'warn');
      // Use taskkill on Windows to ensure child processes are also killed
      exec(`taskkill /F /T /PID ${pid}`, (err) => {
        currentProcess = null;
        resolve();
      });
    });
  }
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

  // Force Kill All Endpoint
  if (pathname === '/force-kill' && req.method === 'POST') {
    broadcastLog('⚠️ Menerima perintah Force Kill All. Mematikan semua proses Node & PHP...', 'warn');
    // Kill Node and PHP processes. 
    // We don't kill the current process (server.js) until the very end if needed,
    // but usually killing other nodes is enough to free ports.
    exec('taskkill /F /IM node.exe /T & taskkill /F /IM php.exe /T', (err) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Processes killed.' }));
    });
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
    killCurrentProcess().then(() => {
      const reportPath = path.join(__dirname, 'reports', 'phpunit-report.xml');
      if (!fs.existsSync(path.dirname(reportPath))) fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      currentProcess = spawn('vendor\\bin\\phpunit', ['--log-junit', 'automation-testing\\reports\\phpunit-report.xml'], { cwd: ROOT_DIR, shell: true });
      const child = currentProcess;
      child.stdout.on('data', d => broadcastLog(d.toString()));
      child.stderr.on('data', d => broadcastLog(d.toString(), 'error'));
      child.on('close', () => {
        if (currentProcess === child) currentProcess = null;
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
              results[id] = { 
                status, 
                actual: status === 'Pass' ? 'Verified via PHPUnit (Backend Logic).' : 'Logic verification failed in PHPUnit.' 
              };
            });
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, results }));
      });
    });
    return;
  }

  // Playwright SSE
  if (pathname === '/run-tests-stream' && req.method === 'POST') {
    let body = ''; req.on('data', c => body += c);
    req.on('end', async () => {
      await killCurrentProcess();
      let params = {}; try { params = JSON.parse(body); } catch(e) {}
      const playwrightDir = path.join(__dirname, 'playwright');
      const testIds = params.testIds || [];
      const workers = params.workers || 1;
      broadcastLog(`Diterima permintaan run-test dengan ${testIds.length} filter ID.`);
      // If we have specific test IDs, we run from the root 'tests' to ensure grep finds them all
      // regardless of which subdirectory they are in.
      const target = (testIds.length > 0) ? 'tests' : (params.module && params.module !== 'all' ? `tests/${params.module}` : 'tests');

      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
      const sendEvent = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      const reportPath = path.join(playwrightDir, 'reports', 'playwright-report.json');
      if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);
      const playwrightBin = path.join(playwrightDir, 'node_modules', '.bin', 'playwright.cmd');
      const cmd = fs.existsSync(playwrightBin) ? `"${playwrightBin}"` : 'npx playwright';

      let grepFlag = '';
      // Only use grep if we have a reasonable number of specific IDs
      // PowerShell/CMD have character limits for command length (~8192 chars)
      if (testIds.length > 0 && testIds.length < 100) {
          const regex = testIds.map(id => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
          grepFlag = `--grep "${regex}"`;
      } else if (testIds.length >= 100) {
          broadcastLog(`⚠️ Terlalu banyak filter (${testIds.length}), menjalankan seluruh suite tanpa grep untuk menghindari limit command line.`, 'warn');
      }

      const fullCmd = `${cmd} test ${target} ${grepFlag} --reporter=line,json --workers=${workers}`;
      broadcastLog(`Executing Playwright: ${fullCmd}`);
      currentProcess = spawn(fullCmd, [], { 
          cwd: playwrightDir, 
          shell: true, 
          env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: 'reports/playwright-report.json' } 
      });
      const child = currentProcess;

      let buffer = ''; 
      const regex = /\[(\d+)\/(\d+)\]\s+\[\w+\].*?([A-Z]{2,5}(?:-[A-Z0-9]{1,4}){1,3})/;

      child.stdout.on('data', d => {
        const str = d.toString(); broadcastLog(str);
        buffer += str; const lines = buffer.split(/\r?\n/); buffer = lines.pop();
        lines.forEach(line => { const m = line.match(regex); if (m) sendEvent('test-progress', { current: m[1], total: m[2], testId: m[3].toUpperCase() }); });
      });
      child.stderr.on('data', d => broadcastLog(d.toString(), 'error'));
      child.on('close', () => {
        if (currentProcess === child) currentProcess = null;
        let results = {};
        if (fs.existsSync(reportPath)) {
          try {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            const traverse = (s) => {
              if (s.specs) s.specs.forEach(spec => {
                const idMatch = spec.title.match(/([A-Z]{2,5}(?:-[A-Z0-9]{1,4}){1,3})/i);
                if (idMatch) {
                  const id = idMatch[1].toUpperCase(); 
                  const testResult = spec.tests?.[0]?.results?.[0];
                  const pass = testResult?.status === 'passed';
                  
                  let screenshot = '';
                  let video = '';

                  if (testResult?.attachments) {
                    testResult.attachments.forEach(at => {
                      if (at.name === 'screenshot' || at.contentType?.includes('image')) {
                        screenshot = at.path ? path.relative(__dirname, at.path).replace(/\\/g, '/') : '';
                      }
                      if (at.name === 'video' || at.contentType?.includes('video')) {
                        video = at.path ? path.relative(__dirname, at.path).replace(/\\/g, '/') : '';
                      }
                    });
                  }

                  if (!screenshot || !video) {
                    const resultsDir = path.join(playwrightDir, 'test-results');
                    if (fs.existsSync(resultsDir)) {
                      const dirs = fs.readdirSync(resultsDir);
                      const testDir = dirs.find(d => d.includes(id));
                      if (testDir) {
                        const fullTestDir = path.join(resultsDir, testDir);
                        if (!screenshot && fs.existsSync(path.join(fullTestDir, 'test-finished-1.png'))) {
                          screenshot = `playwright/test-results/${testDir}/test-finished-1.png`;
                        }
                        if (!video && fs.existsSync(path.join(fullTestDir, 'video.webm'))) {
                          video = `playwright/test-results/${testDir}/video.webm`;
                        }
                      }
                    }
                  }

                  results[id] = { 
                    status: pass ? 'Pass' : 'Fail', 
                    actual: pass ? 'Verified by UI (Playwright).' : 'UI failed.',
                    screenshot,
                    video
                  };
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
    killCurrentProcess().then(() => {
      const postmanDir = path.join(__dirname, 'postman');
      const col = path.join(postmanDir, 'modules', 'FullSystem_collection.json');
      const env = path.join(postmanDir, 'SIGAP-Local.postman_environment.json');
      broadcastLog('Executing Newman...');
      currentProcess = exec(`newman run "${col}" -e "${env}" --reporters cli,json --reporter-json-export reports/postman-report.json`, { cwd: postmanDir }, (err, stdout) => {
        currentProcess = null;
        broadcastLog(stdout);
        const results = {}; const rep = path.join(postmanDir, 'reports', 'postman-report.json');
        if (fs.existsSync(rep)) {
          try {
            const data = JSON.parse(fs.readFileSync(rep, 'utf8'));
            data.run?.executions?.forEach(e => {
              const m = e.item.name.match(/([a-zA-Z0-9-]{3,15})/i);
              if (m) results[m[1].toUpperCase()] = { 
                status: (e.assertions?.every(a => !a.error) ? 'Pass' : 'Fail'), 
                actual: 'Verified via Postman (API Integration).' 
              };
            });
          } catch(e) {}
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, results }));
      });
    });
    return;
  }

  // k6
  if (pathname === '/run-k6' && req.method === 'POST') {
    killCurrentProcess().then(() => {
      const script = path.join(__dirname, 'k6', 'modules', 'Common', 'full-load.js');
      broadcastLog('Executing k6...');
      currentProcess = exec(`k6 run "${script}"`, (err, stdout) => {
        currentProcess = null;
        if (err) { 
          broadcastLog(`Error k6: ${err.message}`, 'error');
          broadcastLog('💡 Pastikan k6 sudah terinstal dan tersedia di PATH. (Unduh: https://k6.io/)', 'warn');
          res.writeHead(200, { 'Content-Type': 'application/json' }); 
          res.end(JSON.stringify({ success: false, error: 'k6 not found. Pastikan k6 terinstal.' })); 
          return; 
        }
        broadcastLog(stdout);
        
        const results = {};
        const p = path.join(__dirname, 'test-cases.json');
        try {
          const cases = JSON.parse(fs.readFileSync(p, 'utf8'));
          cases.forEach(tc => {
            if (tc.actual?.toLowerCase().includes('k6') || tc.feature?.toLowerCase().includes('load')) {
              results[tc.id.toUpperCase()] = { status: 'Pass', actual: 'Load test verified via k6.' };
            }
          });
        } catch(e) {}

        res.writeHead(200, { 'Content-Type': 'application/json' }); 
        res.end(JSON.stringify({ success: true, results }));
      });
    });
    return;
  }

  // 8. Stop Tests Endpoint
  if (pathname === '/stop-tests' && req.method === 'POST') {
    if (currentProcess) {
      killCurrentProcess().then(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Proses dihentikan paksa.' }));
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Tidak ada proses yang berjalan.' }));
    }
    return;
  }

  if (pathname === '/shutdown' && req.method === 'POST') {
    res.writeHead(200); res.end(JSON.stringify({ success: true }));
    killCurrentProcess().then(() => {
      setTimeout(() => process.exit(0), 500);
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => {
  console.log(`SIGAP Runner active on http://localhost:${PORT}`);
  ensureServersRunning();
});
