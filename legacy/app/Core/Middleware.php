<?php

namespace App\Core;

interface Middleware
{
    /**
     * Handle middleware logic
     */
    public function handle(): void;
}
