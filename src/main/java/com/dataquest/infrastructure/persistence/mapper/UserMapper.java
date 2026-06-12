package com.dataquest.infrastructure.persistence.mapper;

import com.dataquest.domain.entity.User;
import com.dataquest.infrastructure.persistence.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toDomain(UserEntity entity) {
        if (entity == null) return null;
        User user = new User(
            entity.getId(), entity.getCorreo(), entity.getApodo(),
            entity.getPasswordHash(), entity.getRole()
        );
        return user;
    }

    public UserEntity toEntity(User domain) {
        if (domain == null) return null;
        UserEntity entity = new UserEntity();
        entity.setId(domain.getId());
        entity.setCorreo(domain.getEmail());
        entity.setApodo(domain.getNickname());
        entity.setPasswordHash(domain.getPasswordHash());
        entity.setRole(domain.getRole());
        entity.setActivo(domain.getActive());
        entity.setFechaRegistro(domain.getRegistrationDate());
        entity.setUltimaConexion(domain.getLastConnection());
        entity.setRachaDias(domain.getStreakDays());
        entity.setUltimaRacha(domain.getLastStreak());
        entity.setSessionToken(domain.getSessionToken());
        entity.setDeletedAt(domain.getDeletedAt());
        return entity;
    }
}
