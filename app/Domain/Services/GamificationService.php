<?php

namespace App\Domain\Services;

use App\Models\User;
use App\Models\DominioAprendizaje;

class GamificationService
{
    private const RANGOS = [
        0 => 'Aprendiz',
        100 => 'Normalizador Junior',
        300 => 'Especialista de Datos',
        600 => 'Maestro de Esquemas',
        1000 => 'Arquitecto Supremo'
    ];

    public function awardXP(User $user, int $xpEarned, array $conceptosAfectados = [])
    {
        // Añadir XP
        $user->xp += $xpEarned;
        
        // Calcular rango
        $nuevoRango = 'Aprendiz';
        foreach (self::RANGOS as $minXp => $rango) {
            if ($user->xp >= $minXp) {
                $nuevoRango = $rango;
            }
        }
        $user->rango = $nuevoRango;
        $user->save();

        // Actualizar dominios
        if (!empty($conceptosAfectados)) {
            foreach ($conceptosAfectados as $concepto) {
                $dominio = DominioAprendizaje::firstOrCreate(
                    ['user_id' => $user->id, 'concepto' => $concepto],
                    ['porcentaje' => 0]
                );
                
                // Incremento heurístico básico (+5% por acierto)
                $dominio->porcentaje = min(100, $dominio->porcentaje + 5);
                $dominio->save();
            }
        }

        return [
            'xp_total' => $user->xp,
            'rango_actual' => $user->rango
        ];
    }
}
