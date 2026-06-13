<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DominioAprendizaje;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * User registration with initial learning domains
     */
    public function register(Request $request)
    {
        $request->validate([
            'correo' => 'required|email|unique:users',
            'apodo' => 'required|string|max:50|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'correo' => $request->correo,
            'apodo' => $request->apodo,
            'password_hash' => Hash::make($request->password),
            'role' => 'usuario',
            'xp' => 0,
            'rango' => 'Aprendiz',
            'activo' => true,
        ]);

        // Initialize learning domains
        $conceptos = ['DF', '1FN', '2FN', '3FN', 'BCNF'];
        foreach ($conceptos as $concepto) {
            DominioAprendizaje::create([
                'user_id' => $user->id,
                'concepto' => $concepto,
                'porcentaje' => 0
            ]);
        }

        // Simple token simulation
        $token = base64_encode($user->correo . '|' . now());

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado correctamente',
            'token' => $token,
            'user' => $user->load('dominiosAprendizaje')
        ], 201);
    }

    /**
     * User login with token generation
     */
    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('correo', $request->correo)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if (!$user->activo) {
            return response()->json([
                'success' => false,
                'message' => 'Cuenta deshabilitada'
            ], 403);
        }

        // Simple token simulation (no Sanctum)
        $token = base64_encode($user->correo . '|' . now());

        return response()->json([
            'success' => true,
            'message' => 'Sesión iniciada correctamente',
            'token' => $token,
            'user' => $user->load('dominiosAprendizaje')
        ]);
    }

    /**
     * Refresh access token using refresh token
     */
    public function refresh(Request $request)
    {
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        try {
            // Validate refresh token through Sanctum
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token inválido'
                ], 401);
            }

            // Check if token is still valid (not deleted)
            $token = DB::table('personal_access_tokens')
                ->where('token', hash('sha256', $request->refresh_token))
                ->where('name', 'refresh_token')
                ->first();

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Refresh token expirado'
                ], 401);
            }

            // Generate new access token
            $newAccessToken = $user->createToken(
                'access_token',
                ['server:auth'],
                now()->addHours(1)
            )->plainTextToken;

            return response()->json([
                'success' => true,
                'access_token' => $newAccessToken,
                'token_type' => 'Bearer',
                'expires_in' => 3600,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al renovar sesión'
            ], 401);
        }
    }

    /**
     * User logout - revoke all tokens
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    /**
     * Get current authenticated user
     */
    public function me(Request $request)
    {
        // Simple mock for me() when Sanctum is disabled
        $user = User::with(['dominiosAprendizaje', 'logros'])->first();
        
        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    /**
     * Revoke specific token
     */
    public function revokeToken(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Token revocado'
        ]);
    }
}
