<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class KegiatanLampiran extends Model
{
    protected $table = 't_kegiatan_lampiran';

    protected $primaryKey = 'lampiran_id';

    /**
     * Cari semua lampiran berdasarkan ID anggaran.
     */
    public function findByAnggaran($anggaran_id)
    {
        return $this->findAllBy('anggaran_id', $anggaran_id);
    }

    /**
     * Cari semua lampiran berdasarkan array ID anggaran.
     *
     * @param  array  $anggaranIds  Array of anggaran_id
     * @return array
     */
    public function findByAnggaranIds(array $anggaranIds)
    {
        if (empty($anggaranIds)) {
            return [];
        }
        $placeholders = implode(',', array_fill(0, count($anggaranIds), '?'));
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE anggaran_id IN ({$placeholders})");
        $stmt->execute($anggaranIds);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Simpan catatan reviewer untuk lampiran (ubah status menjadi revision_requested)
     *
     * @param  int  $lampiranId
     * @param  string  $catatan
     * @param  int  $reviewerId
     * @return bool
     */
    public function addReviewerNotes($lampiranId, $catatan, $reviewerId)
    {
        $lampiran = $this->find($lampiranId);
        if (! $lampiran) {
            return false;
        }

        $updateData = [
            'catatan_reviewer' => $catatan,
            'reviewer_user_id' => $reviewerId,
            'catatan_tanggal' => date('Y-m-d H:i:s'),
            'revisi_ke' => $this->getRevisiKe($lampiranId) + 1,
        ];

        // Only change status if it's NOT already archived
        if (($lampiran['status_lampiran'] ?? '') !== 'archived') {
            $updateData['status_lampiran'] = 'revision_requested';
        }

        return $this->update($lampiranId, $updateData);
    }

    /**
     * Get jumlah revisi untuk lampiran
     *
     * @param  int  $lampiranId
     * @return int
     */
    public function getRevisiKe($lampiranId)
    {
        $lampiran = $this->find($lampiranId);

        return $lampiran['revisi_ke'] ?? 0;
    }

    /**
     * Dapatkan riwayat lengkap lampiran (including previous revisions)
     *
     * @param  int  $lampiranId
     * @return array
     */
    public function getLampiranHistory($lampiranId)
    {
        $query = "
            WITH RECURSIVE lampiran_tree AS (
                SELECT * FROM {$this->table} WHERE lampiran_id = :lampiran_id
                UNION ALL
                SELECT l.* FROM {$this->table} l
                INNER JOIN lampiran_tree lt ON l.lampiran_id = lt.parent_lampiran_id
            )
            SELECT * FROM lampiran_tree
            ORDER BY revisi_ke ASC
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute(['lampiran_id' => $lampiranId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Resubmit lampiran sebagai revisi (create new version dengan parent reference)
     *
     * @param  int  $parentLampiranId
     * @param  array  $newLampiranData
     * @return int ID dari lampiran baru
     */
    public function resubmitAsRevision($parentLampiranId, $newLampiranData)
    {
        $parentLampiran = $this->find($parentLampiranId);
        if (! $parentLampiran) {
            return null;
        }

        // Data untuk lampiran baru
        $revisionData = array_merge($newLampiranData, [
            'parent_lampiran_id' => $parentLampiranId,
            'revisi_ke' => ($parentLampiran['revisi_ke'] ?? 0) + 1,
            'status_lampiran' => 'pending',
            'status_approval' => 'pending',
            'catatan_reviewer' => null,
            'reviewer_user_id' => null,
            'catatan_tanggal' => null,
        ]);

        // Update parent menjadi archived
        $this->update($parentLampiranId, [
            'status_lampiran' => 'archived',
        ]);

        // Create lampiran baru
        return $this->create($revisionData);
    }

    /**
     * Approve lampiran dan hapus lampiran archived sebelumnya
     *
     * @param  int  $lampiranId
     * @param  int  $approverId
     * @return bool
     */
    public function approveLampiran($lampiranId, $approverId)
    {
        // Update lampiran menjadi approved
        $result = $this->update($lampiranId, [
            'status_lampiran' => 'approved',
            'status_approval' => 'approved',
            'approval_tanggal' => date('Y-m-d H:i:s'),
            'reviewer_user_id' => $approverId,
        ]);

        // Hapus semua archived lampiran yang merupakan parent/revisi sebelumnya
        if ($result) {
            $this->deleteArchivedParents($lampiranId);
        }

        return $result;
    }

    /**
     * Hapus semua parent archived lampiran (untuk cleanup setelah approve)
     *
     * @param  int  $lampiranId
     * @return int Jumlah lampiran yang dihapus
     */
    private function deleteArchivedParents($lampiranId)
    {
        $lampiran = $this->find($lampiranId);
        if (! $lampiran) {
            return 0;
        }

        $deletedCount = 0;

        // Jika ada parent, hapus parent yang archived
        if ($lampiran['parent_lampiran_id']) {
            $parent = $this->find($lampiran['parent_lampiran_id']);
            if ($parent && $parent['status_lampiran'] === 'archived') {
                // Hapus file fisik jika ada
                if (isset($parent['path_file_disimpan'])) {
                    $filePath = $_SERVER['DOCUMENT_ROOT'].$parent['path_file_disimpan'];
                    if (file_exists($filePath)) {
                        @unlink($filePath);
                    }
                }
                // Hapus dari database
                $this->delete($parent['lampiran_id']);
                $deletedCount++;

                // Rekursif: hapus parents dari parent juga
                $deletedCount += $this->deleteArchivedParents($parent['lampiran_id']);
            }
        }

        return $deletedCount;
    }

    /**
     * Dapatkan lampiran yang approved untuk suatu anggaran
     *
     * @param  int  $anggaranId
     * @return array
     */
    public function getApprovedByAnggaran($anggaranId)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table}
            WHERE anggaran_id = ? AND status_lampiran = 'approved'
            ORDER BY revisi_ke DESC, lampiran_id DESC
        ");
        $stmt->execute([$anggaranId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Dapatkan lampiran pending (belum di-approve/revisi) untuk suatu anggaran
     *
     * @param  int  $anggaranId
     * @return array
     */
    public function getPendingByAnggaran($anggaranId)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table}
            WHERE anggaran_id = ? AND status_lampiran IN ('pending', 'revision_requested')
            ORDER BY revisi_ke DESC, lampiran_id DESC
        ");
        $stmt->execute([$anggaranId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Dapatkan semua lampiran untuk suatu kegiatan, termasuk yang diarsipkan.
     *
     * @param  int  $kegiatanId
     * @return array
     */
    public function getByKegiatanId($kegiatanId)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table}
            WHERE kegiatan_id = ?
            ORDER BY created_at ASC
        ");
        $stmt->execute([$kegiatanId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
