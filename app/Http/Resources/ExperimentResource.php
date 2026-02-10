<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExperimentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,
            'name'=>$this->name,
            'protocol' => $this->protocol,
            'date_performed' => $this->date_performed,
            'status' => $this->status,
            'project'=>new ProjectResource($this->project)
        ];
    }
}
