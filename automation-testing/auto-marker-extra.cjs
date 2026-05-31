const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PHP_DIR = path.join(ROOT_DIR, 'tests', 'Feature');

const filesToMark = [
    {
        file: 'KegiatanTest.php',
        marks: [
            { method: 'test_pengusul_can_view_index_and_see_approved_kak', ids: ['TC-K-F03'] },
            { method: 'test_pengusul_can_submit_kegiatan', ids: ['AK-F-001', 'AK-I-001', 'AK-I-007', 'AK-I-012', 'TC-K-F04', 'TC-K-I01', 'TC-K-F20', 'TC-K-F21', 'AK-U-001', 'AK-F-006'] },
            { method: 'test_pengusul_cannot_submit_from_unapproved_kak', ids: ['AK-I-002', 'TC-K-F07', 'AK-U-011'] },
            { method: 'test_pengusul_cannot_submit_duplicate_kegiatan_for_same_kak', ids: ['AK-I-003', 'TC-K-F06', 'AK-F-016'] },
            { method: 'test_oversized_file_rejection', ids: ['AK-F-003', 'AK-U-002'] },
            { method: 'test_invalid_file_type_rejection', ids: ['AK-F-002', 'AK-F-021'] },
            { method: 'test_ppk_can_approve_kegiatan', ids: ['TC-K-F08', 'TC-K-I02', 'TC-K-F22', 'AK-I-015', 'AK-U-005', 'AK-U-013'] },
            { method: 'test_wadir_can_approve_after_ppk', ids: ['TC-K-F09', 'MK-I-001', 'AK-I-014'] },
            { method: 'test_store_kegiatan_is_atomic', ids: ['AK-I-004', 'AK-U-015'] },
            { method: 'test_cascade_delete_kak_deletes_kegiatan', ids: ['AK-I-006', 'AK-F-007'] },
            { method: 'test_kegiatan_life_cycle', ids: ['MK-I-001', 'AK-U-014'] },
            { method: 'test_ppk_can_view_pending_kegiatan_in_index', ids: ['TC-K-F01'] },
            { method: 'test_wadir_can_view_pending_kegiatan_in_index', ids: ['TC-K-F02'] },
            { method: 'test_can_view_kegiatan_details', ids: ['TC-K-F13', 'AK-F-015'] },
            { method: 'test_kegiatan_submission_is_rate_limited', ids: ['AK-I-011'] },
            { method: 'test_wadir_approve_triggers_email', ids: ['TC-K-I03', 'TC-K-U07'] }
        ]
    },
    {
        file: 'Kegiatan/MonitoringKegiatanTest.php',
        marks: [
            { method: 'test_pengusul_can_only_see_own_kegiatan', ids: ['MK-F-002', 'TC-K-F15', 'AK-U-007'] },
            { method: 'test_verifikator_can_only_see_matching_tipe_kegiatan', ids: ['MK-F-011', 'TC-K-F16', 'AK-F-013'] },
            { method: 'test_admin_can_see_all_kegiatan', ids: ['TC-K-F14', 'AK-F-004'] }
        ]
    },
    {
        file: 'KakCrudTest.php',
        marks: [
            { method: 'test_authenticated_user_can_view_kak_index', ids: ['KAK-FT-022'] },
            { method: 'test_unauthenticated_user_cannot_access_kak', ids: ['KAK-FT-021'] },
            { method: 'test_pengusul_can_create_kak_with_all_children', ids: ['KAK-FT-001', 'KAK-FT-023'] },
            { method: 'test_pengusul_can_view_kak_detail', ids: ['KAK-FT-016', 'KAK-FT-022'] },
            { method: 'test_pengusul_can_update_draft_kak', ids: ['KAK-FT-012'] },
            { method: 'test_pengusul_cannot_update_approved_kak', ids: ['KAK-FT-013'] },
            { method: 'test_pengusul_can_delete_draft_kak', ids: ['KAK-FT-017'] },
            { method: 'test_pengusul_cannot_delete_reviewed_kak', ids: ['KAK-FT-035'] }
        ]
    }
];

filesToMark.forEach(config => {
    const fullPath = path.join(PHP_DIR, config.file);
    if (!fs.existsSync(fullPath)) {
        console.warn('File not found:', fullPath);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    config.marks.forEach(mark => {
        // Look for any existing docblock before the method
        const docBlockRegex = new RegExp(`(\\/\\*\\*[\\s\\S]*?\\*\\/\\s+)?public function\\s+${mark.method}`, 'g');
        
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
