<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'tbl_users';
    protected $primaryKey = 'user_id';
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix_name',
        'age',
        'birth_date',
        'gender_id',
        'address',
        'contact_number',
        'email',
        'password',
        'is_deleted',
        'role_id',
    ];
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = ['name'];

    public function getNameAttribute()
    {
        $name_parts = array_filter([
            $this->first_name,
            $this->middle_name ? substr($this->middle_name, 0, 1) . '.' : null,
            $this->last_name,
            $this->suffix_name
        ]);
        return implode(' ', $name_parts);
    }

    public function gender(): BelongsTo
    {
        return $this->belongsTo(Gender::class, 'gender_id', 'gender_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function hasPermission($permission)
    {
        return $this->role && $this->role->hasPermission($permission);
    }

    public function isCashier()
    {
        return $this->role && $this->role->name === 'cashier';
    }

    public function isManager()
    {
        return $this->role && $this->role->name === 'manager';
    }

    public function isAdmin()
    {
        return $this->role && $this->role->name === 'admin';
    }
}
