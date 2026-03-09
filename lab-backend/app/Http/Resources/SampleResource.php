<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SampleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'code'       => $this->code,
            'type'       => $this->type,
            'source'     => $this->source,
            'location'   => $this->location,
            'metadata'   => $this->metadata,
            'experiment' => $this->whenLoaded('experiment', fn() => [
                'id'   => $this->experiment->id,
                'name' => $this->experiment->name,
            ]),
        ];
    }
}
