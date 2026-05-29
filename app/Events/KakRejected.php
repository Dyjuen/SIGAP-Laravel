<?php

namespace App\Events;

use App\Models\KAK;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KakRejected
{
    use Dispatchable, SerializesModels;

    public function __construct(public KAK $kak, public string $type = 'rejected', public ?string $catatan = null)
    {
    }
}
