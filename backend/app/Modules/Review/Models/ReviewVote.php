<?php

declare(strict_types=1);

namespace App\Modules\Review\Models;

use App\Modules\Auth\Models\User;
use App\Modules\Review\Enums\ReviewVoteType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class ReviewVote
 *
 * Eloquent model representing helpful/unhelpful votes on reviews.
 *
 * @package App\Modules\Review\Models
 * @property string $review_id
 * @property string $user_id
 * @property ReviewVoteType $vote
 * @property \Carbon\CarbonInterface $created_at
 */
class ReviewVote extends Model
{
    use HasFactory;

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): \App\Modules\Review\Database\Factories\ReviewVoteFactory
    {
        return \App\Modules\Review\Database\Factories\ReviewVoteFactory::new();
    }

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'review_votes';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'review_id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'review_id',
        'user_id',
        'vote',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'vote' => ReviewVoteType::class,
            'created_at' => 'datetime',
        ];
    }

    /**
     * Review voted on.
     */
    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class, 'review_id');
    }

    /**
     * User who cast the vote.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
