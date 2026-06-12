package com.dataquest.application.service;

import com.dataquest.application.dto.LearningProgressResponse;
import com.dataquest.application.dto.SubmissionRequest;
import com.dataquest.application.dto.SubmissionResponse;
import com.dataquest.application.port.inbound.LearningUseCase;
import com.dataquest.application.port.outbound.LearningLevelRepository;
import com.dataquest.application.port.outbound.MedalRepository;
import com.dataquest.application.port.outbound.UserProgressRepository;
import com.dataquest.application.port.outbound.UserRepository;
import com.dataquest.domain.entity.LearningLevel;
import com.dataquest.domain.entity.Medal;
import com.dataquest.domain.entity.User;
import com.dataquest.domain.entity.UserMedal;
import com.dataquest.domain.entity.UserProgress;
import com.dataquest.domain.service.MedalEvaluationService;
import com.dataquest.domain.service.StarCalculationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningService implements LearningUseCase {

    private final UserRepository userRepository;
    private final LearningLevelRepository levelRepository;
    private final UserProgressRepository progressRepository;
    private final MedalRepository medalRepository;
    private final StarCalculationService starCalc;
    private final MedalEvaluationService medalEval;

    public LearningService(UserRepository userRepository, LearningLevelRepository levelRepository,
                           UserProgressRepository progressRepository, MedalRepository medalRepository,
                           StarCalculationService starCalc, MedalEvaluationService medalEval) {
        this.userRepository = userRepository;
        this.levelRepository = levelRepository;
        this.progressRepository = progressRepository;
        this.medalRepository = medalRepository;
        this.starCalc = starCalc;
        this.medalEval = medalEval;
    }

    @Override
    @Transactional(readOnly = true)
    public LearningProgressResponse getProgress(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<UserProgress> allProgress = progressRepository.findByUserId(userId);
        List<LearningLevel> allLevels = levelRepository.findAllByOrderByWorldAscLevelNumberAsc();

        int totalXP = allProgress.stream().mapToInt(UserProgress::getScore).sum();
        int totalStars = allProgress.stream().mapToInt(UserProgress::getStarsEarned).sum();

        List<LearningProgressResponse.LevelProgress> levels = allLevels.stream()
            .map(lvl -> {
                var prog = allProgress.stream()
                    .filter(p -> p.getLevelId().equals(lvl.getId()))
                    .findFirst();
                return new LearningProgressResponse.LevelProgress(
                    lvl.getId(), lvl.getTitle(), lvl.getWorld(),
                    prog.map(UserProgress::getStarsEarned).orElse(0),
                    prog.isPresent()
                );
            })
            .collect(Collectors.toList());

        return new LearningProgressResponse(
            userId, totalXP, totalStars, (int) allProgress.stream()
                .filter(p -> p.getCompletedAt() != null).count(),
            user.getStreakDays(), levels
        );
    }

    @Override
    @Transactional
    public SubmissionResponse submitSolution(Long userId, SubmissionRequest request) {
        LearningLevel level = levelRepository.findById(request.levelId()).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();

        boolean correct = level.isSchemaAnswerCorrect(request.solution());

        if (!correct) {
            return SubmissionResponse.incorrect("Solución incorrecta. Revisa las dependencias funcionales.");
        }

        int stars = starCalc.calculateStars(1, 100);
        int xp = starCalc.calculateXP(level.getXp(), 1, request.usedHints(), user.getStreakDays());

        UserProgress progress = progressRepository
            .findByUserIdAndLevelId(userId, request.levelId())
            .orElse(new UserProgress(null, userId, request.levelId()));

        progress.recordAttempt(xp, stars);
        progressRepository.save(progress);

        user.updateStreak();
        userRepository.save(user);

        int totalXP = progressRepository.findByUserId(userId).stream()
            .mapToInt(UserProgress::getScore).sum();

        List<Medal> allMedals = medalRepository.findAllMedals();
        List<UserMedal> ownedMedals = medalRepository.findMedalsByUserId(userId);
        int puzzlesSolved = (int) progressRepository.findByUserId(userId).stream()
            .filter(p -> p.getCompletedAt() != null).count();

        List<String> newMedalNames = new ArrayList<>();
        List<Medal> newMedals = medalEval.evaluateNewMedals(
            allMedals, ownedMedals, puzzlesSolved, 0, totalXP);
        for (Medal medal : newMedals) {
            medalRepository.saveUserMedal(new UserMedal(null, userId, medal.getId()));
            newMedalNames.add(medal.getName());
        }

        return SubmissionResponse.correct(xp, stars, totalXP,
            "¡Correcto! Has ganado " + xp + " XP y " + stars + " estrellas.", newMedalNames);
    }
}
