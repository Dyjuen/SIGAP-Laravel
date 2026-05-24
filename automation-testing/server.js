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
  
  const isLaravelActive = await checkPortActive(8000);
  if (!isLaravelActive) {
    console.log('[SIGAP] ⚠️ Server Laravel (Port 8000) terdeteksi belum aktif!');
    console.log('[SIGAP] 🚀 Memulai server Laravel (php artisan serve) di background...');
    
    // Spawn PHP Artisan serve from root dir
    const laravelProcess = spawn('php', ['artisan', 'serve'], {
      cwd: ROOT_DIR,
      detached: true,
      stdio: 'ignore' // Ignore to avoid blocking terminal
    });
    laravelProcess.unref(); // Allow server.js to exit independently
  } else {
    console.log('[SIGAP] ✅ Server Laravel (Port 8000) sudah aktif.');
  }

  const isViteActive = await checkPortActive(5173);
  if (!isViteActive) {
    console.log('[SIGAP] ⚠️ Server Vite (Port 5173) terdeteksi belum aktif!');
    console.log('[SIGAP] 🚀 Memulai dev server Vite (npm run dev) di background...');
    
    // Spawn NPM run dev from root dir (executing shell command for cross-platform compatibility)
    const viteProcess = spawn('cmd.exe', ['/c', 'npm run dev'], {
      cwd: ROOT_DIR,
      detached: true,
      stdio: 'ignore'
    });
    viteProcess.unref();
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

  // 1. Static Serving for index.html at root "/"
  if ((pathname === '/' || pathname === '/index.html') && req.method === 'GET') {
    const indexPath = path.join(__dirname, 'index.html');
    fs.readFile(indexPath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Gagal memuat index.html. Pastikan file berada di folder automation-testing/.');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
      res.end(data);
    });
    return;
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
    const testsDir = path.join(__dirname, 'playwright', 'tests');
    const implementedIds = new Set();

    try {
      if (fs.existsSync(testsDir)) {
        const files = fs.readdirSync(testsDir);
        for (const file of files) {
          if (file.endsWith('.spec.js')) {
            const filePath = path.join(testsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            // Regex to find all patterns of AK-F-XXX
            const matches = content.match(/(AK-F-\d{3})/gi);
            if (matches) {
              matches.forEach(id => implementedIds.add(id.toUpperCase()));
            }
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        implemented: Array.from(implementedIds)
      }));
    } catch (errScanner) {
      console.error('[SIGAP] Gagal memindai berkas pengujian lokal:', errScanner);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Gagal memindai folder playwright/tests lokal.' }));
    }
    return;
  }

  if (pathname === '/run-tests' && req.method === 'POST') {
    const playwrightDir = path.join(__dirname, 'playwright');
    console.log(`[SIGAP] Menjalankan pengujian otomatis di: ${playwrightDir}`);
    
    // Execute Playwright with JSON reporter
    exec('npx playwright test --reporter=json', { cwd: playwrightDir }, (error, stdout, stderr) => {
      // Note: npx playwright test returns code 1 if tests fail, so error is expected to be present.
      // We must rely on parsing the stdout JSON.
      let jsonReport = null;
      try {
        const jsonStart = stdout.indexOf('{');
        if (jsonStart !== -1) {
          jsonReport = JSON.parse(stdout.substring(jsonStart));
        }
      } catch (e) {
        console.error('[SIGAP] Gagal parse Playwright JSON output:', e);
      }

      if (!jsonReport) {
        console.error('[SIGAP] Playwright stdout tidak mengandung JSON valid:', stderr);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Playwright tidak menghasilkan laporan JSON. Pastikan dependencies sudah terinstall dengan menjalankan "npm install" di folder playwright.',
          stdout,
          stderr
        }));
        return;
      }

      // Map Playwright outcome to individual test case IDs (AK-F-001 ~ AK-F-012)
      const results = {};

      function traverseSuite(suite) {
        if (!suite) return;

        // Try to match test case ID from suite title (e.g. "AK-F-004: Otorisasi Role")
        let matchedId = null;
        if (suite.title) {
          const match = suite.title.match(/(AK-F-\d{3})/i);
          if (match) {
            matchedId = match[1].toUpperCase();
          }
        }

        if (suite.specs) {
          for (const spec of suite.specs) {
            let specId = matchedId;
            if (!specId && spec.title) {
              const specMatch = spec.title.match(/(AK-F-\d{3})/i);
              if (specMatch) specId = specMatch[1].toUpperCase();
            }

            if (spec.tests) {
              for (const testRun of spec.tests) {
                const latestResult = testRun.results && testRun.results[testRun.results.length - 1];
                const isPassed = latestResult && latestResult.status === 'passed';
                
                // Get error message if failed
                let errorMsg = '';
                if (latestResult && latestResult.error) {
                  errorMsg = latestResult.error.message || 'Assertion failed';
                  // Clean ANSI color codes from error message
                  errorMsg = errorMsg.replace(/\u001b\[[0-9;]*m/g, '');
                }

                // Extract screenshot & video attachments
                let screenshotPath = '';
                let videoPath = '';
                if (latestResult && latestResult.attachments) {
                  for (const attachment of latestResult.attachments) {
                    if (attachment.path) {
                      // Normalize path to relative URL from automation-testing/ directory
                      // In this upgraded server, we serve test-results via static routes /playwright/test-results/...
                      // attachment.path is an absolute path. Let's make it relative to the 'playwright/test-results' folder.
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
                  // Initialize result object for this ID
                  if (!results[specId]) {
                    results[specId] = { 
                      status: 'Pass', 
                      actual: 'Semua langkah pengujian otomatis berhasil diverifikasi oleh Playwright.',
                      screenshot: '',
                      video: ''
                    };
                  }
                  
                  // If any test in the spec failed, the entire test case fails
                  if (!isPassed) {
                    results[specId].status = 'Fail';
                    results[specId].actual = errorMsg || 'Gagal dalam asersi otomatis Playwright.';
                  }

                  // Assign proof paths if they exist
                  if (screenshotPath) {
                    results[specId].screenshot = screenshotPath;
                  }
                  if (videoPath) {
                    results[specId].video = videoPath;
                  }
                }
              }
            }
          }
        }

        if (suite.suites) {
          for (const subSuite of suite.suites) {
            traverseSuite(subSuite);
          }
        }
      }

      if (jsonReport.suites) {
        for (const suite of jsonReport.suites) {
          traverseSuite(suite);
        }
      }

      console.log(`[SIGAP] Pengujian selesai. Menemukan ${Object.keys(results).length} hasil terpetakan.`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        results
      }));
    });
  } else if (pathname === '/generate-test' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      let params = null;
      try {
        params = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload JSON tidak valid' }));
        return;
      }

      const { apiKey, testCase } = params;
      if (!apiKey || !testCase || !testCase.id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'apiKey dan testCase (id) wajib disertakan' }));
        return;
      }

      const playwrightDir = path.join(__dirname, 'playwright');
      const testsDir = path.join(playwrightDir, 'tests');

      // 1. Gather context from existing spec and helpers
      let authHelperCode = '';
      let crudSpecCode = '';
      try {
        const authPath = path.join(playwrightDir, 'helpers', 'auth.js');
        if (fs.existsSync(authPath)) {
          authHelperCode = fs.readFileSync(authPath, 'utf8');
        }
        const crudPath = path.join(testsDir, 'kegiatan-crud.spec.js');
        if (fs.existsSync(crudPath)) {
          crudSpecCode = fs.readFileSync(crudPath, 'utf8');
        }
      } catch (err) {
        console.warn('[SIGAP] Gagal membaca berkas bantuan konteks:', err);
      }

      // 2. Formulate prompt for Gemini
      const prompt = `Anda adalah AI Software Engineer senior spesialis otomasi pengujian Playwright.
Tugas Anda adalah membuat satu blok pengujian Playwright (menggunakan \`test('...', async ({ page }) => { ... })\`) untuk skenario pengujian di bawah ini untuk aplikasi SIGAP-Laravel (Laravel 11 + Inertia.js React + Tailwind CSS).

Informasi Aplikasi Penting:
- Aplikasi Laravel berjalan di http://localhost:8000
- Gunakan helper autentikasi yang sudah ada untuk masuk jika diperlukan.

Gunakan berkas autentikasi bantuan dan pola pengujian CRUD berikut sebagai panduan konvensi dan struktur penulisan kode Anda:
---
BANTUAN AUTENTIKASI:
${authHelperCode}
---
CONTOH PENGUJIAN LAIN:
${crudSpecCode}
---

Informasi Skenario Uji yang Harus Dibuat:
- ID Test Case: ${testCase.id}
- Fitur: ${testCase.feature}
- Skenario: ${testCase.scenario}
- Input Pengujian: ${testCase.input}
- Hasil yang Diharapkan: ${testCase.expected}

Aturan Penulisan Kode Uji:
1. Pastikan Anda mengimpor helper autentikasi dengan benar: \`const { loginAs } = require('../helpers/auth');\` (karena file ini akan disimpan di folder \`playwright/tests\`).
2. Tulis blok pengujian mandiri menggunakan \`test('${testCase.id}: ${testCase.scenario}', async ({ page }) => { ... });\`.
3. Gunakan \`test.describe('${testCase.feature}', () => { ... })\` hanya jika diperlukan, tetapi lebih baik tulis blok pengujian tunggal yang mandiri.
4. Gunakan asersi yang kuat dan tepat menggunakan \`expect\`.
5. Sisipkan pengambilan screenshot sebagai bukti di akhir pengujian atau saat terjadi kesalahan jika dirasa perlu, tetapi Playwright secara default dikonfigurasi merekam screenshot/video saat terjadi kegagalan.
6. Kembalikan HANYA kode JavaScript executable yang utuh dan bersih. Jangan dibungkus dengan markdown blocks (\`\`\`js atau \`\`\`).

Kembalikan respon JSON dengan skema objek yang memiliki properti 'code' berisi string kode JavaScript executable tersebut.`;

      // 3. Make HTTP request to Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              code: { type: 'STRING', description: 'The exact executable Playwright JS test code block.' }
            },
            required: ['code']
          }
        }
      });

      console.log(`[SIGAP] Meminta pembuatan uji otomatis dari Gemini API untuk ID: ${testCase.id}`);

      let geminiResponseText = '';
      const reqGemini = https.request(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, (resGemini) => {
        resGemini.setEncoding('utf8');
        resGemini.on('data', chunk => { geminiResponseText += chunk; });
        resGemini.on('end', () => {
          if (resGemini.statusCode !== 200) {
            console.error('[SIGAP] Gemini API mengembalikan status error:', resGemini.statusCode, geminiResponseText);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Gagal menghubungi Gemini API', details: geminiResponseText }));
            return;
          }

          let geminiJson = null;
          try {
            geminiJson = JSON.parse(geminiResponseText);
          } catch (e) {
            console.error('[SIGAP] Gagal parse respon Gemini:', e);
          }

          if (!geminiJson || !geminiJson.candidates || !geminiJson.candidates[0] || !geminiJson.candidates[0].content || !geminiJson.candidates[0].content.parts || !geminiJson.candidates[0].content.parts[0]) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Respon Gemini API tidak lengkap/kosong', raw: geminiResponseText }));
            return;
          }

          let responseData = null;
          try {
            responseData = JSON.parse(geminiJson.candidates[0].content.parts[0].text.trim());
          } catch (e) {
            console.error('[SIGAP] Gagal parse JSON terstruktur dari teks Gemini:', e);
          }

          if (!responseData || !responseData.code) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Respon Gemini tidak menghasilkan properti "code" yang valid', raw: geminiResponseText }));
            return;
          }

          // 4. Write generated code to playwright/tests/kegiatan-generated.spec.js
          const generatedFilePath = path.join(testsDir, 'kegiatan-generated.spec.js');
          let fileContent = '';

          if (!fs.existsSync(generatedFilePath)) {
            // Write standard header for first time
            fileContent = `// Auto-generated Test Suite for SIGAP-Laravel by AI Test Generator
const { test, expect } = require('@playwright/test');
const { loginAs } = require('../helpers/auth');

`;
          } else {
            fileContent = fs.readFileSync(generatedFilePath, 'utf8') + '\n\n';
          }

          // Clean any markdown formatting if present
          let cleanCode = responseData.code.trim();
          if (cleanCode.startsWith('```')) {
            cleanCode = cleanCode.replace(/^```javascript\r?\n|^```js\r?\n|^```\r?\n/, '');
            cleanCode = cleanCode.replace(/\r?\n```$/, '');
          }

          fileContent += `// === TEST CASE ${testCase.id} ===\n${cleanCode}`;

          try {
            fs.writeFileSync(generatedFilePath, fileContent, 'utf8');
            console.log(`[SIGAP] Berhasil menulis/menambah kode uji di: ${generatedFilePath}`);
          } catch (errWrite) {
            console.error('[SIGAP] Gagal menulis berkas pengujian:', errWrite);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Gagal menyimpan berkas pengujian otomatis di server lokal' }));
            return;
          }

          // 5. Execute only the generated test case targeting ID
          const escapedId = testCase.id.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const playwrightCmd = `npx playwright test kegiatan-generated.spec.js -g "${escapedId}" --reporter=json`;
          console.log(`[SIGAP] Mengeksekusi pengujian otomatis baru: ${playwrightCmd}`);

          exec(playwrightCmd, { cwd: playwrightDir }, (error, stdout, stderr) => {
            let runReport = null;
            try {
              const jsonStart = stdout.indexOf('{');
              if (jsonStart !== -1) {
                runReport = JSON.parse(stdout.substring(jsonStart));
              }
            } catch (e) {
              console.error('[SIGAP] Gagal parsing output Playwright JSON:', e);
            }

            if (!runReport) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'Playwright tidak menghasilkan laporan JSON pasca pembuatan.',
                stdout,
                stderr
              }));
              return;
            }

            // Extract results specifically for this test case
            let status = 'Fail';
            let actual = 'Gagal dalam asersi otomatis Playwright.';
            let screenshot = '';
            let video = '';

            function traverseGeneratedSuite(suite) {
              if (!suite) return;
              if (suite.specs) {
                for (const spec of suite.specs) {
                  if (spec.title && spec.title.toUpperCase().includes(testCase.id.toUpperCase())) {
                    if (spec.tests) {
                      for (const testRun of spec.tests) {
                        const latestResult = testRun.results && testRun.results[testRun.results.length - 1];
                        const isPassed = latestResult && latestResult.status === 'passed';
                        
                        if (isPassed) {
                          status = 'Pass';
                          actual = 'Semua langkah pengujian otomatis berhasil diverifikasi oleh Playwright.';
                        } else if (latestResult && latestResult.error) {
                          actual = (latestResult.error.message || 'Assertion failed').replace(/\u001b\[[0-9;]*m/g, '');
                        }

                        if (latestResult && latestResult.attachments) {
                          for (const attachment of latestResult.attachments) {
                            if (attachment.path) {
                              const resultsFolder = path.join(playwrightDir, 'test-results');
                              const relativePath = path.relative(resultsFolder, attachment.path).replace(/\\/g, '/');
                              if (attachment.name === 'screenshot' || (attachment.contentType && attachment.contentType.startsWith('image/'))) {
                                screenshot = `/playwright/test-results/${relativePath}`;
                              } else if (attachment.name === 'video' || (attachment.contentType && attachment.contentType.startsWith('video/'))) {
                                video = `/playwright/test-results/${relativePath}`;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              if (suite.suites) {
                for (const subSuite of suite.suites) {
                  traverseGeneratedSuite(subSuite);
                }
              }
            }

            if (runReport.suites) {
              for (const suite of runReport.suites) {
                traverseGeneratedSuite(suite);
              }
            }

            console.log(`[SIGAP] Selesai memproses AI Test Run untuk ${testCase.id}. Status: ${status}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              result: {
                status,
                actual,
                screenshot,
                video
              }
            }));
          });
        });
      });

      reqGemini.on('error', (errGemini) => {
        console.error('[SIGAP] Error koneksi ke Gemini API:', errGemini);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Kesalahan jaringan saat menghubungi Gemini API', details: errGemini.message }));
      });

      reqGemini.write(payload);
      reqGemini.end();
    });
  } else if (pathname === '/ping' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'SIGAP Test Runner Companion Server is online.' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan' }));
  }
});

// Run background process fallback check before listening
ensureServersRunning().then(() => {
  server.listen(PORT, () => {
    console.log(`======================================================================`);
    console.log(`🚀 SIGAP Test Runner Companion Server is running!`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`======================================================================`);
    console.log(`Tekan Ctrl+C untuk menghentikan server.`);
  });
});

