const fs = require('fs');
const path = require('path');

const phpFile = path.join(__dirname, '..', 'tests', 'Feature', 'KegiatanTest.php');
let content = fs.readFileSync(phpFile, 'utf8');

// Fix the bad injection from powershell
content = content.replace(/`r`n/g, '\n');

// Add missing markers for TC-K-I03
if (!content.includes('TC-K-I03')) {
    content = content.replace('public function test_wadir_approve_triggers_email', 
        '/**\n     * Test Case: TC-K-I03 - Modul PPK-WD2 [Integrasi]: Wadir approve -> Bendahara-Cair Aktif + email terkirim\n     */\n    public function test_wadir_approve_triggers_email');
}

// Add markers for others if missing
const mappings = [
    { method: 'test_kegiatan_submission_is_rate_limited', ids: ['AK-I-011', 'TC-K-I03'] }, // TC-K-I03 might be wrong here, but let's follow the list
];

// Actually, let's just do a clean fix for the specific ones I found
content = content.replace(/\/\*\* `\n\s*\* Test Case: TC-K-I03[\s\S]*?` \n\s*\*\//g, ''); // Cleanup bad injection

fs.writeFileSync(phpFile, content);
console.log('Fixed KegiatanTest.php');
