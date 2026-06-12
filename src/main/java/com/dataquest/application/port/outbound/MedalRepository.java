package com.dataquest.application.port.outbound;

import com.dataquest.domain.entity.Medal;
import com.dataquest.domain.entity.UserMedal;
import java.util.List;

public interface MedalRepository {
    List<Medal> findAllMedals();
    List<UserMedal> findMedalsByUserId(Long userId);
    UserMedal saveUserMedal(UserMedal userMedal);
}
