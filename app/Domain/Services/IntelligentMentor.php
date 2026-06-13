<?php
namespace App\Domain\Services;

use App\Domain\Entities\RelationSchema;

class IntelligentMentor
{
    public function generateHint(RelationSchema $schema, array $userAttempt, string $currentNF): array
    {
        $hints = [];
        $violations = (new NormalizationEngine())->diagnoseNormalization($schema)['violations'];
        
        if (in_array('2FN', $violations)) {
            $hints[] = [
                'level' => 'beginner',
                'message' => '🔍 Revisa si algún atributo depende solo de UNA PARTE de la clave primaria. Ejemplo: Si PK es (ID_Pedido, ID_Producto), el atributo "Nombre_Producto" depende solo de ID_Producto.',
                'rule' => 'Regla de la dependencia completa (2FN)'
            ];
        }
        
        if (in_array('3FN', $violations)) {
            $hints[] = [
                'level' => 'intermediate',
                'message' => '🧩 Detecté una cadena: A → B y B → C. Esto es transitivo. Para 3FN, elimina la dependencia intermedia.',
                'rule' => 'Regla de Codd: "Los atributos no clave no deben depender de otros atributos no clave"'
            ];
        }
        
        // Pista personalizada basada en intentos previos
        if ($userAttempt['attempts'] > 2) {
            $hints[] = [
                'level' => 'advanced',
                'message' => '💡 Sugerencia experta: Descompón la tabla usando el teorema de Heath. La dependencia que viola X → Y indica que puedes separar (X,Y) y (X, resto).',
                'rule' => 'Teorema de Heath'
            ];
        }
        
        return $hints;
    }
}
