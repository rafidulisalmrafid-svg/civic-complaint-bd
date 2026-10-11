<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplaintCategory;
use App\Models\ComplaintProblemType;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProblemTypeController extends Controller
{
    public function index(Request $request)
    {
        $categoryId = $request->query('category_id');

        $categories = ComplaintCategory::select('id', 'name_bn', 'name_en')->orderBy('name_bn')->get();

        $query = ComplaintProblemType::with('category');

        if ($categoryId) {
            $query->where('complaint_category_id', $categoryId);
        }

        $problemTypes = $query->orderBy('complaint_category_id')
            ->orderBy('issue_group')
            ->orderBy('display_order')
            ->get();

        return Inertia::render('Admin/ProblemTypes/Index', [
            'problemTypes' => $problemTypes,
            'categories' => $categories,
            'selectedCategoryId' => $categoryId ? (int)$categoryId : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'complaint_category_id' => 'required|exists:complaint_categories,id',
            'issue_group' => 'required|string|max:50',
            'name_bn' => 'required|string|max:200',
            'name_en' => 'required|string|max:200',
            'severity_level' => 'required|in:low,medium,high,critical',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $item = ComplaintProblemType::create($validated);

        AuditLog::logEvent('problem_type_created', $item, null, $item->toArray());

        return back()->with('success', 'নতুন নির্দিষ্ট সমস্যা ধরন সফলভাবে যুক্ত হয়েছে।');
    }

    public function update(Request $request, ComplaintProblemType $problemType)
    {
        $validated = $request->validate([
            'complaint_category_id' => 'required|exists:complaint_categories,id',
            'issue_group' => 'required|string|max:50',
            'name_bn' => 'required|string|max:200',
            'name_en' => 'required|string|max:200',
            'severity_level' => 'required|in:low,medium,high,critical',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $old = $problemType->toArray();
        $problemType->update($validated);

        AuditLog::logEvent('problem_type_updated', $problemType, $old, $problemType->toArray());

        return back()->with('success', 'সমস্যা ধরনের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।');
    }

    public function destroy(ComplaintProblemType $problemType)
    {
        $problemType->delete();

        return back()->with('success', 'সমস্যা ধরনটি সফলভাবে মুছে ফেলা হয়েছে।');
    }
}
