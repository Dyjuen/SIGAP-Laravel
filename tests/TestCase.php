<?php

namespace Tests;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Refresh the application instance.
     *
     * @return void
     */
    protected function refreshApplication()
    {
        parent::refreshApplication();

        // Force testing configuration immediately after app refresh
        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => ':memory:',
            'session.driver' => 'array',
            'cache.default' => 'array',
        ]);
    }

    /**
     * Boot the testing environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Globally disable CSRF for tests
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }
}
