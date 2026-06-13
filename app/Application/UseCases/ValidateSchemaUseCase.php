<?php
namespace App\Application\UseCases;

use App\Domain\Services\NormalizationEngine;
use App\Domain\Entities\RelationSchema;

class ValidateSchemaUseCase
{
    public function __construct(private NormalizationEngine $engine) {}

    public function execute(RelationSchema $schema): array
    {
        $diagnosis = $this->engine->diagnoseNormalization($schema);
        $candidateKeys = $this->engine->findCandidateKeys($schema);
        
        return [
            'schema_name' => $schema->name,
            'candidate_keys' => $candidateKeys,
            'diagnosis' => $diagnosis,
            'is_fully_normalized' => $diagnosis['current_nf'] === 'BCNF',
            'message' => $this->generatePedagogicalMessage($diagnosis)
        ];
    }

    private function generatePedagogicalMessage(array $diagnosis): string
    {
        if ($diagnosis['current_nf'] === 'BCNF') {
            return "¡Excelente! Tu esquema cumple con BCNF, el más alto nivel de normalización. Tus datos están protegidos contra anomalías de inserción, actualización y eliminación.";
        }
        
        $lastViolation = end($diagnosis['violations']);
        $messages = [
            '2FN' => "Tu esquema tiene dependencias parciales. Recuerda: cada atributo no clave debe depender de TODA la clave primaria, no solo de una parte.",
            '3FN' => "Hay dependencias transitivas. Los atributos no clave no deberían depender de otros atributos no clave.",
            'BCNF' => "Alguna dependencia funcional tiene un determinante que no es superclave. Revisa las sugerencias para descomponer."
        ];
        
        return $messages[$lastViolation] ?? "Revisa las violaciones detectadas y aplica las sugerencias de normalización.";
    }
}
