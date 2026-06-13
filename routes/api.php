<?php

use App\Http\Controllers\Api\NormalizationController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ============================================
// Autenticación
// ============================================
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);

// ============================================
// Normalización - Motor Principal (Público)
// ============================================
Route::post('/validate-schema', [NormalizationController::class, 'validateSchema']);

// Educational endpoints - Step-by-step explanations
Route::post('/explain/closure', [NormalizationController::class, 'explainClosure']);
Route::post('/explain/candidate-keys', [NormalizationController::class, 'explainCandidateKeys']);
Route::post('/explain/decomposition', [NormalizationController::class, 'explainDecomposition']);

// ============================================
// Rutas Protegidas (Middleware desactivado para local dev)
// ============================================
Route::group([], function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/revoke-token', [AuthController::class, 'revokeToken']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Analíticas de aprendizaje
    Route::get('/analytics/mastery', [AnalyticsController::class, 'getUserMastery']);
});
