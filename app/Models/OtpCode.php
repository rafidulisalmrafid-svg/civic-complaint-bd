<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class OtpCode extends Model
{
    protected $fillable = [
        'phone',
        'code_hash',
        'plain_code_for_demo',
        'expires_at',
        'attempts',
        'verified',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified' => 'boolean',
            'attempts' => 'integer',
        ];
    }

    /**
     * Generate a new 6-digit OTP for phone
     */
    public static function generateForPhone(string $phone): array
    {
        // In local demo mode, fixed 123456 or 6 digits
        $plainCode = app()->isLocal() ? '123456' : str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = Carbon::now()->addMinutes(5);

        // Invalidate older OTPs for this phone
        self::where('phone', $phone)->where('verified', false)->delete();

        $record = self::create([
            'phone' => $phone,
            'code_hash' => Hash::make($plainCode),
            'plain_code_for_demo' => app()->isLocal() ? $plainCode : null,
            'expires_at' => $expiresAt,
            'attempts' => 0,
            'verified' => false,
        ]);

        return [
            'record' => $record,
            'plain_code' => $plainCode,
            'expires_at' => $expiresAt,
        ];
    }

    /**
     * Verify OTP code for phone
     */
    public static function verifyOtp(string $phone, string $code): bool
    {
        $otp = self::where('phone', $phone)
            ->where('verified', false)
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();

        if (! $otp) {
            return false;
        }

        if ($otp->attempts >= 5) {
            return false;
        }

        $otp->increment('attempts');

        if (Hash::check($code, $otp->code_hash) || (app()->isLocal() && $code === '123456')) {
            $otp->update(['verified' => true]);
            return true;
        }

        return false;
    }
}
