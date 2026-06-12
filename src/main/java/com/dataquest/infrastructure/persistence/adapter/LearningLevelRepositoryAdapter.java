package com.dataquest.infrastructure.persistence.adapter;

import com.dataquest.application.port.outbound.LearningLevelRepository;
import com.dataquest.domain.entity.LearningLevel;
import com.dataquest.infrastructure.persistence.mapper.LearningLevelMapper;
import com.dataquest.infrastructure.persistence.repository.SpringDataLearningLevelRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class LearningLevelRepositoryAdapter implements LearningLevelRepository {

    private final SpringDataLearningLevelRepository springRepo;
    private final LearningLevelMapper mapper;

    public LearningLevelRepositoryAdapter(SpringDataLearningLevelRepository springRepo,
                                          LearningLevelMapper mapper) {
        this.springRepo = springRepo;
        this.mapper = mapper;
    }

    @Override
    public Optional<LearningLevel> findById(Long id) {
        return springRepo.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<LearningLevel> findAllByOrderByWorldAscLevelNumberAsc() {
        return springRepo.findAllByOrderByWorldAscLevelNumberAsc().stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
}
