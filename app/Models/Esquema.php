<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Esquema extends Model
{
    protected $table = 'esquemas';

    protected $fillable = [
        'user_id',
        'nombre',
        'estructura_json',
        'dependencias_json',
    ];

    protected $casts = [
        'estructura_json' => 'array',
        'dependencias_json' => 'array',
        'fecha_creacion' => 'datetime',
    ];

    public const CREATED_AT = 'fecha_creacion';
    public const UPDATED_AT = null;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function validaciones()
    {
        return $this->hasMany(Validacion::class);
    }
}
