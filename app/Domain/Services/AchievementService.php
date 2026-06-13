namespace App\Domain\Services;

use App\Models\IntentoPuzzle;
use App\Models\User;
use App\Models\Puzzle;

class AchievementService
{
    public function recordAttempt(int $userId, int $puzzleId, int $puntuacion): array
    {
        $puzzle = Puzzle::findOrFail($puzzleId);
        
        // Guardar intento
        $intento = IntentoPuzzle::create([
            'user_id' => $userId,
            'puzzle_id' => $puzzleId,
            'puntuacion' => $puntuacion,
        ]);
        
        // Lógica de medallas
        $newMedal = null;
        if ($puntuacion >= 100) {
            $user = User::findOrFail($userId);
            $medallas = $user->medallas ?? [];
            
            $medalName = "Maestro de " . $puzzle->enunciado;
            if (!in_array($medalName, $medallas)) {
                $medallas[] = $medalName;
                $user->medallas = $medallas;
                $user->save();
                $newMedal = $medalName;
            }
        }
        
        return [
            'success' => true,
            'puntuacion' => $puntuacion,
            'medal_unlocked' => $newMedal
        ];
    }
}
