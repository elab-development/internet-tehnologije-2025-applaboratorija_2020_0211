<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'code'         => $this->code,
            'description'  => $this->description,
            'budget'       => $this->budget,
            'category'     => $this->category,
            'status'       => $this->status,
            'start_date'   => $this->start_date?->format('Y-m-d'),
            'end_date'     => $this->end_date?->format('Y-m-d'),
            'document_url' => $this->document_url,
            'leader'       => $this->whenLoaded('leader', fn() => [
                'id'   => $this->leader->id,
                'name' => $this->leader->name,
            ]),
            'members' => $this->whenLoaded('members', fn() =>
                $this->members->map(fn($m) => [
                    'id'   => $m->id,
                    'name' => $m->name,
                ])
            ),
        ];
    }
}
