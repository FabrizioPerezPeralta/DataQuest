package com.dataquest.application.port.inbound;

import com.dataquest.application.dto.LearningProgressResponse;
import com.dataquest.application.dto.SubmissionRequest;
import com.dataquest.application.dto.SubmissionResponse;

public interface LearningUseCase {
    LearningProgressResponse getProgress(Long userId);
    SubmissionResponse submitSolution(Long userId, SubmissionRequest request);
}
