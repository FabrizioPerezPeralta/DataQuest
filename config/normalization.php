<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Normalization Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration file contains settings for the normalization engine.
    |
    */

    'engine' => [
        'compute_closure' => true,
        'find_candidate_keys' => true,
        'diagnose_normalization' => true,
    ],

    'gamification' => [
        'xp_base_reward' => 50,
        'xp_hint_penalty' => 10,
        'badge_completion_threshold' => 0.8, // 80%
    ],

    'ranks' => [
        ['name' => 'Aprendiz', 'min_xp' => 0, 'max_xp' => 499],
        ['name' => 'Normalizador Junior', 'min_xp' => 500, 'max_xp' => 1499],
        ['name' => 'Guardián de la 3FN', 'min_xp' => 1500, 'max_xp' => 2999],
        ['name' => 'Maestro de Normalización', 'min_xp' => 3000, 'max_xp' => PHP_INT_MAX],
    ],

    'difficulty_levels' => [
        1 => 'Muy Fácil',
        2 => 'Fácil',
        3 => 'Medio',
        4 => 'Difícil',
        5 => 'Muy Difícil',
    ],
];
