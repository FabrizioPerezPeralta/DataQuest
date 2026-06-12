package com.dataquest.application.port.inbound;

import com.dataquest.application.dto.NormalizationRequest;
import com.dataquest.application.dto.NormalizationResponse;

public interface NormalizationUseCase {
    NormalizationResponse analyze(NormalizationRequest request);
}
