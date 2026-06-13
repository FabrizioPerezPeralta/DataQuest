<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditLogging
{
    /**
     * Log all API requests for security auditing
     * Records: method, path, user, IP, user-agent, request time
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        $response = $next($request);
        
        $duration = (microtime(true) - $startTime) * 1000; // milliseconds

        // Don't log health checks or static assets
        if ($this->shouldLog($request)) {
            $this->logRequest($request, $response, $duration);
        }

        return $response;
    }

    protected function shouldLog(Request $request): bool
    {
        $ignoredPaths = ['health', 'ping', '/metrics'];
        
        foreach ($ignoredPaths as $path) {
            if (str_contains($request->path(), $path)) {
                return false;
            }
        }

        return true;
    }

    protected function logRequest(Request $request, Response $response, float $duration): void
    {
        $logData = [
            'timestamp' => now()->toIso8601String(),
            'method' => $request->method(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user()?->id ?? null,
            'status_code' => $response->getStatusCode(),
            'duration_ms' => round($duration, 2),
            'request_size' => strlen($request->getContent()),
            'response_size' => strlen($response->getContent()),
        ];

        // Log to separate audit channel
        Log::channel('audit')->info('api_request', $logData);

        // Alert on suspicious activity
        if ($this->isSuspicious($request, $response)) {
            Log::channel('security')->warning('suspicious_activity', $logData);
        }
    }

    protected function isSuspicious(Request $request, Response $response): bool
    {
        // SQL injection attempts
        if ($this->containsSQLInjectionPatterns($request)) {
            return true;
        }

        // Too many failures from same IP
        // This would need additional tracking logic

        return false;
    }

    protected function containsSQLInjectionPatterns(Request $request): bool
    {
        $suspiciousPatterns = [
            'union', 'select', 'drop', 'insert', 'update', 'delete',
            'exec', 'execute', 'script', '<script', 'onclick',
        ];

        $input = strtolower($request->getContent() . $request->getQueryString());

        foreach ($suspiciousPatterns as $pattern) {
            if (str_contains($input, $pattern)) {
                // More sophisticated checking would be needed
                // This is a basic example
                return true;
            }
        }

        return false;
    }
}
