<?php

declare(strict_types=1);

namespace App\Modules\Review\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Review\Models\Review;

/**
 * Class ReviewPolicy
 *
 * Authorization policy for customer reviews and moderation actions.
 *
 * @package App\Modules\Review\Policies
 */
class ReviewPolicy
{
    /**
     * Determine whether the user can view any reviews in the admin panel.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('review.view');
    }

    /**
     * Determine whether the user can view a specific review.
     */
    public function view(?User $user, Review $review): bool
    {
        if ($review->is_approved) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        if ($user->id === $review->user_id) {
            return true;
        }

        return $user->hasPermissionTo('review.view');
    }

    /**
     * Determine whether the user can create a review.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('review.create') || $user->isCustomer() || $user->isAdmin();
    }

    /**
     * Determine whether the user can update the review.
     */
    public function update(User $user, Review $review): bool
    {
        return $user->id === $review->user_id;
    }

    /**
     * Determine whether the user can delete the review.
     */
    public function delete(User $user, ?Review $review = null): bool
    {
        if ($user->hasPermissionTo('review.delete')) {
            return true;
        }

        return $review !== null && $user->id === $review->user_id;
    }

    /**
     * Determine whether the user can moderate reviews.
     */
    public function moderate(User $user): bool
    {
        return $user->hasPermissionTo('review.moderate');
    }
}
