const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PHP_DIR = path.join(ROOT_DIR, 'tests', 'Feature');

const filesToMark = [
    {
        file: 'Auth/AuthenticationTest.php',
        marks: [
            { method: 'test_login_screen_can_be_rendered', ids: ['LGN-F-001'] },
            { method: 'test_users_can_authenticate_using_the_login_screen', ids: ['LGN-F-002'] },
            { method: 'test_users_can_not_authenticate_with_invalid_username', ids: ['LGN-F-003', 'LGN-F-005'] },
            { method: 'test_users_can_not_authenticate_with_invalid_password', ids: ['LGN-F-004'] },
            { method: 'test_users_can_logout', ids: ['LGN-I-002', 'D-UAT-002'] },
            { method: 'test_authenticated_user_is_redirected_to_role_dashboard', ids: ['LGN-F-002', 'LGN-I-005'] },
            { method: 'test_login_is_rate_limited', ids: ['LGN-F-009'] },
            { method: 'test_users_can_authenticate_with_remember_me', ids: ['LGN-F-013'] },
            { method: 'test_login_prevents_sql_injection', ids: ['LGN-F-003', 'LGN-F-004'] },
            { method: 'test_login_validates_input_length', ids: ['LGN-F-003', 'LGN-F-006', 'LGN-F-007', 'LGN-F-008'] },
            { method: 'test_session_is_regenerated_on_login', ids: ['LGN-I-001'] }
        ]
    },
    {
        file: 'DashboardTest.php',
        marks: [
            { method: 'test_guest_redirected_to_login', ids: ['TC-D-F15', 'LGN-F-015', 'AK-F-028'] },
            { method: 'test_rektorat_redirected_to_direktur_dashboard', ids: ['TC-D-F01', 'TC-D-I01'] },
            { method: 'test_pengusul_sees_own_stats', ids: ['TC-D-F02', 'TC-D-U01', 'AK-U-001'] },
            { method: 'test_ppk_sees_pending_queue', ids: ['TC-D-F03', 'TC-K-I04', 'TC-D-U02'] },
            { method: 'test_wadir_sees_pending_queue', ids: ['TC-D-F04'] },
            { method: 'test_verifikator_filters_by_tipe_kegiatan', ids: ['TC-D-F05'] },
            { method: 'test_verifikator_without_suffix_sees_all_kak', ids: ['TC-D-F06'] },
            { method: 'test_bendahara_sees_ready_to_disburse', ids: ['TC-D-F07', 'TC-D-F18', 'TC-D-U05'] }
        ]
    },
    {
        file: 'Admin/AccountTest.php',
        marks: [
            { method: 'test_admin_can_view_user_management_page', ids: ['USR-F-001', 'D-UAT-004'] },
            { method: 'test_non_admin_cannot_view_user_management_page', ids: ['LGN-I-004'] },
            { method: 'test_admin_can_create_user', ids: ['USR-F-015', 'USR-I-001'] },
            { method: 'test_admin_can_update_user', ids: ['USR-F-017', 'USR-F-018'] },
            { method: 'test_admin_can_change_user_password', ids: ['USR-F-019'] },
            { method: 'test_admin_can_delete_user', ids: ['USR-F-024', 'USR-I-003'] },
            { method: 'test_admin_cannot_delete_self', ids: ['USR-F-025'] }
        ]
    },
    {
        file: 'Admin/PanduanTest.php',
        marks: [
            { method: 'test_admin_can_view_panduan_page', ids: ['TC-P-F01'] },
            { method: 'test_non_admin_cannot_view_panduan_page', ids: ['TC-P-F02', 'TC-P-I05'] },
            { method: 'test_admin_can_create_document_panduan', ids: ['TC-P-F05', 'TC-P-I01', 'TC-P-U01'] },
            { method: 'test_admin_can_create_video_panduan', ids: ['TC-P-F04', 'TC-P-F07', 'TC-P-U02'] },
            { method: 'test_admin_can_update_panduan', ids: ['TC-P-F12', 'TC-P-U04'] },
            { method: 'test_admin_can_delete_panduan', ids: ['TC-P-F16', 'TC-P-I02', 'TC-P-U05'] }
        ]
    },
    {
        file: 'PencairanTest.php',
        marks: [
            { method: 'test_bendahara_can_view_pencairan_index', ids: ['PD-F-004', 'PD-F-005', 'PD-F-020'] },
            { method: 'test_index_only_shows_kegiatan_at_bendahara_cair_aktif', ids: ['PD-F-021', 'PD-F-018', 'PD-F-024'] },
            { method: 'test_bendahara_can_view_sisa_dana', ids: ['PD-F-006', 'PD-I-004', 'PD-U-001'] },
            { method: 'test_bendahara_can_store_pencairan', ids: ['PD-F-009', 'PD-I-007', 'PD-F-024', 'PD-F-016', 'PD-U-002'] },
            { method: 'test_store_fails_when_exceeding_sisa_dana', ids: ['PD-I-001', 'PD-U-005'] },
            { method: 'test_bendahara_can_selesai_pencairan', ids: ['PD-I-002', 'PD-I-010', 'PD-I-011', 'PD-U-010'] }
        ]
    },
    {
        file: 'NotificationTest.php',
        marks: [
            { method: 'test_inertia_shared_props_contains_unread_notifications_for_authenticated_user', ids: ['NTF-F-001', 'NTF-F-002'] },
            { method: 'test_notifications_do_not_leak_to_other_users', ids: ['NTF-I-005', 'D-UAT-005'] },
            { method: 'test_user_can_mark_own_notification_as_read', ids: ['NTF-F-005', 'NTF-F-003'] },
            { method: 'test_user_can_mark_all_notifications_as_read', ids: ['NTF-F-007'] }
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
        const methodRegex = new RegExp(`public function\\s+${mark.method}`, 'g');
        // Look for any existing docblock before the method
        const docBlockRegex = new RegExp(`(\\/\\*\\*[\\s\\S]*?\\*\\/\\s+)?public function\\s+${mark.method}`, 'g');
        
        content = content.replace(docBlockRegex, (match, existingDoc) => {
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
