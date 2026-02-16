<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePanduanRequest;
use App\Http\Requests\Admin\UpdatePanduanRequest;
use App\Models\Panduan;
use App\Models\Role;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PanduanController extends Controller
{
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
        $data = $request->validated();
        $pathMedia = null;

        if ($data['tipe_media'] === 'video') {
            $pathMedia = $data['path_media'];
        } elseif ($request->hasFile('file')) {
            $pathMedia = $request->file('file')->store('panduan', 'public');
        }

        Panduan::create([
            'judul_panduan' => $data['judul_panduan'],
            'tipe_media' => $data['tipe_media'],
            'path_media' => $pathMedia,
            'target_role_id' => $data['target_role_id'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Panduan berhasil ditambahkan.');
    }

    public function update(UpdatePanduanRequest $request, Panduan $panduan)
    {
        $data = $request->validated();

        $panduan->judul_panduan = $data['judul_panduan'];
        $panduan->target_role_id = $data['target_role_id'] ?? null;

        // Handle media type change or file update
        if ($data['tipe_media'] === 'video') {
            // If switching from document to video, delete old file
            if ($panduan->tipe_media === 'document' && $panduan->path_media) {
                Storage::disk('public')->delete($panduan->path_media);
            }
            $panduan->tipe_media = 'video';
            $panduan->path_media = $data['path_media'];
        } else {
            // Document type
            if ($request->hasFile('file')) {
                // Delete old file if exists (and was document)
                if ($panduan->tipe_media === 'document' && $panduan->path_media) {
                    Storage::disk('public')->delete($panduan->path_media);
                }
                $path = $request->file('file')->store('panduan', 'public');
                $panduan->tipe_media = 'document';
                $panduan->path_media = $path;
            } else {
                // If we are already document, just keep it.
                // If we are switching from video to document, validation requires 'file'.
                // So this branch should ideally only be hit if we remain document without new file.
                $panduan->tipe_media = 'document';
            }
        }

        $panduan->save();

        return redirect()->back()->with('success', 'Panduan berhasil diperbarui.');
    }

    public function destroy(Panduan $panduan)
    {
        if ($panduan->tipe_media === 'document' && $panduan->path_media) {
            Storage::disk('public')->delete($panduan->path_media);
        }

        $panduan->delete();

        return redirect()->back()->with('success', 'Panduan berhasil dihapus.');
    }

    public function download(Panduan $panduan)
    {
        if ($panduan->tipe_media === 'video') {
            return redirect()->away($panduan->path_media);
        }

        if ($panduan->path_media && Storage::disk('public')->exists($panduan->path_media)) {
            return Storage::disk('public')->download($panduan->path_media, $panduan->judul_panduan.'.'.pathinfo($panduan->path_media, PATHINFO_EXTENSION));
        }

        abort(404, 'File tidak ditemukan.');
    }
}
