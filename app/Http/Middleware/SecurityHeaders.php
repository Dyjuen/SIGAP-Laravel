<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Add security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        // Keep X-Frame-Options for legacy browser compatibility
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Content Security Policy - updated to allow YouTube embeds and local Vite dev server
        $csp = "default-src 'self'; ";
        
        $scriptSrc = "'self' 'unsafe-inline' 'unsafe-eval' https: https://www.youtube.com https://s.ytimg.com https://www.google.com https://apis.google.com";
        $styleSrc = "'self' 'unsafe-inline' https: https://fonts.googleapis.com https://www.youtube.com";
        $connectSrc = "'self' https: https://www.youtube.com https://s.ytimg.com https://www.google.com";
        
        if (app()->environment('local')) {
            $scriptSrc .= " http://localhost:5173 http://127.0.0.1:5173";
            $styleSrc .= " http://localhost:5173 http://127.0.0.1:5173";
            $connectSrc .= " http://localhost:5173 http://127.0.0.1:5173 ws://localhost:5173 ws://127.0.0.1:5173";
        }

        $csp .= "script-src $scriptSrc; ";
        $csp .= "style-src $styleSrc; ";
        $csp .= "img-src 'self' data: https: https://i.ytimg.com https://www.youtube.com https://s.ytimg.com; ";
        $csp .= "font-src 'self' https: https://fonts.gstatic.com https://www.youtube.com; ";
        $csp .= "connect-src $connectSrc; ";
        // Allow framing content from YouTube domains in iframes
        $csp .= "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtu.be https://youtu.be; ";
        // For broader compatibility with older CSP implementations
        $csp .= "child-src 'self' https://www.youtube.com https://youtube.com https://www.youtu.be https://youtu.be; ";
        // Control who can embed OUR content (not relevant for YouTube embeds but good practice)
        $csp .= "frame-ancestors 'self';";
        
        $response->headers->set('Content-Security-Policy', $csp);
        
        // Permissions Policy (formerly Feature Policy)
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        // Only add HSTS in production (when using HTTPS)
        if ($request->secure() || app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return $response;
    }
}