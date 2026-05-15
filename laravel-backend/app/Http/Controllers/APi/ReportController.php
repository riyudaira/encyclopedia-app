<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use App\Http\Requests\Api\StoreReportRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ReportController extends Controller
{
    public function store(StoreReportRequest $request)
    {
        $validated = $request->validated();
        $request->validate([
            'article_id' => 'required|exists:articles,id',
            'reason' => 'required|string|max:1000',
        ]);

        Report::create([
            'article_id' => $request->article_id,
            'user_id' => Auth::id(),
            'reason' => $request->reason,
        ]);

        return response()->json(['message' => '通報を受け付けました。']);
    }
    public function index()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => '権限がありません'], 403);
        }
        $reports = Report::with('article:id,title')->orderBy('created_at', 'desc')->get();
        return response()->json($reports);
    }
    public function update(Request $request, $id)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $report = Report::findOrFail($id);
        $report->update([
            'status' => 'resolved',
            'admin_comment' => $request->admin_comment
        ]);

        return response()->json($report);
    }
}
