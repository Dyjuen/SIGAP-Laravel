<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Panduan extends Model
{
    protected $table = 'm_panduan';

    protected $primaryKey = 'panduan_id';

    /**
     * Find guides for a specific role.
     * Includes guides with matching role_id and public guides (target_role_id IS NULL).
     */
    public function findByRole(?int $role_id): array
    {
        // If role_id is null (e.g., guest without a role), return no guides.
        if ($role_id === null) {
            return [];
        }

        // Only fetch guides that match the user's specific role_id.
        $sql = "SELECT * FROM {$this->table} WHERE target_role_id = ? ORDER BY panduan_id ASC";
        $stmt = $this->query($sql, [$role_id]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
