<?php
namespace App\Domain\Repositories;

use App\Domain\Entities\RelationSchema;

interface NormalizationRepositoryInterface
{
    public function save(RelationSchema $schema): void;
    public function findById(string $id): ?RelationSchema;
    public function findAll(): array;
    public function delete(string $id): void;
}
