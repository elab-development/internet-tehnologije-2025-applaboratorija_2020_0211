<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'start_time' => $this->start_time?->format('Y-m-d H:i'),
            'end_time'   => $this->end_time?->format('Y-m-d H:i'),
            'purpose'    => $this->purpose,
            'status'     => $this->status,
            'equipment'  => $this->whenLoaded('equipment', fn() => [
                'id'   => $this->equipment->id,
                'name' => $this->equipment->name,
            ]),
            'project'    => $this->whenLoaded('project', fn() => [
                'id'    => $this->project->id,
                'title' => $this->project->title,
            ]),
            'user'       => $this->whenLoaded('user', fn() => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
        ];
    }
}
