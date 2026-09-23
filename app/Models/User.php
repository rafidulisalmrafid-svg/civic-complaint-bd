<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'password',
        'role',
        'avatar',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Role helper methods
    public function isCitizen(): bool
    {
        return $this->role === 'citizen';
    }

    public function isOfficer(): bool
    {
        return in_array($this->role, ['officer', 'area_officer', 'dept_admin', 'main_admin']);
    }

    public function isAreaOfficer(): bool
    {
        return $this->role === 'area_officer';
    }

    public function isDeptAdmin(): bool
    {
        return in_array($this->role, ['dept_admin', 'main_admin']);
    }

    public function isMainAdmin(): bool
    {
        return $this->role === 'main_admin';
    }

    // Relationships
    public function citizenProfile()
    {
        return $this->hasOne(Citizen::class);
    }

    public function officerProfile()
    {
        return $this->hasOne(OfficerProfile::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
