package com.dataquest.api.config;

import com.dataquest.domain.service.MedalEvaluationService;
import com.dataquest.domain.service.NormalizationService;
import com.dataquest.domain.service.RateLimiterService;
import com.dataquest.domain.service.StarCalculationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainBeanConfig {

    @Value("${app.security.rate-limit.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.security.rate-limit.window-minutes:15}")
    private long windowMinutes;

    @Bean
    public NormalizationService normalizationService() {
        return new NormalizationService();
    }

    @Bean
    public StarCalculationService starCalculationService() {
        return new StarCalculationService();
    }

    @Bean
    public MedalEvaluationService medalEvaluationService() {
        return new MedalEvaluationService();
    }

    @Bean
    public RateLimiterService rateLimiterService() {
        return new RateLimiterService(maxAttempts, windowMinutes);
    }
}
