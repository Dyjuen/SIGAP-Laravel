<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\MasterDataService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    protected MasterDataService $masterDataService;

    public function __construct(MasterDataService $masterDataService)
    {
        $this->masterDataService = $masterDataService;
    }

    public function index(): Response
    {
        return Inertia::render('Admin/Master/Index', [
            'types' => collect($this->masterDataService->getAllTypes())->map(fn ($item, $key) => [
                'key' => $key,
                'title' => $item['title'],
                'readonly' => $item['readonly'],
            ]),
        ]);
    }

    public function indexResource(Request $request, string $type): Response
    {
        abort_if(! $this->masterDataService->hasType($type), 404);

        $config = $this->masterDataService->getConfig($type);
        $items = $this->masterDataService->list($type, $request->search)->withQueryString();

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
        abort_if(! $this->masterDataService->hasType($type), 404);
        $config = $this->masterDataService->getConfig($type);

        if ($config['readonly']) {
            abort(403, 'This master data type is read-only.');
        }

        $validator = Validator::make($request->all(), $config['validation_rules'], [
            'required' => ':attribute harus diisi.',
            'string' => ':attribute harus berupa teks.',
            'max' => ':attribute maksimal :max karakter.',
            'integer' => ':attribute harus berupa angka bulat.',
            'digits' => ':attribute harus berjumlah :digits digit.',
            'numeric' => ':attribute harus berupa angka.',
            'min' => ':attribute minimal :min.',
            'unique' => ':attribute sudah ada di sistem.',
            'boolean' => ':attribute harus berupa ya/tidak.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput()->with('error', 'Gagal menyimpan data. Silakan periksa kembali inputan Anda.');
        }

        $this->masterDataService->store($type, $validator->validated());

        return redirect()->back()->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, string $type, string $id): RedirectResponse
    {
        abort_if(! $this->masterDataService->hasType($type), 404);
        $config = $this->masterDataService->getConfig($type);

        if ($config['readonly']) {
            abort(403, 'This master data type is read-only.');
        }

        // Handle dynamic unique rules for update
        $rules = $config['validation_rules'];
        foreach ($rules as $field => $rule) {
            if (is_string($rule) && str_contains($rule, 'unique:')) {
                $rules[$field] = $rule . ',' . $id . ',' . $config['primary_key'];
            }
        }

        $validator = Validator::make($request->all(), $rules, [
            'required' => ':attribute harus diisi.',
            'string' => ':attribute harus berupa teks.',
            'max' => ':attribute maksimal :max karakter.',
            'integer' => ':attribute harus berupa angka bulat.',
            'digits' => ':attribute harus berjumlah :digits digit.',
            'numeric' => ':attribute harus berupa angka.',
            'min' => ':attribute minimal :min.',
            'unique' => ':attribute sudah ada di sistem.',
            'boolean' => ':attribute harus berupa ya/tidak.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput()->with('error', 'Gagal memperbarui data. Silakan periksa kembali inputan Anda.');
        }

        $this->masterDataService->update($type, $id, $validator->validated());

        return redirect()->back()->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(string $type, string $id): RedirectResponse
    {
        abort_if(! $this->masterDataService->hasType($type), 404);
        $config = $this->masterDataService->getConfig($type);

        if ($config['readonly']) {
            abort(403, 'This master data type is read-only.');
        }

        $this->masterDataService->delete($type, $id);

        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
}
