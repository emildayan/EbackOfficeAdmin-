<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use \App\Models\User;


class Event extends Model
{
    use HasFactory;
    protected $fillable = [
        'title', 'start', 'end', 'description', "priority", "color", "user_id", "task_id",
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
