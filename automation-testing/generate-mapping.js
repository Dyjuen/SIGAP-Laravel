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
            // Match JSDoc blocks and the following public function name
            const blockRegex = /\/\*\*([\s\S]*?)\*\/[\s\S]*?public function\s+(\w+)/g;
            let blockMatch;
            while ((blockMatch = blockRegex.exec(content)) !== null) {
                const docBlock = blockMatch[1];
                const methodName = blockMatch[2];
                
                // Find all patterns like "KAK-FT-001" or "TC-K-F03" inside this docBlock
                const idRegex = /([A-Z]{1,5}-?[A-Z]{0,2}-?\d{1,4})/gi;
                let idMatch;
                const ids = [];
                const seenIds = new Set();
                while ((idMatch = idRegex.exec(docBlock)) !== null) {
                    const id = idMatch[1].toUpperCase().trim();
                    if (!seenIds.has(id)) {
                        ids.push(id);
                        seenIds.add(id);
                    }
                }
                if (ids.length > 0) {
                    mapping[methodName] = ids;
                }
            }
        }
    }
}

scanDir(PHP_DIR);
fs.writeFileSync(path.join(__dirname, 'test-mapping.json'), JSON.stringify(mapping, null, 2));
console.log(`[SIGAP] Mapped ${Object.keys(mapping).length} PHPUnit methods to Test IDs.`);
