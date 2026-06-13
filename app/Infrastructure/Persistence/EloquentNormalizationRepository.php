<?php
namespace App\Infrastructure\Persistence;

use App\Domain\Entities\RelationSchema;
use App\Domain\Repositories\NormalizationRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class EloquentNormalizationRepository implements NormalizationRepositoryInterface
{
    private const CACHE_TTL = 3600; // 1 hour

    public function save(RelationSchema $schema): void
    {
        $key = "schema_{$schema->name}";
        Cache::put($key, serialize($schema), self::CACHE_TTL);
    }

    public function findById(string $id): ?RelationSchema
    {
        $key = "schema_{$id}";
        $cached = Cache::get($key);
        return $cached ? unserialize($cached) : null;
    }

    public function findAll(): array
    {
        // This is a simplified implementation
        // In production, use a proper database table
        return [];
    }

    public function delete(string $id): void
    {
        $key = "schema_{$id}";
        Cache::forget($key);
    }
}
