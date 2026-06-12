package com.dataquest.infrastructure.persistence.adapter;

import com.dataquest.application.port.outbound.UserProgressRepository;
import com.dataquest.domain.entity.UserProgress;
import com.dataquest.infrastructure.persistence.mapper.UserProgressMapper;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserProgressRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class UserProgressRepositoryAdapter implements UserProgressRepository {

    private final SpringDataUserProgressRepository springRepo;
    private final UserProgressMapper mapper;

    public UserProgressRepositoryAdapter(SpringDataUserProgressRepository springRepo,
                                         UserProgressMapper mapper) {
        this.springRepo = springRepo;
        this.mapper = mapper;
    }

    @Override
    public Optional<UserProgress> findByUserIdAndLevelId(Long userId, Long levelId) {
        return springRepo.findByUserIdAndLevelId(userId, levelId).map(mapper::toDomain);
    }

    @Override
    public List<UserProgress> findByUserId(Long userId) {
        return springRepo.findByUserId(userId).stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public UserProgress save(UserProgress progress) {
        var entity = mapper.toEntity(progress);
        var saved = springRepo.save(entity);
        return mapper.toDomain(saved);
    }
}
