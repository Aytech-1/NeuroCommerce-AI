<?php

declare(strict_types=1);

namespace App\Modules\CMS\Database\Factories;

use App\Modules\CMS\Models\MediaFile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MediaFile>
 */
class MediaFileFactory extends Factory
{
    protected $model = MediaFile::class;

    public function definition(): array
    {
        $filename = fake()->uuid() . '.jpg';

        return [
            'filename' => $filename,
            'original_filename' => fake()->word() . '.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => fake()->numberBetween(10000, 500000),
            'disk' => 'public',
            'path' => 'media/general/' . $filename,
            'url' => 'http://localhost:8000/storage/media/general/' . $filename,
            'alt_text' => fake()->sentence(3),
            'collection' => 'general',
            'uploaded_by' => null,
        ];
    }
}
