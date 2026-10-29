<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\OtpCode;
use App\Models\Citizen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Show combined Login Portal
     */
    public function showLogin()
    {
        if (Auth::check()) {
            return $this->redirectBasedOnRole(Auth::user());
        }

        return Inertia::render('Auth/Login', [
            'demoCredentials' => [
                'admin' => ['email' => 'admin@nagorik.gov.bd', 'password' => 'password123', 'label' => 'সুপার অ্যাডমিন'],
                'officerBarishal' => ['email' => 'officer@barishal.gov.bd', 'password' => 'password123', 'label' => 'সিভিল সার্জন (বরিশাল)'],
                'officerCumilla' => ['email' => 'officer@cumilla.gov.bd', 'password' => 'password123', 'label' => 'নির্বাহী প্রকৌশলী (কুমিল্লা কুসিক)'],
                'citizen' => ['phone' => '01711223344', 'otp' => '123456', 'label' => 'নাগরিক ডেমো'],
            ],
        ]);
    }

    /**
     * Citizen: Send OTP to Mobile Number
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => ['required', 'regex:/^(?:\+88|88)?(01[3-9]\d{8})$/'],
        ], [
            'phone.required' => '১১ সংখ্যার সচল মোবাইল নম্বর দিন।',
            'phone.regex' => 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01711223344)।',
        ]);

        $phone = preg_replace('/^(?:\+88|88)/', '', trim($request->phone));

        $otpData = OtpCode::generateForPhone($phone);

        return response()->json([
            'success' => true,
            'message' => "আপনার মোবাইল নম্বরে ৬ সংখ্যার ওটিপি পাঠানো হয়েছে।",
            'demo_code' => app()->isLocal() ? $otpData['plain_code'] : null,
            'expires_at' => $otpData['expires_at'],
        ]);
    }

    /**
     * Citizen: Verify OTP & Sign In / Register
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string|size:6',
        ], [
            'otp.required' => '৬ সংখ্যার ওটিপি কোড দিন।',
            'otp.size' => 'ওটিপি কোডটি অবশ্যই ৬ সংখ্যার হতে হবে।',
        ]);

        $phone = preg_replace('/^(?:\+88|88)/', '', trim($request->phone));
        $code = trim($request->otp);

        $valid = OtpCode::verifyOtp($phone, $code);

        if (! $valid) {
            return back()->withErrors(['otp' => 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড। পুনরায় চেষ্টা করুন।']);
        }

        // Find or create citizen user
        $user = User::firstOrCreate(
            ['phone' => $phone],
            [
                'name' => 'নাগরিক ' . substr($phone, -4),
                'role' => 'citizen',
                'is_active' => true,
            ]
        );

        Citizen::firstOrCreate(
            ['user_id' => $user->id]
        );

        $user->update(['last_login_at' => Carbon::now()]);

        Auth::login($user, true);

        return redirect()->intended(route('citizen.dashboard'))->with('success', 'সফলভাবে লগইন হয়েছে!');
    }

    /**
     * Officer / Admin Password Login
     */
    public function login(Request $request)
    {
        if (!$request->has('login') && $request->has('identifier')) {
            $request->merge(['login' => $request->input('identifier')]);
        }

        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ], [
            'login.required' => 'ইমেইল অথবা মোবাইল নম্বর দিন।',
            'password.required' => 'পাসওয়ার্ড প্রদান করুন।',
        ]);

        $login = trim($request->login);
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($field, $login)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return back()->withErrors(['login' => 'ইমেইল/ফোন অথবা পাসওয়ার্ড ভুল হয়েছে।']);
        }

        if (! $user->is_active) {
            return back()->withErrors(['login' => 'আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে। কর্তৃপক্ষের সাথে যোগাযোগ করুন।']);
        }

        $user->update(['last_login_at' => Carbon::now()]);

        Auth::login($user, $request->boolean('remember'));

        return $this->redirectBasedOnRole($user);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('info', 'আপনি সফলভাবে লগআউট হয়েছেন।');
    }

    private function redirectBasedOnRole(User $user)
    {
        if ($user->isMainAdmin()) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->isOfficer() || $user->isAreaOfficer() || $user->isDeptAdmin()) {
            return redirect()->route('officer.dashboard');
        } else {
            return redirect()->route('citizen.dashboard');
        }
    }
}
