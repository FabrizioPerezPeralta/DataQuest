<?php
namespace App\Http\Controllers\Api;

use App\Domain\Services\NormalizationEngine;
use App\Domain\Services\ClosureExplainerService;
use App\Domain\Entities\RelationSchema;
use App\Domain\Entities\FunctionalDependency;
use App\Application\UseCases\ValidateSchemaUseCase;
use App\Domain\Services\GamificationService;
use App\Models\Esquema;
use App\Models\Validacion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NormalizationController extends Controller
{
    public function __construct(
        private NormalizationEngine $engine,
        private ValidateSchemaUseCase $validateSchemaUseCase,
        private GamificationService $gamificationService,
        private ClosureExplainerService $closureExplainer
    ) {}

    public function validateSchema(Request $request)
    {
        $validated = $request->validate([
            'table_name' => 'required|string',
            'attributes' => 'required|array|min:1',
            'dependencies' => 'required|array'
        ]);

        try {
            // Construir entidades del dominio
            $fds = array_map(
                fn($dep) => new FunctionalDependency($dep['determinant'], $dep['dependent']),
                $validated['dependencies']
            );
            
            $schema = new RelationSchema(
                $validated['table_name'],
                $validated['attributes'],
                $fds
            );

            // Ejecutar use case
            $result = $this->validateSchemaUseCase->execute($schema);
            
            $gamificationData = null;
            $user = null;
            $tokenHeader = $request->header('Authorization');
            if ($tokenHeader) {
                // For demo/local: find first user if any token is provided
                $user = \App\Models\User::first(); 
            }

            if ($user) {
                // Persistencia analítica
                $dbEsquema = Esquema::create([
                    'user_id' => $user->id,
                    'nombre' => $validated['table_name'],
                    'estructura_json' => $validated['attributes'],
                    'dependencias_json' => $validated['dependencies']
                ]);

                Validacion::create([
                    'esquema_id' => $dbEsquema->id,
                    'nivel_normalizacion' => $result->currentNf,
                    'violaciones_json' => $result->violations
                ]);

                // Gamificación: asignar xp si es una validación libre (puedes ajustar lógica si es por puzzle)
                // Se determinan los conceptos afectados por la validación
                $conceptosAfectados = [];
                if ($result->currentNf === '1NF' || $result->currentNf === '1FN') $conceptosAfectados = ['1FN'];
                if ($result->currentNf === '2NF' || $result->currentNf === '2FN') $conceptosAfectados = ['1FN', '2FN'];
                if ($result->currentNf === '3NF' || $result->currentNf === '3FN') $conceptosAfectados = ['1FN', '2FN', '3FN'];
                if ($result->currentNf === 'BCNF') $conceptosAfectados = ['1FN', '2FN', '3FN', 'BCNF'];

                $gamificationData = $this->gamificationService->awardXP($user, 10, $conceptosAfectados);
            }
            
            return response()->json([
                'success' => true,
                'data' => $result,
                'gamification' => $gamificationData
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el esquema: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Explain step-by-step closure calculation (X+)
     * Educational endpoint to show students how the algorithm works
     */
    public function explainClosure(Request $request)
    {
        $validated = $request->validate([
            'attributes' => 'required|array|min:1',
            'dependencies' => 'required|array'
        ]);

        try {
            // Convert dependencies to FunctionalDependency objects
            $fds = array_map(
                fn($dep) => new FunctionalDependency($dep['determinant'], $dep['dependent']),
                $validated['dependencies']
            );

            // Get closure explanation
            $explanation = $this->closureExplainer->explainClosure(
                $validated['attributes'],
                $fds
            );

            return response()->json([
                'success' => true,
                'data' => $explanation,
                'message' => 'Explicación del cierre calculada exitosamente'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al explicar el cierre: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Explain candidate key discovery process
     */
    public function explainCandidateKeys(Request $request)
    {
        $validated = $request->validate([
            'attributes' => 'required|array|min:1',
            'dependencies' => 'required|array'
        ]);

        try {
            $fds = array_map(
                fn($dep) => new FunctionalDependency($dep['determinant'], $dep['dependent']),
                $validated['dependencies']
            );

            $explanation = $this->closureExplainer->explainCandidateKeys(
                $validated['attributes'],
                $fds
            );

            return response()->json([
                'success' => true,
                'data' => $explanation,
                'message' => 'Claves candidatas explicadas exitosamente'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al explicar claves: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Explain 3NF decomposition strategy
     */
    public function explainDecomposition(Request $request)
    {
        $validated = $request->validate([
            'attributes' => 'required|array|min:1',
            'dependencies' => 'required|array'
        ]);

        try {
            $fds = array_map(
                fn($dep) => new FunctionalDependency($dep['determinant'], $dep['dependent']),
                $validated['dependencies']
            );

            $explanation = $this->closureExplainer->explainDecomposition(
                $validated['attributes'],
                $fds
            );

            return response()->json([
                'success' => true,
                'data' => $explanation,
                'message' => 'Estrategia de descomposición explicada exitosamente'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al explicar descomposición: ' . $e->getMessage()
            ], 422);
        }
    }
}
