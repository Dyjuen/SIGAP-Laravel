<?php

namespace App\Events;

use App\Models\Kegiatan;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KegiatanApproved
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Kegiatan $kegiatan,
        public string $approvedByRole,
        public ?string $catatan = null,
    ) {}
}
