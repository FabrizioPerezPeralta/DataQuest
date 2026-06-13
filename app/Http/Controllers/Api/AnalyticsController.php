<?php

namespace App\Http\Controllers\Api;

use App\Models\IntentoPuzzle;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AnalyticsController extends Controller
{
    public function getUserMastery(int $userId)
    {
        // Obtener intentos de puzzles con la información del puzzle
        $intentos = IntentoPuzzle::with('puzzle')
            ->where('user_id', $userId)
            ->get();
        
        $conceptAccuracy = [
            '1FN' => ['correct' => 0, 'total' => 0],
            '2FN' => ['correct' => 0, 'total' => 0],
            '3FN' => ['correct' => 0, 'total' => 0],
            'BCNF' => ['correct' => 0, 'total' => 0],
            'DF' => ['correct' => 0, 'total' => 0]
        ];
        
        foreach ($intentos as $intento) {
            // Asumimos que el nivel de dificultad mapea a una forma normal para el mock
            $nf = match($intento->puzzle->nivel_dificultad) {
                1 => '1FN',
                2 => '2FN',
                3 => '3FN',
                default => 'BCNF'
            };
            
            $isCorrect = ($intento->puntuacion >= 80); // Umbral de maestría
            
            $conceptAccuracy[$nf]['total']++;
            if ($isCorrect) $conceptAccuracy[$nf]['correct']++;
            
            $conceptAccuracy['DF']['total']++;
            if ($isCorrect) $conceptAccuracy['DF']['correct']++;
        }
        
        $mastery = [];
        foreach ($conceptAccuracy as $concept => $data) {
            $percentage = $data['total'] > 0 ? ($data['correct'] / $data['total']) * 100 : 0;
            $mastery[] = [
                'concept' => $concept,
                'percentage' => round($percentage, 1),
                'mastered' => $percentage >= 80
            ];
        }
        
        return response()->json($mastery);
    }
}
