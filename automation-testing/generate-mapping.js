import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const PHP_DIR = path.join(ROOT_DIR, 'tests', 'Feature');

const mapping = {};

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.php')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Match JSDoc style comments containing Test Case IDs and the following function name
            const regex = /\/\*\*[\s\S]*?Test Case:\s*([A-Z0-9-]+)[\s\S]*?\*\/[\s\S]*?public function\s+(\w+)/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const id = match[1].toUpperCase();
                const method = match[2];
                mapping[method] = id;
            }
        }
    }
}

scanDir(PHP_DIR);
fs.writeFileSync(path.join(__dirname, 'test-mapping.json'), JSON.stringify(mapping, null, 2));
console.log(`[SIGAP] Mapped ${Object.keys(mapping).length} PHPUnit methods to Test IDs.`);
