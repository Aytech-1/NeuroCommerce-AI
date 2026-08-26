<?php

declare(strict_types=1);

namespace App\Modules\Review\Resources;

use App\Modules\Review\Models\ReviewVote;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ReviewVoteResource
 *
 * @mixin ReviewVote
 * @package App\Modules\Review\Resources
 */
class ReviewVoteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'review_id' => $this->review_id,
            'user_id' => $this->user_id,
            'vote' => $this->vote instanceof \BackedEnum ? $this->vote->value : (string) $this->vote,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
