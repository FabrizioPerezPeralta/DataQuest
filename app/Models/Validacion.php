<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Validacion extends Model
{
    protected $table = 'validaciones';

    protected $fillable = [
        'esquema_id',
        'nivel_normalizacion',
        'violaciones_json',
    ];

    protected $casts = [
        'violaciones_json' => 'array',
        'fecha' => 'datetime',
    ];

    public const CREATED_AT = 'fecha';
    public const UPDATED_AT = null;

    public function esquema()
    {
        return $this->belongsTo(Esquema::class);
    }
}
