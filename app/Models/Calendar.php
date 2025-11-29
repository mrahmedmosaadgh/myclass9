<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Calendar extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'school_id',
        'academic_year_id',
        'semester_number',
        'week_number',
        'date',
        'week',
        'day',
        'day_number',
        'status',
        'event',
        'event_academic',
        'vacation',
        'data'
    ];

    protected $casts = [
        'date' => 'date',
        'data' => 'json'
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(CalendarEvent::class);
    }

    public function periodActivities(): HasMany
    {
        return $this->hasMany(PeriodActivity::class);
    }
}

