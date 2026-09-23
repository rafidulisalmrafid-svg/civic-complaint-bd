<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।'], 401);
            }
            return redirect()->route('login')->with('error', 'এই পেজটি দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।');
        }

        if (empty($roles)) {
            return $next($request);
        }

        // Allow main_admin to access all officer/admin routes
        if ($user->role === 'main_admin') {
            return $next($request);
        }

        if (in_array($user->role, $roles)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'দুঃখিত, এই তথ্যটি দেখার অনুমতি আপনার নেই।'], 403);
        }

        return redirect()->route('home')->with('error', 'দুঃখিত, এই পৃষ্ঠাটিতে প্রবেশের অনুমতি আপনার নেই।');
    }
}
