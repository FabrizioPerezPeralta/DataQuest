package com.dataquest.domain.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class RateLimiterService {

    private final int maxAttempts;
    private final long windowMinutes;
    private final Map<String, AttemptWindow> attempts = new ConcurrentHashMap<>();

    public RateLimiterService(int maxAttempts, long windowMinutes) {
        this.maxAttempts = maxAttempts;
        this.windowMinutes = windowMinutes;
    }

    public boolean isAllowed(String identifier) {
        cleanExpired();
        AttemptWindow window = attempts.get(identifier);
        if (window == null) return true;
        return window.count.get() < maxAttempts;
    }

    public void recordAttempt(String identifier) {
        attempts.compute(identifier, (key, existing) -> {
            if (existing == null || existing.isExpired(windowMinutes)) {
                return new AttemptWindow(LocalDateTime.now());
            }
            existing.count.incrementAndGet();
            return existing;
        });
    }

    public int getRemainingAttempts(String identifier) {
        cleanExpired();
        AttemptWindow window = attempts.get(identifier);
        if (window == null) return maxAttempts;
        return Math.max(0, maxAttempts - window.count.get());
    }

    private void cleanExpired() {
        attempts.entrySet().removeIf(entry -> entry.getValue().isExpired(windowMinutes));
    }

    private static class AttemptWindow {
        final LocalDateTime startTime;
        final AtomicInteger count = new AtomicInteger(1);

        AttemptWindow(LocalDateTime startTime) {
            this.startTime = startTime;
        }

        boolean isExpired(long windowMinutes) {
            return startTime.plusMinutes(windowMinutes).isBefore(LocalDateTime.now());
        }
    }
}
