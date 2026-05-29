<?php

namespace App\Events;

use App\Models\Kegiatan;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LpjSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(public Kegiatan $kegiatan, public string $type)
    {
    }
}
