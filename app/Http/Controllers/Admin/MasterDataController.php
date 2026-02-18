<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Iku;
use App\Models\KategoriBelanja;
use App\Models\MataAnggaran;
use App\Models\Satuan;
use App\Models\TipeKegiatan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    protected array $allowedTypes = [
        'iku' => [
            'model' => Iku::class,
            'title' => 'Indikator Kinerja Utama (IKU)',
            'readonly' => false,
            'primary_key' => 'iku_id',
            'fields' => [
                ['name' => 'kode_iku', 'label' => 'Kode IKU', 'type' => 'text'],
                ['name' => 'nama_iku', 'label' => 'Nama IKU', 'type' => 'text'],
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
                ['name' => 'is_active', 'label' => 'Aktif?', 'type' => 'boolean'], // Might need boolean support later, treating as text/select usually
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
            'model' => \App\Models\Role::class,
            'title' => 'Role & Izin',
            'readonly' => true, // Roles are critical, best not to delete via generic CRUD for now
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
            'model' => \App\Models\KegiatanStatus::class,
            'title' => 'Status Kegiatan',
            'readonly' => true, // Status workflow is hardcoded in logic usually
            'primary_key' => 'status_id',
            'fields' => [
                ['name' => 'nama_status', 'label' => 'Nama Status', 'type' => 'text'],
            ],
            'validation_rules' => [
                'nama_status' => 'required|string|max:50|unique:m_kegiatan_status,nama_status',
            ],
            'searchable' => ['nama_status'],
        ],
    ];

    public function index(): Response
    {
        return Inertia::render('Admin/Master/Index', [
            'types' => collect($this->allowedTypes)->map(fn ($item, $key) => [
                'key' => $key,
                'title' => $item['title'],
                'readonly' => $item['readonly'],
            ]),
        ]);
    }

    public function indexResource(Request $request, string $type): Response
    {
        abort_if(! isset($this->allowedTypes[$type]), 404);

        $config = $this->allowedTypes[$type];
        $modelClass = $config['model'];

        $query = $modelClass::query();

        if ($request->search) {
            $query->where(function ($q) use ($config, $request) {
                foreach ($config['searchable'] as $column) {
                    $q->orWhere($column, 'like', '%'.$request->search.'%');
                }
            });
        }

        // Sorting? Default by created_at desc if available, or primary key
        $keyName = $config['primary_key'];
        $query->orderBy($keyName, 'desc');

        $items = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Master/ResourceIndex', [
            'type' => $type,
            'title' => $config['title'],
            'readonly' => $config['readonly'],
            'primaryKey' => $config['primary_key'],
            'fields' => $config['fields'],
            'items' => $items,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request, string $type): RedirectResponse
    {
        abort_if(! isset($this->allowedTypes[$type]), 404);
        $config = $this->allowedTypes[$type];

        if ($config['readonly']) {
            abort(403, 'This master data type is read-only.');
        }

        $modelClass = $config['model'];

        $validatedData = $request->validate($config['validation_rules']);

        $modelClass::create($validatedData);

        return redirect()->back()->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, string $type, string $id): RedirectResponse
    {
        abort_if(! isset($this->allowedTypes[$type]), 404);
        $config = $this->allowedTypes[$type];

        if ($config['readonly']) {
            abort(403, 'This master data type is read-only.');
        }

        $modelClass = $config['model'];
        $item = $modelClass::findOrFail($id);

        $validatedData = $request->validate($config['validation_rules']);

        $item->update($validatedData);

        return redirect()->back()->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(string $type, string $id): RedirectResponse
    {
        abort_if(! isset($this->allowedTypes[$type]), 404);
        $config = $this->allowedTypes[$type];

        if ($config['readonly']) {
            abort(403, 'This master data type is read-only.');
        }

        $modelClass = $config['model'];
        $item = $modelClass::findOrFail($id);
        $item->delete();

        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
}
