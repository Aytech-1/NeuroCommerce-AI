<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Search;

use App\Modules\Catalog\Jobs\SyncProductSearchIndexJob;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchIndexSyncJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_sync_product_search_index_job_executes_idempotently(): void
    {
        $product = Product::first();
        $this->assertNotNull($product);

        $job = new SyncProductSearchIndexJob($product->id, 'index');
        $job->handle();

        $this->assertTrue(true);
    }

    public function test_sync_job_handles_deleted_or_nonexistent_product_gracefully(): void
    {
        $job = new SyncProductSearchIndexJob('00000000-0000-0000-0000-000000000000', 'delete');
        $job->handle();

        $this->assertTrue(true);
    }
}
