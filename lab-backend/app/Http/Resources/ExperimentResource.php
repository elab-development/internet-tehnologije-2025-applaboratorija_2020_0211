<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExperimentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'protocol'       => $this->protocol,
            'date_performed' => $this->date_performed?->format('Y-m-d H:i:s'),
            'status'         => $this->status,
            'project'        => $this->whenLoaded('project', fn() => [
                'id'    => $this->project->id,
                'title' => $this->project->title,
            ]),
        ];
    }
}
