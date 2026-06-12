package com.dataquest.infrastructure.persistence.mapper;

import com.dataquest.domain.entity.Medal;
import com.dataquest.domain.entity.UserMedal;
import com.dataquest.infrastructure.persistence.entity.MedalEntity;
import com.dataquest.infrastructure.persistence.entity.UserMedalEntity;
import org.springframework.stereotype.Component;

@Component
public class MedalMapper {

    public Medal toDomain(MedalEntity entity) {
        if (entity == null) return null;
        return new Medal(
            entity.getId(), entity.getNombre(), entity.getDescripcion(),
            entity.getIcono(), entity.getTipoCondicion(), entity.getValorCondicion()
        );
    }

    public UserMedal toDomain(UserMedalEntity entity) {
        if (entity == null) return null;
        return new UserMedal(entity.getId(), entity.getUserId(), entity.getMedalId());
    }

    public UserMedalEntity toEntity(UserMedal domain) {
        if (domain == null) return null;
        UserMedalEntity entity = new UserMedalEntity();
        entity.setId(domain.getId());
        entity.setUserId(domain.getUserId());
        entity.setMedalId(domain.getMedalId());
        entity.setEarnedAt(domain.getEarnedAt());
        return entity;
    }
}
