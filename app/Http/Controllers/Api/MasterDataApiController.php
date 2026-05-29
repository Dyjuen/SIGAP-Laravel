<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MasterDataService;
use Illuminate\Http\Request;

class MasterDataApiController extends Controller
{
    protected MasterDataService $masterDataService;

    public function __construct(MasterDataService $masterDataService)
    {
        $this->masterDataService = $masterDataService;
    }



    /**
     * Get all master data types.
     */
    public function index(Request $request)
    {


        $types = collect($this->masterDataService->getAllTypes())->map(fn ($item, $key) => [
            'key' => $key,
            'title' => $item['title'],
            'readonly' => $item['readonly'],
        ])->values();

        return response()->json(['types' => $types]);
    }

    /**
     * Get records for a specific master data type.
     */
    public function indexResource(Request $request, string $type)
    {


        if (! $this->masterDataService->hasType($type)) {
            return response()->json(['message' => 'Master data type not found.'], 404);
        }

        $config = $this->masterDataService->getConfig($type);
        $items = $this->masterDataService->list($type, $request->search);

        return response()->json([
            'type' => $type,
            'title' => $config['title'],
            'readonly' => $config['readonly'],
            'primaryKey' => $config['primary_key'],
            'fields' => $config['fields'],
            'items' => $items,
        ]);
    }

    /**
     * Store a newly created record.
     */
    public function store(Request $request, string $type)
    {


        if (! $this->masterDataService->hasType($type)) {
            return response()->json(['message' => 'Master data type not found.'], 404);
        }

        $config = $this->masterDataService->getConfig($type);

        if ($config['readonly']) {
            return response()->json(['message' => 'This master data type is read-only.'], 403);
        }

        $validatedData = $request->validate($config['validation_rules'], [
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

        $this->masterDataService->store($type, $validatedData);

        return response()->json(['message' => 'Data berhasil ditambahkan.']);
    }

    /**
     * Update the specified record.
     */
    public function update(Request $request, string $type, string $id)
    {


        if (! $this->masterDataService->hasType($type)) {
            return response()->json(['message' => 'Master data type not found.'], 404);
        }

        $config = $this->masterDataService->getConfig($type);

        if ($config['readonly']) {
            return response()->json(['message' => 'This master data type is read-only.'], 403);
        }

        $validatedData = $request->validate($config['validation_rules'], [
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

        $this->masterDataService->update($type, $id, $validatedData);

        return response()->json(['message' => 'Data berhasil diperbarui.']);
    }

    /**
     * Delete the specified record.
     */
    public function destroy(Request $request, string $type, string $id)
    {


        if (! $this->masterDataService->hasType($type)) {
            return response()->json(['message' => 'Master data type not found.'], 404);
        }

        $config = $this->masterDataService->getConfig($type);

        if ($config['readonly']) {
            return response()->json(['message' => 'This master data type is read-only.'], 403);
        }

        $this->masterDataService->delete($type, $id);

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
