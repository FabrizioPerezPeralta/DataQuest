package com.dataquest.infrastructure.persistence.adapter;

import com.dataquest.application.port.outbound.UserRepository;
import com.dataquest.domain.entity.User;
import com.dataquest.infrastructure.persistence.mapper.UserMapper;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserRepositoryAdapter implements UserRepository {

    private final SpringDataUserRepository springRepo;
    private final UserMapper mapper;

    public UserRepositoryAdapter(SpringDataUserRepository springRepo, UserMapper mapper) {
        this.springRepo = springRepo;
        this.mapper = mapper;
    }

    @Override
    public Optional<User> findById(Long id) {
        return springRepo.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return springRepo.findByCorreo(email).map(mapper::toDomain);
    }

    @Override
    public User save(User user) {
        var entity = mapper.toEntity(user);
        var saved = springRepo.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public boolean existsByEmail(String email) {
        return springRepo.existsByCorreo(email);
    }
}
