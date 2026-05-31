<?php

namespace App\Events;

use App\Models\Kegiatan;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LpjApproved
{
    use Dispatchable, SerializesModels;

    public function __construct(public Kegiatan $kegiatan, public string $message) {}
}
