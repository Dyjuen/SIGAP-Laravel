<?php

namespace Tests\Unit\Services;

use App\Models\Satuan;
use App\Services\MasterDataService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataServiceTest extends TestCase
{
    use RefreshDatabase;

    private MasterDataService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new MasterDataService;
    }

    public function test_it_lists_items_with_pagination(): void
    {
        Satuan::create(['nama_satuan' => 'OJ']);
        Satuan::create(['nama_satuan' => 'Hari']);

        $list = $this->service->list('satuan');

        $this->assertCount(2, $list);
    }

    public function test_it_creates_master_data(): void
    {
        $item = $this->service->store('satuan', ['nama_satuan' => 'OJ']);

        $this->assertDatabaseHas('m_satuan', [
            'satuan_id' => $item->satuan_id,
            'nama_satuan' => 'OJ',
        ]);
    }

    public function test_it_updates_master_data(): void
    {
        $item = Satuan::create(['nama_satuan' => 'OJ']);

        $this->service->update('satuan', $item->satuan_id, ['nama_satuan' => 'Hari']);

        $this->assertDatabaseHas('m_satuan', [
            'satuan_id' => $item->satuan_id,
            'nama_satuan' => 'Hari',
        ]);
    }

    public function test_it_deletes_master_data(): void
    {
        $item = Satuan::create(['nama_satuan' => 'OJ']);

        $this->service->delete('satuan', $item->satuan_id);

        $this->assertSoftDeleted('m_satuan', [
            'satuan_id' => $item->satuan_id,
        ]);
    }

    public function test_it_throws_exception_on_readonly_create(): void
    {
        $this->expectException(\LogicException::class);
        $this->service->store('roles', ['nama_role' => 'Role A']);
    }
}
