const fs = require('fs');
const path = require('path');

const phpFile = path.join(__dirname, '..', 'tests', 'Feature', 'Kegiatan', 'MonitoringKegiatanTest.php');
let content = fs.readFileSync(phpFile, 'utf8');

content = content.replace('public function test_pengusul_can_only_see_own_kegiatan(): void', 
    '/**\n     * Test Case: MK-F-002 - Monitoring Kegiatan: Visibilitas Pengusul\n     */\n    public function test_pengusul_can_only_see_own_kegiatan(): void');

content = content.replace('public function test_verifikator_can_only_see_matching_tipe_kegiatan(): void', 
    '/**\n     * Test Case: MK-F-011, TC-K-F16\n     */\n    public function test_verifikator_can_only_see_matching_tipe_kegiatan(): void');

content = content.replace('public function test_admin_can_see_all_kegiatan(): void', 
    '/**\n     * Test Case: TC-K-F14\n     */\n    public function test_admin_can_see_all_kegiatan(): void');

fs.writeFileSync(phpFile, content);
console.log('Fixed MonitoringKegiatanTest.php');
