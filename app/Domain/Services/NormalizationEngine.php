<?php
namespace App\Domain\Services;

use App\Domain\Entities\RelationSchema;
use App\Domain\Entities\FunctionalDependency;
use Illuminate\Support\Collection;

class NormalizationEngine
{
    /**
     * Calcula el cierre de atributos (algoritmo iterativo)
     */
    public function computeClosure(array $attributes, array $fds): array
    {
        $closure = $attributes;
        $changed = true;
        
        while ($changed) {
            $changed = false;
            foreach ($fds as $fd) {
                // Si el determinante está contenido en el cierre actual
                if (array_diff($fd->determinant, $closure) === []) {
                    // Agregar los dependientes
                    foreach ($fd->dependent as $dep) {
                        if (!in_array($dep, $closure)) {
                            $closure[] = $dep;
                            $changed = true;
                        }
                    }
                }
            }
        }
        
        return $closure;
    }

    /**
     * Encuentra todas las claves candidatas
     */
    public function findCandidateKeys(RelationSchema $schema): array
    {
        $attributes = $schema->getAttributesSet();
        $fds = $schema->getFds();
        $candidateKeys = [];
        
        // Generar combinaciones de atributos (solo superclaves minimales)
        $powerSet = $this->generatePowerSet($attributes);
        
        foreach ($powerSet as $subset) {
            if (empty($subset)) continue;
            
            $closure = $this->computeClosure($subset, $fds);
            // Verificar si es superclave
            if (array_diff($attributes, $closure) === []) {
                // Verificar minimalidad
                $isMinimal = true;
                foreach ($subset as $attr) {
                    $reduced = array_values(array_diff($subset, [$attr]));
                    if (!empty($reduced)) {
                        $reducedClosure = $this->computeClosure($reduced, $fds);
                        if (array_diff($attributes, $reducedClosure) === []) {
                            $isMinimal = false;
                            break;
                        }
                    }
                }
                if ($isMinimal) {
                    $candidateKeys[] = $subset;
                }
            }
        }
        
        return $candidateKeys;
    }

    /**
     * Detecta violaciones de 1FN, 2FN, 3FN con diagnóstico pedagógico
     */
    public function diagnoseNormalization(RelationSchema $schema): array
    {
        $candidateKeys = $this->findCandidateKeys($schema);
        $primaryKey = $candidateKeys[0] ?? []; // Tomamos la primera como PK para diagnóstico
        
        $diagnosis = [
            'current_nf' => '1NF',
            'violations' => [],
            'didactic_steps' => [],
            'suggestions' => []
        ];
        
        // 1. Verificar 1NF (atributos atómicos - asumimos que el input ya está en 1NF estructural)
        $diagnosis['current_nf'] = '1NF';
        
        // 2. Verificar 2FN (dependencia parcial)
        $partialDeps = $this->findPartialDependencies($schema, $primaryKey);
        if (!empty($partialDeps)) {
            $diagnosis['violations'][] = '2FN';
            $diagnosis['didactic_steps'][] = [
                'step' => 'Verificando Segunda Forma Normal (2FN)',
                'explanation' => 'Una tabla está en 2FN si está en 1FN y todos los atributos no clave dependen de la clave primaria completa (no solo de una parte).',
                'violation_detail' => $this->explainPartialDependency($partialDeps, $primaryKey),
                'rule_codd' => 'Regla de Codd: "Cada atributo no clave debe depender funcionalmente de toda la clave primaria, no de un subconjunto de ella."'
            ];
            $diagnosis['suggestions'][] = 'Extrae los atributos que dependen parcialmente en una nueva tabla.';
        } else {
            $diagnosis['current_nf'] = '2NF';
        }
        
        // 3. Verificar 3FN (dependencia transitiva)
        $transitiveDeps = $this->findTransitiveDependencies($schema, $primaryKey);
        if (!empty($transitiveDeps)) {
            $diagnosis['violations'][] = '3FN';
            $diagnosis['didactic_steps'][] = [
                'step' => 'Verificando Tercera Forma Normal (3FN)',
                'explanation' => 'Una tabla está en 3FN si está en 2FN y ningún atributo no clave depende transitivamente de la clave primaria (es decir, no hay dependencias de atributos no clave a otros atributos no clave).',
                'violation_detail' => $this->explainTransitiveDependency($transitiveDeps),
                'rule_codd' => 'Regla de Codd: "Los atributos no clave no deben depender de otros atributos no clave."'
            ];
            $diagnosis['suggestions'][] = 'Divide la tabla moviendo los atributos transitivamente dependientes a otra tabla.';
        } else {
            $diagnosis['current_nf'] = '3FN';
        }
        
        // Bonus: BCNF (opcional para diagnóstico avanzado)
        if ($diagnosis['current_nf'] === '3FN') {
            $bcnfViolations = $this->findBCNFViolations($schema);
            if (!empty($bcnfViolations)) {
                $diagnosis['violations'][] = 'BCNF';
                $diagnosis['didactic_steps'][] = [
                    'step' => 'Verificando Forma Normal de Boyce-Codd (BCNF)',
                    'explanation' => 'Una tabla está en BCNF si para toda dependencia funcional no trivial, el determinante es superclave.',
                    'violation_detail' => implode("\n", $bcnfViolations),
                    'rule_codd' => 'Regla de Codd extendida: "Todo determinante debe ser clave candidata."'
                ];
                $diagnosis['suggestions'][] = 'Descompón la tabla según la dependencia que viola BCNF.';
            } else {
                $diagnosis['current_nf'] = 'BCNF';
            }
        }
        
        return $diagnosis;
    }

    private function findPartialDependencies(RelationSchema $schema, array $primaryKey): array
    {
        $partials = [];
        if (count($primaryKey) <= 1) return $partials;
        
        foreach ($schema->getFds() as $fd) {
            // Si el determinante es subconjunto propio de la PK y no es toda la PK
            if (array_diff($fd->determinant, $primaryKey) === [] &&
                count($fd->determinant) < count($primaryKey) &&
                !empty($fd->determinant)) {
                $partials[] = $fd;
            }
        }
        return $partials;
    }

    private function explainPartialDependency(array $partialDeps, array $primaryKey): string
    {
        $explanation = "Dependencias parciales detectadas: ";
        foreach ($partialDeps as $dep) {
            $explanation .= sprintf(
                "{%s} → {%s} (determinante es subconjunto de la clave primaria {%s}). ",
                implode(',', $dep->determinant),
                implode(',', $dep->dependent),
                implode(',', $primaryKey)
            );
        }
        return $explanation;
    }

    private function findTransitiveDependencies(RelationSchema $schema, array $primaryKey): array
    {
        $transitives = [];
        $nonPrimeAttributes = array_diff($schema->getAttributesSet(), $primaryKey);
        
        foreach ($schema->getFds() as $fd) {
            // Dependencia donde determinante y dependiente son no clave
            if (array_diff($fd->determinant, $nonPrimeAttributes) === [] &&
                array_diff($fd->dependent, $nonPrimeAttributes) === [] &&
                !empty($fd->determinant)) {
                $transitives[] = $fd;
            }
        }
        return $transitives;
    }

    private function explainTransitiveDependency(array $transitiveDeps): string
    {
        $explanation = "Dependencias transitivas detectadas: ";
        foreach ($transitiveDeps as $dep) {
            $explanation .= sprintf(
                "{%s} → {%s} (atributos no clave que dependen de otros atributos no clave). ",
                implode(',', $dep->determinant),
                implode(',', $dep->dependent)
            );
        }
        return $explanation;
    }

    private function findBCNFViolations(RelationSchema $schema): array
    {
        $allAttributes = $schema->getAttributesSet();
        $fds = $schema->getFds();
        $violations = [];
        
        foreach ($fds as $fd) {
            // Verificar si la DF es trivial (dependiente es subconjunto del determinante)
            if (array_diff($fd->dependent, $fd->determinant) === []) {
                continue; // DF trivial, no puede violar BCNF
            }
            
            // Un determinante es superclave si su cierre cubre TODOS los atributos
            $closure = $this->computeClosure($fd->determinant, $fds);
            if (array_diff($allAttributes, $closure) !== []) {
                $violations[] = sprintf(
                    "{%s} → {%s}: el determinante no es superclave (cierre: {%s})",
                    implode(',', $fd->determinant),
                    implode(',', $fd->dependent),
                    implode(',', $closure)
                );
            }
        }
        return $violations;
    }

    private function generatePowerSet(array $set): array
    {
        $powerSet = [[]];
        foreach ($set as $element) {
            foreach ($powerSet as $subset) {
                $newSubset = array_merge($subset, [$element]);
                $powerSet[] = $newSubset;
            }
        }
        return $powerSet;
    }
}
