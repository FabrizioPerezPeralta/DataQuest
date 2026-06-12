package com.dataquest.infrastructure.persistence.adapter;

import com.dataquest.application.port.outbound.MedalRepository;
import com.dataquest.domain.entity.Medal;
import com.dataquest.domain.entity.UserMedal;
import com.dataquest.infrastructure.persistence.mapper.MedalMapper;
import com.dataquest.infrastructure.persistence.repository.SpringDataMedalRepository;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserMedalRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MedalRepositoryAdapter implements MedalRepository {

    private final SpringDataMedalRepository medalRepo;
    private final SpringDataUserMedalRepository userMedalRepo;
    private final MedalMapper mapper;

    public MedalRepositoryAdapter(SpringDataMedalRepository medalRepo,
                                  SpringDataUserMedalRepository userMedalRepo,
                                  MedalMapper mapper) {
        this.medalRepo = medalRepo;
        this.userMedalRepo = userMedalRepo;
        this.mapper = mapper;
    }

    @Override
    public List<Medal> findAllMedals() {
        return medalRepo.findAll().stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public List<UserMedal> findMedalsByUserId(Long userId) {
        return userMedalRepo.findByUserId(userId).stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public UserMedal saveUserMedal(UserMedal userMedal) {
        var entity = mapper.toEntity(userMedal);
        var saved = userMedalRepo.save(entity);
        return mapper.toDomain(saved);
    }
}
