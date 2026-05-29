<?php

namespace App\Services;

use App\Models\Iku;
use App\Models\KategoriBelanja;
use App\Models\KegiatanStatus;
use App\Models\MataAnggaran;
use App\Models\Role;
use App\Models\Satuan;
use App\Models\TipeKegiatan;
use Illuminate\Pagination\LengthAwarePaginator;

class MasterDataService
{
    protected array $allowedTypes = [
        'iku' => [
            'model' => Iku::class,
            'title' => 'Indikator Kinerja Utama (IKU)',
            'readonly' => false,
            'primary_key' => 'iku_id',
            'fields' => [
                ['name' => 'kode_iku', 'label' => 'Kode IKU', 'type' => 'text', 'required' => true, 'maxLength' => 50],
                ['name' => 'nama_iku', 'label' => 'Nama IKU', 'type' => 'text', 'required' => true, 'maxLength' => 255],
            ],
            'validation_rules' => [
                'kode_iku' => 'required|string|max:50',
                'nama_iku' => 'required|string|max:255',
            ],
            'searchable' => ['kode_iku', 'nama_iku'],
        ],
        'satuan' => [
            'model' => Satuan::class,
            'title' => 'Satuan',
            'readonly' => false,
            'primary_key' => 'satuan_id',
            'fields' => [
                ['name' => 'nama_satuan', 'label' => 'Nama Satuan', 'type' => 'text'],
            ],
            'validation_rules' => [
                'nama_satuan' => 'required|string|max:255',
            ],
            'searchable' => ['nama_satuan'],
        ],
        'mata-anggaran' => [
            'model' => MataAnggaran::class,
            'title' => 'Mata Anggaran',
            'readonly' => false,
            'primary_key' => 'mata_anggaran_id',
            'fields' => [
                ['name' => 'kode_anggaran', 'label' => 'Kode Anggaran', 'type' => 'text'],
                ['name' => 'nama_sumber_dana', 'label' => 'Nama Sumber Dana', 'type' => 'text'],
                ['name' => 'tahun_anggaran', 'label' => 'Tahun Anggaran', 'type' => 'number'],
                ['name' => 'total_pagu', 'label' => 'Total Pagu', 'type' => 'number'],
            ],
            'validation_rules' => [
                'kode_anggaran' => 'required|string|max:50',
                'nama_sumber_dana' => 'required|string|max:255',
                'tahun_anggaran' => 'required|integer|digits:4',
                'total_pagu' => 'required|numeric|min:0',
            ],
            'searchable' => ['kode_anggaran', 'nama_sumber_dana'],
        ],
        'tipe-kegiatan' => [
            'model' => TipeKegiatan::class,
            'title' => 'Tipe Kegiatan',
            'readonly' => true,
            'primary_key' => 'tipe_kegiatan_id',
            'fields' => [
                ['name' => 'nama_tipe', 'label' => 'Nama Tipe', 'type' => 'text'],
            ],
            'validation_rules' => [
                'nama_tipe' => 'required|string|max:255',
            ],
            'searchable' => ['nama_tipe'],
        ],
        'kategori-belanja' => [
            'model' => KategoriBelanja::class,
            'title' => 'Kategori Belanja',
            'readonly' => true,
            'primary_key' => 'kategori_belanja_id',
            'fields' => [
                ['name' => 'kode', 'label' => 'Kode', 'type' => 'text'],
                ['name' => 'nama', 'label' => 'Nama', 'type' => 'text'],
                ['name' => 'keterangan', 'label' => 'Keterangan', 'type' => 'text'],
                ['name' => 'is_active', 'label' => 'Aktif?', 'type' => 'boolean'],
            ],
            'validation_rules' => [
                'kode' => 'required|string|max:50',
                'nama' => 'required|string|max:255',
                'keterangan' => 'nullable|string',
                'is_active' => 'boolean',
            ],
            'searchable' => ['kode', 'nama'],
        ],
        'roles' => [
            'model' => Role::class,
            'title' => 'Role & Izin',
            'readonly' => true,
            'primary_key' => 'role_id',
            'fields' => [
                ['name' => 'nama_role', 'label' => 'Nama Role', 'type' => 'text'],
            ],
            'validation_rules' => [
                'nama_role' => 'required|string|max:50|unique:m_roles,nama_role',
            ],
            'searchable' => ['nama_role'],
        ],
        'kegiatan-status' => [
            'model' => KegiatanStatus::class,
            'title' => 'Status Kegiatan',
            'readonly' => true,
            'primary_key' => 'status_id',
            'fields' => [
                ['name' => 'nama_status', 'label' => 'Nama Status', 'type' => 'text', 'required' => true, 'maxLength' => 50],
            ],
            'validation_rules' => [
                'nama_status' => 'required|string|max:50|unique:m_kegiatan_status,nama_status',
            ],
            'searchable' => ['nama_status'],
        ],
    ];

    public function getAllTypes(): array
    {
        return $this->allowedTypes;
    }

    public function hasType(string $type): bool
    {
        return isset($this->allowedTypes[$type]);
    }

    public function getConfig(string $type): array
    {
        if (!$this->hasType($type)) {
            throw new \InvalidArgumentException("Tipe master data tidak valid: {$type}");
        }
        return $this->allowedTypes[$type];
    }

    /**
     * Get paginated and filtered items.
     */
    public function list(string $type, ?string $search = null): LengthAwarePaginator
    {
        $config = $this->getConfig($type);
        $modelClass = $config['model'];

        $query = $modelClass::query();

        if ($search) {
            $query->where(function ($q) use ($config, $search) {
                foreach ($config['searchable'] as $column) {
                    $q->orWhere($column, 'like', '%'.$search.'%');
                }
            });
        }

        $keyName = $config['primary_key'];
        $query->orderBy($keyName, 'desc');

        return $query->paginate(10);
    }

    /**
     * Create new master data record.
     */
    public function store(string $type, array $data)
    {
        $config = $this->getConfig($type);
        if ($config['readonly']) {
            throw new \LogicException('Tipe master data ini bersifat read-only.');
        }

        $modelClass = $config['model'];
        return $modelClass::create($data);
    }

    /**
     * Update existing master data record.
     */
    public function update(string $type, $id, array $data)
    {
        $config = $this->getConfig($type);
        if ($config['readonly']) {
            throw new \LogicException('Tipe master data ini bersifat read-only.');
        }

        $modelClass = $config['model'];
        $item = $modelClass::findOrFail($id);
        $item->update($data);
        return $item;
    }

    /**
     * Delete existing master data record.
     */
    public function delete(string $type, $id): void
    {
        $config = $this->getConfig($type);
        if ($config['readonly']) {
            throw new \LogicException('Tipe master data ini bersifat read-only.');
        }

        $modelClass = $config['model'];
        $item = $modelClass::findOrFail($id);
        $item->delete();
    }
}
