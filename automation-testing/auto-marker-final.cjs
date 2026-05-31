const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PHP_DIR = path.join(ROOT_DIR, 'tests', 'Feature');

const filesToMark = [
    {
        file: 'LpjTest.php',
        marks: [
            { method: 'test_bendahara_can_review_lpj', ids: ['LPJ-F-001', 'LPJ-I-007'] },
            { method: 'test_bendahara_can_revise_lpj', ids: ['LPJ-I-002', 'LPJ-I-009'] },
            { method: 'test_bendahara_can_approve_lpj', ids: ['LPJ-I-003', 'LPJ-I-011'] },
            { method: 'test_bendahara_can_complete_lpj', ids: ['LPJ-I-006'] },
            { method: 'test_pengusul_can_submit_lpj', ids: ['LPJ-I-001', 'LPJ-I-004'] }
        ]
    },
    {
        file: 'Admin/LogTest.php',
        marks: [
            { method: 'test_admin_can_view_logs_page', ids: ['LGN-I-003', 'USR-I-004', 'MK-F-006'] }
        ]
    }
];

filesToMark.forEach(config => {
    const fullPath = path.join(PHP_DIR, config.file);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    config.marks.forEach(mark => {
        // Use a more restricted regex to avoid over-greedy matching
        const docBlockRegex = new RegExp(`(\\/\\*\\*[^*]*\\*+([^/*][^*]*\\*+)*\\/\\s+)?public function\\s+${mark.method}`, 'g');
        
        content = content.replace(docBlockRegex, (match) => {
            const newDocBlock = `    /**\n     * Test Case: ${mark.ids.join(', ')}\n     */\n`;
            changed = true;
            return `${newDocBlock}    public function ${mark.method}`;
        });
    });

    if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Marked:', config.file);
    }
});
