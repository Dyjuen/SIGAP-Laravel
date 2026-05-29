<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePanduanRequest;
use App\Http\Requests\Admin\UpdatePanduanRequest;
use App\Models\Panduan;
use App\Models\Role;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use App\Services\PanduanService;

class PanduanController extends Controller
{
    protected PanduanService $panduanService;

    public function __construct(PanduanService $panduanService)
    {
        $this->panduanService = $panduanService;
    }

    public function index()
    {
        $panduan = Panduan::with('role')
            ->orderBy('panduan_id', 'desc')
            ->get()
            ->map(fn ($item) => [
                'panduan_id' => $item->panduan_id,
                'judul_panduan' => $item->judul_panduan,
                'tipe_media' => $item->tipe_media,
                'path_media' => $item->path_media,
                'target_role_id' => $item->target_role_id,
                'role_name' => $item->role ? $item->role->nama_role : 'Semua',
                // Helper for frontend download/view link
                'download_url' => route('admin.panduan.download', $item->panduan_id),
            ]);

        $roles = Role::all(['role_id', 'nama_role']);

        return Inertia::render('Admin/Panduan/Index', [
            'panduan' => $panduan,
            'roles' => $roles,
        ]);
    }

    public function store(StorePanduanRequest $request)
    {
        $this->panduanService->store($request->validated(), $request->file('file'));

        return redirect()->back()->with('success', 'Panduan berhasil ditambahkan.');
    }

    public function update(UpdatePanduanRequest $request, Panduan $panduan)
    {
        $this->panduanService->update($panduan, $request->validated(), $request->file('file'));

        return redirect()->back()->with('success', 'Panduan berhasil diperbarui.');
    }

    public function destroy(Panduan $panduan)
    {
        $this->panduanService->delete($panduan);

        return redirect()->back()->with('success', 'Panduan berhasil dihapus.');
    }

    public function download(Panduan $panduan)
    {
        if ($panduan->tipe_media === 'video') {
            return redirect()->away($panduan->path_media);
        }

        if ($panduan->path_media && Storage::disk('supabase')->exists($panduan->path_media)) {
            $extension = pathinfo($panduan->path_media, PATHINFO_EXTENSION);
            $filename = $panduan->judul_panduan.($extension ? '.'.$extension : '');

            // If request has stream=1, show inline (for iframe preview)
            if (request()->query('stream')) {
                return Storage::disk('supabase')->response($panduan->path_media, $filename, [
                    'Content-Disposition' => 'inline; filename="'.$filename.'"',
                ]);
            }

            return Storage::disk('supabase')->download($panduan->path_media, $filename);
        }

        abort(404, 'File tidak ditemukan.');
    }
}
