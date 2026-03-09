<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Services\EmailService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private EmailService $email
    ) {}

    public function index(Request $request)
    {
        $reports = Report::with('user', 'project')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->project_id, fn($q) => $q->where('project_id', $request->project_id))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return ReportResource::collection($reports);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => 'required|string',
            'status'      => 'required|in:draft,submitted,reviewed,approved',
            'project_id'  => 'required|exists:projects,id',
        ]);

        $data['user_id'] = $request->user()->id;

        $report = Report::create($data);
        $report->load('user', 'project');

        $this->email->sendReportSubmitted($report);

        return response()->json(['message' => 'Izveštaj uspešno kreiran.', 'data' => new ReportResource($report)], 201);
    }

    public function update(Request $request, Report $report)
    {
        $data = $request->validate([
            'description' => 'sometimes|string',
            'status'      => 'sometimes|in:draft,submitted,reviewed,approved',
        ]);

        $report->update($data);
        $report->load('user', 'project');

        return response()->json(['message' => 'Izveštaj uspešno ažuriran.', 'data' => new ReportResource($report)]);
    }
}
