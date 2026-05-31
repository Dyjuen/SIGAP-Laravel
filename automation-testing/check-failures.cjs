const fs = require('fs');
const path = require('path');

// === Playwright failures ===
console.log('=== PLAYWRIGHT FAILURES ===');
try {
  const r = JSON.parse(fs.readFileSync('playwright/reports/playwright-report.json', 'utf8'));
  function traverse(s) {
    if (!s) return;
    if (s.specs) {
      for (const sp of s.specs) {
        if (sp.tests) {
          for (const tt of sp.tests) {
            const lr = tt.results && tt.results[tt.results.length - 1];
            if (lr && lr.status !== 'passed' && lr.status !== 'skipped') {
              const id = (sp.title || '').match(/([A-Z]{1,5}-?[A-Z]?-?\d{1,4})/i);
              const err = (lr.error && lr.error.message || '').replace(/\x1b\[[0-9;]*m/g, '').slice(0, 300);
              console.log(`[${lr.status}] ${id ? id[1] : '?'} - ${sp.title}`);
              console.log(`  Error: ${err}`);
            }
          }
        }
      }
    }
    if (s.suites) s.suites.forEach(traverse);
  }
  r.suites.forEach(traverse);
} catch(e) { console.log('Playwright report error:', e.message); }

// === Postman failures ===
console.log('\n=== POSTMAN FAILURES ===');
try {
  const r = JSON.parse(fs.readFileSync('postman/reports/postman-report.json', 'utf8'));
  if (r.run && r.run.executions) {
    r.run.executions.forEach(e => {
      const failed = e.assertions && e.assertions.filter(a => a.error);
      if (failed && failed.length) {
        const id = (e.item.name || '').match(/([A-Z]{1,5}-?[A-Z]?-?\d{1,4})/i);
        console.log(`[FAIL] ${id ? id[1] : '?'} - ${e.item.name}`);
        failed.forEach(a => console.log(`  ${a.error.message}`));
      }
    });
  }
} catch(e) { console.log('Postman report error:', e.message); }

console.log('\nDone.');
