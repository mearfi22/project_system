<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
        'is_public'
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'value' => 'string'
    ];

    public function getValueAttribute($value)
    {
        return match($this->type) {
            'number' => (float) $value,
            'boolean' => (bool) $value,
            'json' => json_decode($value, true),
            default => $value
        };
    }

    public function setValueAttribute($value)
    {
        $this->attributes['value'] = match($this->type) {
            'json' => json_encode($value),
            default => (string) $value
        };
    }
}
