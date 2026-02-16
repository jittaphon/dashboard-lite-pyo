<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;

class RateLimit
{
    protected $limiter;

    public function __construct(RateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    public function handle(Request $request, Closure $next, $maxAttempts = 60, $decayMinutes = 1)
    {
        try {
            $key = $request->user()?->id
                ? 'user:' . $request->user()->id
                : 'ip:' . $request->ip();

            $decaySeconds = (int) $decayMinutes * 60;

            if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
                $retryAfter = $this->limiter->availableIn($key);

                return response()->json([
                    'status' => 'error',
                    'code' => 429,
                    'message' => 'Too Many Requests',
                    'retry_after' => $retryAfter,
                ], 429)
                    ->header('Retry-After', $retryAfter)
                    ->header('X-RateLimit-Limit', $maxAttempts)
                    ->header('X-RateLimit-Remaining', 0);
            }

            // ถ้ายังไม่ถึง limit ก็ให้ผ่าน
            $this->limiter->hit($key, $decaySeconds);

            $response = $next($request);

            // เพิ่ม header แสดงสถานะการใช้
            $remaining = max(0, $maxAttempts - $this->limiter->attempts($key));

            $response->header('X-RateLimit-Limit', $maxAttempts);
            $response->header('X-RateLimit-Remaining', $remaining);
            $response->header('X-RateLimit-Reset', $this->limiter->availableIn($key));

            return $response;
        } catch (\Throwable $e) {
            // ✅ ส่ง response 500 กลับไป frontend โดยตรง
            return response()->json([
                'status' => 'error',
                'code' => 500,
                'message' => 'Internal Server Error',
                'detail' => app()->environment('local') || env('APP_DEBUG', false)
                    ? $e->getMessage()
                    : null, // ซ่อนข้อความจริงใน production
            ], 500);
        }
    }
}
