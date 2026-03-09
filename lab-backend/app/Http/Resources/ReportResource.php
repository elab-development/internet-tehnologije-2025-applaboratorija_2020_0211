<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'description' => $this->description,
            'status'      => $this->status,
            'user'        => $this->whenLoaded('user', fn() => [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'email' => $this->user->email,
            ]),
            'project'     => $this->whenLoaded('project', fn() => [
                'id'    => $this->project?->id,
                'title' => $this->project?->title,
            ]),
            'created_at'  => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
