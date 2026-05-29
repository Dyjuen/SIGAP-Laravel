<?php

namespace App\Services;

use App\Models\Panduan;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PanduanService
{
    /**
     * Store a new Panduan.
     */
    public function store(array $data, ?UploadedFile $file = null): Panduan
    {
        $pathMedia = null;

        if ($data['tipe_media'] === 'video') {
            $pathMedia = $data['path_media'];
        } elseif ($file) {
            $pathMedia = $file->store('panduan', 'supabase');
        }

        return Panduan::create([
            'judul_panduan' => $data['judul_panduan'],
            'tipe_media' => $data['tipe_media'],
            'path_media' => $pathMedia,
            'target_role_id' => $data['target_role_id'] ?? null,
        ]);
    }

    /**
     * Update an existing Panduan.
     */
    public function update(Panduan $panduan, array $data, ?UploadedFile $file = null): Panduan
    {
        $panduan->judul_panduan = $data['judul_panduan'];
        $panduan->target_role_id = $data['target_role_id'] ?? null;

        if ($data['tipe_media'] === 'video') {
            // If switching from document to video, delete old file
            if ($panduan->tipe_media === 'document' && $panduan->path_media) {
                Storage::disk('supabase')->delete($panduan->path_media);
            }
            $panduan->tipe_media = 'video';
            $panduan->path_media = $data['path_media'];
        } else {
            // Document type
            if ($file) {
                // Delete old file if exists (and was document)
                if ($panduan->tipe_media === 'document' && $panduan->path_media) {
                    Storage::disk('supabase')->delete($panduan->path_media);
                }
                $path = $file->store('panduan', 'supabase');
                $panduan->tipe_media = 'document';
                $panduan->path_media = $path;
            } else {
                $panduan->tipe_media = 'document';
            }
        }

        $panduan->save();
        return $panduan;
    }

    /**
     * Delete a Panduan and its associated file.
     */
    public function delete(Panduan $panduan): void
    {
        if ($panduan->tipe_media === 'document' && $panduan->path_media) {
            Storage::disk('supabase')->delete($panduan->path_media);
        }

        $panduan->delete();
    }
}
