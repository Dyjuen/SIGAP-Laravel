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

// Global array to hold SSE connections
let logClients = [];

function broadcastLog(msg, type = 'info') {
  const data = JSON.stringify({ msg, type });
  logClients.forEach(client => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (e) {
      // ignore
    }
  });
}

// Helper to check if a port is in use (server running)
function checkPortActive(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(1000);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

// Fallback background process spawner
async function ensureServersRunning() {
  console.log('[SIGAP] Memeriksa status port server Laravel & Vite...');
  broadcastLog('Memeriksa status port server Laravel & Vite...');
  
  const isLaravelActive = await checkPortActive(8000);
  if (!isLaravelActive) {
    console.log('[SIGAP] ⚠️ Server Laravel (Port 8000) terdeteksi belum aktif!');
    broadcastLog('⚠️ Server Laravel (Port 8000) belum aktif. Mencoba memulai...', 'warn');
    
    // Spawn PHP Artisan serve from root dir
    const laravelProcess = spawn('php', ['artisan', 'serve'], {
      cwd: ROOT_DIR,
      detached: true,
      stdio: 'ignore'
    });
    laravelProcess.unref(); 

    // Wait up to 10 seconds for it to start
    let attempts = 0;
    while (attempts < 10) {
      if (await checkPortActive(8000)) break;
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
  } else {
    console.log('[SIGAP] ✅ Server Laravel (Port 8000) sudah aktif.');
  }

  const isViteActive = await checkPortActive(5173);
  if (!isViteActive) {
    console.log('[SIGAP] ⚠️ Server Vite (Port 5173) terdeteksi belum aktif!');
    broadcastLog('⚠️ Server Vite (Port 5173) belum aktif. Mencoba memulai...', 'warn');
    
    const viteProcess = spawn('cmd.exe', ['/c', 'npm run dev'], {
      cwd: ROOT_DIR,
      detached: true,
      stdio: 'ignore'
    });
    viteProcess.unref();

    let attempts = 0;
    while (attempts < 10) {
      if (await checkPortActive(5173)) break;
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
  } else {
    console.log('[SIGAP] ✅ Server Vite (Port 5173) sudah aktif.');
  }
}

// Mime types helper for static files serving
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  // CORS Headers to allow browser access via dynamic origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL pathname
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // 0. Server-Sent Events for Live Logs
  if (pathname === '/logs' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    logClients.push(res);
    req.on('close', () => {
      logClients = logClients.filter(c => c !== res);
    });
    return;
  }

  // 12. Shutdown Endpoint
  if (req.url === '/shutdown' && req.method === 'POST') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ success: true, message: 'Server is shutting down...' }));
    console.log('🛑 [SIGAP] Shutdown command received. Closing server...');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
    return;
  }

  // 1. Generic Static Serving for automation-testing/ directory
  if (req.method === 'GET' && !pathname.includes('..')) {
    const localPath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const ext = path.extname(localPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(localPath).pipe(res);
      return;
    }
  }

  // 2. Static Serving for assets inside "/playwright/test-results"
  if (pathname.startsWith('/playwright/test-results/') && req.method === 'GET') {
    const relativeFilePath = decodeURIComponent(pathname.substring('/playwright/test-results/'.length));
    const fullAssetPath = path.join(__dirname, 'playwright', 'test-results', relativeFilePath);
    
    // Safety check to prevent directory traversal
    if (!fullAssetPath.startsWith(path.join(__dirname, 'playwright', 'test-results'))) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Akses Dilarang');
      return;
    }

    fs.stat(fullAssetPath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File tidak ditemukan');
        return;
      }

      const ext = path.extname(fullAssetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(fullAssetPath).pipe(res);
    });
    return;
  }

  // 3. Static Serving for assets inside "/reports"
  if (pathname.startsWith('/reports/') && req.method === 'GET') {
    const relativeFilePath = decodeURIComponent(pathname.substring('/reports/'.length));
    const fullAssetPath = path.join(__dirname, 'reports', relativeFilePath);

    // Safety check
    if (!fullAssetPath.startsWith(path.join(__dirname, 'reports'))) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Akses Dilarang');
      return;
    }

    fs.stat(fullAssetPath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Laporan tidak ditemukan');
        return;
      }

      const ext = path.extname(fullAssetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(fullAssetPath).pipe(res);
    });
    return;
  }

  // 4. Automated Codebase Scanner endpoint
  if (pathname === '/implemented-tests' && req.method === 'GET') {
    const playwrightDir = path.join(__dirname, 'playwright', 'tests');
    const phpunitDir = path.join(ROOT_DIR, 'tests', 'Feature');
    const implementedIds = new Set();

    function scanDir(dir, extension) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir, { recursive: true });
        for (const file of files) {
          if (file.endsWith(extension)) {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = content.match(/([A-Z]{1,5}-?[A-Z]?-?\d{1,4})/gi);
            if (matches) {
              matches.forEach(id => implementedIds.add(id.toUpperCase()));
            }
          }
        }
      }
    }

    try {
      scanDir(playwrightDir, '.spec.js');
      scanDir(phpunitDir, '.php');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        implemented: Array.from(implementedIds)
      }));
    } catch (errScanner) {
      console.error('[SIGAP] Gagal memindai berkas pengujian:', errScanner);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Gagal memindai folder pengujian.' }));
    }
    return;
  }

  if (pathname === '/run-phpunit' && req.method === 'POST') {
    console.log('[SIGAP] Menjalankan PHPUnit feature tests...');
    
    const reportPath = path.join(__dirname, 'reports', 'phpunit-report.xml');
    
    // Ensure reports dir exists
    if (!fs.existsSync(path.dirname(reportPath))) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    }
    
    // Execute PHPUnit using spawn for streaming output
    const child = spawn('vendor\\bin\\phpunit', ['--log-junit', 'automation-testing\\reports\\phpunit-report.xml'], { cwd: ROOT_DIR, shell: true });
    
    child.stdout.on('data', (data) => {
      broadcastLog(data.toString());
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      broadcastLog(data.toString(), 'error');
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      const results = {};
      const mappingPath = path.join(__dirname, 'test-mapping.json');
      let mapping = {};
      
      if (fs.existsSync(mappingPath)) {
        mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
      }

      // Parse XML report
      if (fs.existsSync(reportPath)) {
        const xmlContent = fs.readFileSync(reportPath, 'utf8');
        
        // Match each testcase block: <testcase name="..." ...> ... </testcase> or <testcase ... />
        const testCaseRegex = /<testcase\s+name="([^"]+)"(.*?)(?:><\/testcase>|\/>|>(.*?)<\/testcase>)/gs;
        
        let match;
        while ((match = testCaseRegex.exec(xmlContent)) !== null) {
          let methodName = match[1];
          const innerContent = match[3] || '';
          
          // Try to map it
          const mappedId = mapping[methodName] || Object.entries(mapping).find(([m, id]) => m.includes(methodName) || methodName.includes(m))?.[1];
          
          if (mappedId) {
            const hasFailure = innerContent.includes('<failure') || innerContent.includes('<error');
            const hasSkipped = innerContent.includes('<skipped');
            
            if (hasFailure) {
              results[mappedId] = { status: 'Fail', actual: 'Gagal diverifikasi oleh PHPUnit logic test.' };
            } else if (hasSkipped) {
              results[mappedId] = { status: 'Skip', actual: 'Dilewati oleh PHPUnit logic test.' };
            } else {
              results[mappedId] = { status: 'Pass', actual: 'Diverifikasi oleh PHPUnit logic test.' };
            }
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'PHPUnit selesai dijalankan.', 
        results
      }));
    });
    return;
  }
  if (pathname === '/run-tests' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let params = {};
      try { params = JSON.parse(body); } catch(e) {}
      
      const moduleName = params.module || 'all';
      const playwrightDir = path.join(__dirname, 'playwright');
      
      // Determine which folder to run
      let targetPath = 'tests';
      if (moduleName !== 'all') {
        targetPath = `tests/${moduleName}`;
        // If folder doesn't exist (e.g. mapping mismatch), fallback to all tests
        if (!fs.existsSync(path.join(playwrightDir, targetPath))) {
          targetPath = 'tests';
        }
      }

      console.log(`[SIGAP] Menjalankan Playwright (${moduleName}) di: ${targetPath}`);
      
      const reportPath = path.join(playwrightDir, 'reports', 'playwright-report.json');
      if (!fs.existsSync(path.dirname(reportPath))) {
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      }

      const env = Object.assign({}, process.env, {
        PLAYWRIGHT_JSON_OUTPUT_NAME: 'reports/playwright-report.json'
      });

      const child = spawn('npx', ['playwright', 'test', targetPath, '--reporter=line,json'], { 
        cwd: playwrightDir, 
        shell: true,
        env: env
      });

      child.stdout.on('data', (data) => {
        broadcastLog(data.toString());
      });

      child.stderr.on('data', (data) => {
        broadcastLog(data.toString(), 'error');
      });

      child.on('close', (code) => {
        let jsonReport = null;
        if (fs.existsSync(reportPath)) {
          try {
            jsonReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          } catch (e) {
            console.error('[SIGAP] Gagal parse Playwright JSON output:', e);
          }
        }

        if (!jsonReport) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Playwright tidak menghasilkan laporan JSON. Pastikan dependencies sudah terinstall.'
          }));
          return;
        }

        const results = {};

        function traverseSuite(suite) {
          if (!suite) return;
          let matchedId = null;
          if (suite.title) {
            const match = suite.title.match(/([A-Z]{1,5}-?[A-Z]?-?\d{1,4})/i);
            if (match) matchedId = match[1].toUpperCase();
          }

          if (suite.specs) {
            for (const spec of suite.specs) {
              let specId = matchedId;
              if (!specId && spec.title) {
                const specMatch = spec.title.match(/([A-Z]{1,5}-?[A-Z]?-?\d{1,4})/i);
                if (specMatch) specId = specMatch[1].toUpperCase();
              }

              if (spec.tests) {
                for (const testRun of spec.tests) {
                  const latestResult = testRun.results && testRun.results[testRun.results.length - 1];
                  const isPassed = latestResult && latestResult.status === 'passed';
                  
                  let errorMsg = '';
                  if (latestResult && latestResult.error) {
                    errorMsg = latestResult.error.message || 'Assertion failed';
                    errorMsg = errorMsg.replace(/\u001b\[[0-9;]*m/g, '');
                  }

                  let screenshotPath = '';
                  let videoPath = '';
                  if (latestResult && latestResult.attachments) {
                    for (const attachment of latestResult.attachments) {
                      if (attachment.path) {
                        const resultsFolder = path.join(playwrightDir, 'test-results');
                        const relativePath = path.relative(resultsFolder, attachment.path).replace(/\\/g, '/');
                        if (attachment.name === 'screenshot' || (attachment.contentType && attachment.contentType.startsWith('image/'))) {
                          screenshotPath = `/playwright/test-results/${relativePath}`;
                        } else if (attachment.name === 'video' || (attachment.contentType && attachment.contentType.startsWith('video/'))) {
                          videoPath = `/playwright/test-results/${relativePath}`;
                        }
                      }
                    }
                  }

                  if (specId) {
                    if (!results[specId]) {
                      results[specId] = { 
                        status: 'Pass', 
                        actual: 'Semua langkah pengujian otomatis berhasil diverifikasi.',
                        screenshot: '',
                        video: ''
                      };
                    }
                    if (!isPassed) {
                      results[specId].status = 'Fail';
                      results[specId].actual = errorMsg || 'Gagal dalam asersi otomatis.';
                    }
                    if (screenshotPath) results[specId].screenshot = screenshotPath;
                    if (videoPath) results[specId].video = videoPath;
                  }
                }
              }
            }
          }
          if (suite.suites) {
            for (const subSuite of suite.suites) traverseSuite(subSuite);
          }
        }

        if (jsonReport.suites) {
          for (const suite of jsonReport.suites) traverseSuite(suite);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, results }));
      });
    });
    return;
  }

  if (pathname === '/save-manual-test' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let params = null;
      try {
        params = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload JSON tidak valid' }));
        return;
      }

      const { testId, feature, scenario, code } = params;
      if (!testId || !code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'testId dan code wajib disertakan' }));
        return;
      }

      const manualFilePath = path.join(__dirname, 'playwright', 'tests', 'kegiatan-manual.spec.js');
      let currentContent = '';
      
      if (fs.existsSync(manualFilePath)) {
        currentContent = fs.readFileSync(manualFilePath, 'utf8');
      } else {
        currentContent = `// Manual Test Suite for SIGAP-Laravel\nconst { test, expect } = require('@playwright/test');\nconst { loginAs } = require('../helpers/auth');\n\n`;
      }

      const testBlockRegex = new RegExp(`// === TEST CASE ${testId} ===[\\s\\S]*?(?=\\/\\/ === TEST CASE|$)`, 'g');
      const newTestBlock = `// === TEST CASE ${testId} ===\n// Feature: ${feature || 'General'}\n// Scenario: ${scenario || 'Manual'}\n${code}\n\n`;

      let updatedContent;
      if (testBlockRegex.test(currentContent)) {
        updatedContent = currentContent.replace(testBlockRegex, newTestBlock);
      } else {
        updatedContent = currentContent + newTestBlock;
      }

      try {
        fs.writeFileSync(manualFilePath, updatedContent, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Test case ${testId} berhasil disimpan.` }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Gagal menyimpan file manual spec.' }));
      }
    });
    return;
  }

  if (pathname === '/run-postman' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let params = {};
      try { params = JSON.parse(body); } catch(e) {}
      
      const moduleName = params.module || 'all';
      const postmanDir = path.join(__dirname, 'postman');
      const envPath = path.join(postmanDir, 'SIGAP-Local.postman_environment.json');
      
      // Determine which collection to run
      let collectionPath = path.join(postmanDir, 'modules', 'FullSystem_collection.json');
      if (moduleName !== 'all') {
        const modCollection = path.join(postmanDir, 'modules', moduleName, 'collection.json');
        if (fs.existsSync(modCollection)) {
          collectionPath = modCollection;
        }
      }

      console.log(`[SIGAP] Menjalankan Newman (${moduleName}) untuk: ${collectionPath}`);
      
      // Execute Newman with JSON reporter to parse results
      exec(`newman run "${collectionPath}" -e "${envPath}" --reporters cli,json --reporter-json-export reports/postman-report.json`, { cwd: postmanDir }, (error, stdout, stderr) => {
        const results = {};
        const reportPath = path.join(postmanDir, 'reports', 'postman-report.json');
        
        if (fs.existsSync(reportPath)) {
          try {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            if (report.run && report.run.executions) {
              report.run.executions.forEach(exec => {
                const name = exec.item.name;
                // Match ID from request name (e.g. "KAK-FT-001 - Login")
                const idMatch = name.match(/([A-Z]{1,5}-?[A-Z]?-?\d{1,4})/i);
                if (idMatch) {
                  const id = idMatch[1].toUpperCase();
                  const failed = exec.assertions && exec.assertions.some(a => a.error);
                  results[id] = {
                    status: failed ? 'Fail' : 'Pass',
                    actual: failed ? 'Gagal dalam verifikasi asersi API.' : 'Semua endpoint API berhasil divalidasi.'
                  };
                }
              });
            }
          } catch(e) {
            console.error('[SIGAP] Gagal parse Newman report:', e);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, results }));
      });
    });
    return;
  }

  if (pathname === '/run-k6' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let params = {};
      try { params = JSON.parse(body); } catch(e) {}
      
      const moduleName = params.module || 'all';
      const k6Dir = path.join(__dirname, 'k6');
      
      // Determine script
      let scriptPath = path.join(k6Dir, 'modules', 'Common', 'full-load.js');
      if (moduleName !== 'all') {
        const modScript = path.join(k6Dir, 'modules', moduleName, 'load.js');
        if (fs.existsSync(modScript)) {
          scriptPath = modScript;
        }
      }

      console.log(`[SIGAP] Menjalankan k6 Load Test (${moduleName}) script: ${scriptPath}`);
      
      exec(`k6 run "${scriptPath}"`, { cwd: k6Dir }, (error, stdout, stderr) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: !error, stdout, stderr }));
      });
    });
    return;
  }

  if (pathname === '/ping' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'SIGAP Test Runner Companion Server is online.' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan' }));
});

ensureServersRunning().then(() => {
  server.listen(PORT, () => {
    console.log(`======================================================================`);
    console.log(`🚀 SIGAP Test Runner Companion Server is running!`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`======================================================================`);
  });
});
